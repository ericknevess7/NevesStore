from django.contrib import admin
from django.urls import path
from store.views import (
    create_preference, 
    api_login, 
    api_cadastro, 
    index_view, 
    login_view
)

urlpatterns = [
    # Páginas HTML do Frontend
    path('', index_view, name='index'),
    path('index.html', index_view, name='index_html'),
    path('login/', login_view, name='login_page'),
    path('login.html', login_view, name='login_html'),

    # Painel Administrativo
    path('admin/', admin.site.urls),

    # Endpoints da API
    path('api/create-preference/', create_preference, name='create_preference'),
    path('api/auth/login/', api_login, name='api_login'),
    path('api/auth/cadastro/', api_cadastro, name='api_cadastro'),
]