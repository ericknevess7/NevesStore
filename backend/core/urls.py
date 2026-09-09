from django.contrib import admin
from django.urls import path
from store.views import create_preference

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/create-preference/', create_preference, name='create_preference'),
]