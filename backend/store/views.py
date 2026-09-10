import os
import json
import mercadopago
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import UserProfile

# Configuração do Mercado Pago
ACCESS_TOKEN = os.environ.get("MERCADOPAGO_ACCESS_TOKEN", "TEST-1234567890-SIMULACAO")
sdk = mercadopago.SDK(ACCESS_TOKEN)

# ==========================================
# VIEWS DE RENDERIZAÇÃO DO FRONTEND (HTML)
# ==========================================

def index_view(request):
    return render(request, 'index.html')

def login_view(request):
    return render(request, 'login.html')

def tenis_view(request):
    return render(request, 'tenis.html')

def camisetas_view(request):
    return render(request, 'camisetas.html')

def blusas_view(request):
    return render(request, 'blusasecnjs.html')

def acessorios_view(request):
    return render(request, 'acesorrios.html')

def carrinho_view(request):
    return render(request, 'carrinho.html')

def perfil_view(request):
    return render(request, 'perfil.html')


# ==========================================
# ENDPOINTS DA API (AUTENTICAÇÃO E PAGAMENTO)
# ==========================================

@csrf_exempt
def create_preference(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            if "SIMULACAO" in ACCESS_TOKEN:
                return JsonResponse({
                    "id": "123456789-fake-preference-id",
                    "init_point": "https://www.mercadopago.com.br"
                })

            preference_data = {
                "items": [
                    {
                        "title": data.get("title", "Produto NevesStore"),
                        "quantity": int(data.get("quantity", 1)),
                        "unit_price": float(data.get("price", 10.0)),
                        "currency_id": "BRL"
                    }
                ]
            }

            preference_response = sdk.preference().create(preference_data)
            preference = preference_response["response"]

            return JsonResponse({"id": preference["id"], "init_point": preference["init_point"]})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            senha = data.get('senha')

            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(username=user_obj.username, password=senha)
            except User.DoesNotExist:
                user = None

            if user is not None:
                # Recupera o perfil ou cria se não existir
                profile, _ = UserProfile.objects.get_or_create(user=user)

                return JsonResponse({
                    'token': 'django-session-token',
                    'usuario': {
                        'nome': user.first_name or user.username,
                        'email': user.email,
                        'telefone': profile.telefone or '',
                        'cep': profile.cep or '',
                        'rua': profile.rua or '',
                        'numero': profile.numero or '',
                        'bairro': profile.bairro or '',
                        'cidade': profile.cidade or '',
                        'estado': profile.estado or ''
                    }
                })
            else:
                return JsonResponse({'error': 'E-mail ou senha incorretos.'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Método não permitido.'}, status=405)


@csrf_exempt
def api_cadastro(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            senha = data.get('senha')
            nome = data.get('nome')

            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Este e-mail já está cadastrado.'}, status=400)

            user = User.objects.create_user(
                username=email,
                email=email,
                password=senha,
                first_name=nome
            )

            # Cria o perfil com os dados do endereço informados no formulário
            UserProfile.objects.create(
                user=user,
                telefone=data.get('telefone', ''),
                cep=data.get('cep', ''),
                rua=data.get('rua', ''),
                numero=data.get('numero', ''),
                bairro=data.get('bairro', ''),
                cidade=data.get('cidade', ''),
                estado=data.get('estado', '')
            )

            return JsonResponse({'message': 'Usuário cadastrado com sucesso!'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Método não permitido.'}, status=405)


@csrf_exempt
def api_atualizar_perfil(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')

            if not email:
                return JsonResponse({'error': 'E-mail é obrigatório.'}, status=400)

            user = User.objects.get(email=email)
            profile, _ = UserProfile.objects.get_or_create(user=user)

            # Atualiza o nome do usuário
            if 'nome' in data:
                user.first_name = data['nome']
                user.save()

            # Atualiza o endereço e dados no UserProfile
            profile.telefone = data.get('telefone', profile.telefone)
            profile.cep = data.get('cep', profile.cep)
            profile.rua = data.get('rua', profile.rua)
            profile.numero = data.get('numero', profile.numero)
            profile.bairro = data.get('bairro', profile.bairro)
            profile.cidade = data.get('cidade', profile.cidade)
            profile.estado = data.get('estado', profile.estado)
            profile.save()

            return JsonResponse({'message': 'Perfil atualizado com sucesso no banco!'})
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuário não encontrado.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Método não permitido.'}, status=405)