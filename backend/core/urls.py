from django.contrib import admin
from django.urls import path
from store.views import (
    create_preference, 
    api_login, 
    api_cadastro, 
    index_view, 
    login_view,
    tenis_view,
    camisetas_view,
    blusas_view,
    acessorios_view,
    carrinho_view,
    perfil_view
)

urlpatterns = [
    # Páginas Principais
    path('', index_view, name='index'),
    path('index.html', index_view, name='index_html'),
    path('login/', login_view, name='login_page'),
    path('login.html', login_view, name='login_html'),

    # Páginas de Categorias e Navegação
    path('tenis.html', tenis_view, name='tenis'),
    path('camisetas.html', camisetas_view, name='camisetas'),
    path('blusasecnjs.html', blusas_view, name='blusas'),
    path('acesorrios.html', acessorios_view, name='acessorios'),
    path('carrinho.html', carrinho_view, name='carrinho'),
    path('perfil.html', perfil_view, name='perfil'),

    # Painel Administrativo
    path('admin/', admin.site.urls),

    # Endpoints da API
    path('api/create-preference/', create_preference, name='create_preference'),
    path('api/auth/login/', api_login, name='api_login'),
    path('api/auth/cadastro/', api_cadastro, name='api_cadastro'),
]