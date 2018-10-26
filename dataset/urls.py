from django.contrib.auth.decorators import login_required
from django.urls import path

from . import views


urlpatterns = [
    path('api/logged-in/', login_required(views.logged_in), name='logged-in'),
    path('api/csrf-token/', views.csrf_token, name='csrf-token'),
    path('api/datasets/', views.datasets, name='datasets'),
    path('api/datapoints/<int:dataset_id>/', views.datapoints, name='datapoints'),
    path('api/labels/<int:dataset_id>/', views.labels, name='labels'),
    path('api/csv-upload/', views.csv_upload, name='csv-upload'),
    path('api/', views.index, name='index'),
]