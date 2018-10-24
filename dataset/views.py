import csv
from io import StringIO
import json
import tempfile
from time import sleep

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.middleware.csrf import get_token

from .models import Dataset, Label


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
            datasets.append({
                'id':                   dataset.id,
                'name':                 dataset.name,
                'fields':               json.loads(dataset.fields),
                'display_fields':       json.loads(dataset.display_fields),
                'num_labellings_required':  dataset.num_labellings_required,
                'num_datapoints':       dataset.datapoints.count(),
                'labelling_complete':   dataset.labelling_complete(),
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
            display_fields=data['display_fields'],
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