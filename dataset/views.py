import json

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
