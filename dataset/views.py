from collections import OrderedDict
import csv
from datetime import timedelta
from io import StringIO
import json
import tempfile
from time import sleep

from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from django.middleware.csrf import get_token
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import Dataset, Datapoint, Label, UserLabel


UNDO_WINDOW_SECONDS = 60 * 15


def index(request):
    return HttpResponse('Hello, this is the API!')


def logged_in(request):
    return HttpResponse('True')


def csrf_token(request):
    data = {
        'csrftoken': get_token(request),
    }
    return JsonResponse(data)


@login_required
def datasets(request):
    if request.method == 'GET':
        datasets = []
        for dataset in Dataset.objects.all():
            fields = []
            display_fields = json.loads(dataset.display_fields)
            for field in json.loads(dataset.fields):
                insertField = {
                    'name': field,
                    'sample': '',
                    'selected': False,
                }
                if field in display_fields:
                    insertField['selected'] = True
                fields.append(insertField)

            datasets.append({
                'id':                               str(dataset.id),
                'name':                             dataset.name,
                'fields':                           fields,
                'labels':                           [{'name': label.name, 'shortcut': label.shortcut, 'id': str(label.id)} for label in dataset.labels.all()],
                'multiple_labels':                  dataset.multiple_labels,
                'num_datapoints':                   dataset.datapoints.count(),
                'num_labellings_required':          dataset.num_labellings_required,
                'num_total_labellings_required':    dataset.num_total_labellings_required,
                'num_labellings_completed':         dataset.num_labellings_completed,
                'labelling_complete':               dataset.labelling_complete,
                'created_at':                       dataset.created_at,
                'created_by':                       dataset.created_by.username,
            })

        responseData = {
            'datasets': datasets,
            'count': Dataset.objects.count()
        }
        return JsonResponse(responseData)

    else:  # POST data
        data = json.loads(request.POST['data'])
        id = request.POST.get('id')

        if not id:  # Newly uploaded dataset
            rows = []
            with open(data['temp_path'], 'r', encoding='utf-8') as fp:
                if fp.read(1) == '\ufeff':
                    dialect = 'excel'
                else:
                    fp.seek(0)
                    dialect = csv.Sniffer().sniff(fp.read(1024))

                fp.seek(0)
                reader = csv.DictReader(fp, dialect=dialect)
                for row in reader:
                    rows.append(row)

            dataset = Dataset.objects.create_from_list(
                name=data['name'],
                data=rows,
                display_fields=json.dumps(data['display_fields']),
                num_labellings_required=data['num_labellings_required'],
                created_by=request.user
            )
            dataset.save()

            for i, label in enumerate(data['labels']):
                Label.objects.create(
                    dataset=dataset,
                    name=label['name'],
                    shortcut=label['shortcut'],
                    index=i)

        else:  # Editing exising dataset (has id)
            dataset = Dataset.objects.get(id=id)
            dataset.name = data['name']
            dataset.display_fields = json.dumps(data['display_fields'])
            dataset.num_labellings_required = data['num_labellings_required']
            dataset.save()

            for label_data in data['labels']:
                if 'id' in label_data:
                    label = Label.objects.get(id=label_data['id'])
                    if label_data['name'] != label.name or label_data['shortcut'] != label.shortcut:
                        label.name = label_data['name']
                        label.shortcut = label_data['shortcut']
                        label.save()

        responseData = {
            'status':   'OK',
            'id':       str(dataset.id),
        }
        return JsonResponse(responseData)


@login_required
def labels(request, dataset_id):
    labels = [{'id': str(label.id), 'name': label.name, 'shortcut': label.shortcut} for label in Dataset.objects.get(id=dataset_id).labels.all()]
    responseData = {
        'labels': labels
    }
    return JsonResponse(responseData)


