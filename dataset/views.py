from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.middleware.csrf import get_token


def index(request):
    return HttpResponse('Hello, this is the API!')


def logged_in(request):
    return HttpResponse('True')


def csrf_token(request):
    data = {
        'csrftoken': get_token(request),
    }
    return JsonResponse(data)
