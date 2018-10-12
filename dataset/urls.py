from django.contrib.auth.decorators import login_required
from django.urls import path

from . import views


urlpatterns = [
    path('api/logged-in/', login_required(views.logged_in), name='logged-in'),
    # path('', views.index, name='index'),
]