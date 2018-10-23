import csv
from io import StringIO
import json
from time import sleep

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.middleware.csrf import get_token

from .models import Dataset


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
    datasets = []
    for dataset in Dataset.objects.all():
        datasets.append({
            'id':                   dataset.id,
            'name':                 dataset.name,
            'columns':              json.loads(dataset.columns),
            'display_columns':      json.loads(dataset.display_columns),
            'num_user_labels':      dataset.num_user_labels,
            'num_datapoints':       dataset.datapoints.count(),
            'labelling_complete':   dataset.labelling_complete(),
        })

    data = {
        'datasets': datasets,
        'count': Dataset.objects.count()
    }
    return JsonResponse(data)


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

    if fields:
        data = {
            'status': 'OK',
            # 'path': file.temporary_file_path(),
            'fields': fields,
            'samples': samples,
            'num_datapoints': num_datapoints,
        }
    return JsonResponse(data)