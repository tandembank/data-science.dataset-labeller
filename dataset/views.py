import csv
from datetime import timedelta
from io import StringIO
import json
import tempfile
from time import sleep

from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
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

        rows = []
        with open(data['temp_path'], 'r') as fp:
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
    for datapoint in dataset.datapoints_for_user(request.user)[:limit]:
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