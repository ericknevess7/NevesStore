from django.contrib import admin
from django.urls import path
from store.views import create_preference, api_login, api_cadastro

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/create-preference/', create_preference, name='create_preference'),
    path('api/auth/login/', api_login, name='api_login'),
    path('api/auth/cadastro/', api_cadastro, name='api_cadastro'),
]