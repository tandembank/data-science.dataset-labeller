import csv
from io import StringIO
import json
import tempfile
from time import sleep

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.middleware.csrf import get_token

from .models import Dataset, Label, Datapoint


def index(request):
    return HttpResponse('Hello, this is the API!')


def logged_in(request):
    return HttpResponse('True')


def csrf_token(request):
    data = {
        'csrftoken': get_token(request),
    }
    return JsonResponse(data)


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
                'id':                       dataset.id,
                'name':                     dataset.name,
                'fields':                   fields,
                'labels':                   [{'name': label.name, 'shortcut': label.shortcut, 'id': label.id} for label in dataset.labels.all()],
                'multiple_labels':          dataset.multiple_labels,
                'num_labellings_required':  dataset.num_labellings_required,
                'num_datapoints':           dataset.datapoints.count(),
                'labelling_complete':       dataset.labelling_complete(),
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
            num_labellings_required=data['num_labellings_required']
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
            'id':       dataset.id,
        }
        return JsonResponse(responseData)


def labels(request, dataset_id):
    labels = [{'id': label.id, 'name': label.name, 'shortcut': label.shortcut} for label in Dataset.objects.get(id=dataset_id).labels.all()]
    responseData = {
        'labels': labels
    }
    return JsonResponse(responseData)


def datapoints(request, dataset_id, limit=3):
    dataset = Dataset.objects.get(id=dataset_id)
    result_datapoints = []
    for datapoint in dataset.datapoints_for_user(request.user)[:limit]:
        decoded_data = json.loads(datapoint.data)
        response_datapoint = []
        for key in json.loads(dataset.display_fields):
            response_datapoint.append({
                'key': key,
                'value': decoded_data[key],
            })
        result_datapoints.append(response_datapoint)
    responseData = {
        'datapoints': result_datapoints
    }
    return JsonResponse(responseData)


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