@login_required
def datapoints(request, dataset_id, limit=5):
    dataset = Dataset.objects.get(id=dataset_id)
    result_datapoints = []
    for datapoint in dataset.datapoints_for_user(request.user, limit=limit):
        datapoint_data = json.loads(datapoint.data)
        features = []
        for fieldname in json.loads(dataset.display_fields):
            value = datapoint_data[fieldname]
            try:
                value = json.loads(value)
            except:
                pass
            features.append({
                'key': fieldname,
                'value': value,
            })
        response_datapoint = {
            'id': str(datapoint.id),
            'data': features,
        }
        result_datapoints.append(response_datapoint)
    responseData = {
        'datapoints': result_datapoints,
    }
    return JsonResponse(responseData)


@csrf_exempt
def assign_label(request, datapoint_id):
    label_id = request.POST['label_id']

    # User is allowed to undo and re-label a Datapoint as long as it's within the time window
    UserLabel.objects.filter(
        user=request.user,
        datapoint_id=datapoint_id,
        created_at__gte=timezone.now() - timedelta(seconds=UNDO_WINDOW_SECONDS)
    ).delete()

    # If the assertion failes then the user must have previously labelled the Datapoint outside time window
    assert UserLabel.objects.filter(user=request.user, datapoint_id=datapoint_id).count() == 0

    # Make sure there are labellings remaining
    assert Datapoint.objects.get(id=datapoint_id).num_labellings_remaining > 0

    # Assign the actual label
    UserLabel.objects.create(user=request.user, datapoint_id=datapoint_id, label_id=label_id)
    responseData = {
        'status': 'OK',
    }
    return JsonResponse(responseData)


@login_required
def csv_upload(request):
    # Read and detect CSV format
    file = request.FILES['file']
    fp = StringIO(file.read().decode('utf-8'))

    if fp.read(1) == '\ufeff':
        dialect = 'excel'
    else:
        fp.seek(0)
        dialect = csv.Sniffer().sniff(fp.read(1024))

    # Extract column names
    fp.seek(0)
    reader = csv.DictReader(fp, dialect=dialect)
    fields = reader.fieldnames
    num_datapoints = sum([1 for row in reader])

    # Extract first for of data as samples
    fp.seek(0)
    reader = csv.DictReader(fp, dialect=dialect)
    samples = []
    for row in reader:
        for field in fields:
            samples.append(row[field])
        break

    # Save CSV file to temporary location
    file.seek(0)
    temp_path = tempfile.NamedTemporaryFile().name
    with open(temp_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    if fields:
        data = {
            'status':           'OK',
            'fields':           fields,
            'samples':          samples,
            'num_datapoints':   num_datapoints,
            'temp_path':        temp_path,
        }
    return JsonResponse(data)


@login_required
def csv_download(request, dataset_id):
    dataset = Dataset.objects.get(id=dataset_id)
    response = StreamingHttpResponse(streaming_csv_generator(dataset), content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="{}.csv"'.format(dataset.name)
    response['Content-Language'] = 'en'
    return response


def streaming_csv_generator(dataset):
    # Generator for streaming the CSV file in chunks

    # Write CSV header to buffer
    fp = StringIO()
    fields = json.loads(dataset.fields)
    ordered_fieldnames = [(fieldname, None) for fieldname in fields]
    ordered_fieldnames.append(('Label', None))
    ordered_fieldnames = OrderedDict(ordered_fieldnames)
    dw = csv.DictWriter(fp, delimiter=',', fieldnames=ordered_fieldnames)
    dw.writeheader()

    # Write rows of Datapoints to buffer
    for datapoint in dataset.datapoints.all():
        data = json.loads(datapoint.data)
        data['Label'] = datapoint.label_determined()
        dw.writerow(data)

        if fp.tell() > 4096:
            # Buffer has reached 4KB so reset it and yield it's contents
            fp.seek(0)
            content = fp.read()
            fp.seek(0)
            fp.truncate()
            yield content

    # Yeild the remainder of the buffer
    fp.seek(0)
    yield fp.read()
