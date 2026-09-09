import os
import json
import mercadopago
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

# Configuração do Mercado Pago
ACCESS_TOKEN = os.environ.get("MERCADOPAGO_ACCESS_TOKEN", "TEST-1234567890-SIMULACAO")
sdk = mercadopago.SDK(ACCESS_TOKEN)

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
                return JsonResponse({
                    'token': 'django-session-token',
                    'usuario': {'nome': user.first_name or user.username, 'email': user.email}
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
            return JsonResponse({'message': 'Usuário cadastrado com sucesso!'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Método não permitido.'}, status=405)

from django.shortcuts import render

def index_view(request):
    return render(request, 'index.html')

def login_view(request):
    return render(request, 'login.html')