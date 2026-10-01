import os
import json
import mercadopago
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from .models import UserProfile
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

# Configuração do Mercado Pago
ACCESS_TOKEN = os.environ.get("MERCADOPAGO_ACCESS_TOKEN", "TEST-1234567890-SIMULACAO")
sdk = mercadopago.SDK(ACCESS_TOKEN)

# ==========================================
# VIEWS DE RENDERIZAÇÃO DO FRONTEND (HTML)
# ==========================================

def index_view(request):
    return render(request, 'index.html', {})

def login_view(request):
    return render(request, 'login.html', {})

def tenis_view(request):
    return render(request, 'tenis.html', {})

def camisetas_view(request):
    return render(request, 'camisetas.html', {})

def blusas_view(request):
    return render(request, 'blusasecnjs.html', {})

def acessorios_view(request):
    return render(request, 'acesorrios.html', {})

def carrinho_view(request):
    return render(request, 'carrinho.html', {})

def perfil_view(request):
    return render(request, 'perfil.html', {})

def produtos_view(request):
    return render(request, 'produtos.html', {})


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
def enviar_email_pedido(request):
    """Endpoint para enviar o email de confirmação com aviso de rastreio por telemóvel"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            nome = data.get('nome', 'Cliente')
            itens = data.get('itens', [])
            total = data.get('total', 'R$ 0,00')

            if not email:
                return JsonResponse({'error': 'Email não fornecido.'}, status=400)

            itens_texto = "\n".join([f"- {item.get('title')} (Tamanho: {item.get('tamanho', 'Único')}) - {item.get('price')}" for item in itens])
            
            assunto = "Confirmação de Pedido — Neves Store 🚀"
            mensagem = (
                f"Olá, {nome}!\n\n"
                f"Recebemos o seu pedido na Neves Store e já estamos a preparar tudo com muito cuidado!\n\n"
                f"📦 Itens comprados:\n{itens_texto}\n\n"
                f"💰 Valor Total: {total}\n\n"
                f"🚚 Importante: O seu produto será enviado diretamente do nosso centro de distribuição em São Paulo com prazo estimado de 2 a 4 dias úteis. "
                f"Assim que for despachado, o seu código de rastreio será enviado diretamente para o número de telemóvel cadastrado na sua conta!\n\n"
                f"Obrigado por comprar com a Neves Store!"
            )

            send_mail(
                assunto,
                mensagem,
                getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@nevesstore.com'),
                [email],
                fail_silently=False,
            )

            return JsonResponse({'message': 'Email de confirmação enviado com sucesso!'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Método não permitido.'}, status=405)


@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            senha = data.get('senha')

            try:
                user_obj = User.objects.filter(email=email).first()
                if not user_obj:
                    raise User.DoesNotExist
                user = authenticate(username=user_obj.username, password=senha)
            except User.DoesNotExist:
                user = None

            if user is not None:
                profile, _ = UserProfile.objects.get_or_create(user=user)

                return JsonResponse({
                    'token': 'django-session-token',
                    'usuario': {
                        'nome': user.first_name or user.username,
                        'sobrenome': user.last_name or '',
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
                return JsonResponse({'error': 'E-mail ou palavra-passe incorretos.'}, status=400)
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
                first_name=nome,
                last_name=data.get('sobrenome', '')
            )

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

            return JsonResponse({'message': 'Utilizador registado com sucesso!'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Método não permitido.'}, status=405)


@csrf_exempt
def api_atualizar_perfil(request):
    if request.method == 'GET':
        email = request.GET.get('email')
        if not email:
            return JsonResponse({'error': 'E-mail não fornecido.'}, status=400)

        try:
            user = User.objects.filter(email=email).first()
            if not user:
                raise User.DoesNotExist
            profile, _ = UserProfile.objects.get_or_create(user=user)

            return JsonResponse({
                'nome': user.first_name,
                'sobrenome': user.last_name,
                'email': user.email,
                'telefone': profile.telefone or '',
                'cep': profile.cep or '',
                'rua': profile.rua or '',
                'numero': profile.numero or '',
                'bairro': profile.bairro or '',
                'cidade': profile.cidade or '',
                'estado': profile.estado or ''
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'Utilizador não encontrado.'}, status=404)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')

            if not email:
                return JsonResponse({'error': 'E-mail é obrigatório.'}, status=400)

            user = User.objects.filter(email=email).first()
            if not user:
                return JsonResponse({'error': 'Utilizador não encontrado.'}, status=404)
                
            profile, _ = UserProfile.objects.get_or_create(user=user)

            if 'nome' in data:
                user.first_name = data['nome']
            if 'sobrenome' in data:
                user.last_name = data['sobrenome']
            user.save()

            profile.telefone = data.get('telefone', profile.telefone)
            profile.cep = data.get('cep', profile.cep)
            profile.rua = data.get('rua', profile.rua or data.get('endereco', profile.rua))
            profile.numero = data.get('numero', profile.numero)
            profile.bairro = data.get('bairro', profile.bairro)
            profile.cidade = data.get('cidade', profile.cidade)
            profile.estado = data.get('estado', profile.estado)
            profile.save()

            return JsonResponse({'message': 'Perfil atualizado com sucesso no banco!'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Método não permitido.'}, status=405)


@csrf_exempt
def api_esqueci_senha(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')

            if not email:
                return JsonResponse({'error': 'Por favor, informe o seu e-mail.'}, status=400)

            user = User.objects.filter(email=email).first()
            if user:
                # Gera o token de segurança do Django para o utilizador
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                # Link de recuperação (podes ajustar para o domínio do teu site quando estiver no ar)
                link_recuperacao = f"http://127.0.0.1:8000/redefinir-senha/?uid={uid}&token={token}"

                assunto = "Recuperação de Palavra-passe — Neves Store 🔒"
                mensagem = (
                    f"Olá, {user.first_name or 'Cliente'}!\n\n"
                    f"Recebemos um pedido para redefinir a palavra-passe da sua conta na Neves Store.\n\n"
                    f"Clique no link abaixo para criar uma nova palavra-passe:\n"
                    f"{link_recuperacao}\n\n"
                    f"Se não foi você que pediu, pode ignorar este e-mail com segurança.\n\n"
                    f"Equipa Neves Store"
                )

                send_mail(
                    assunto,
                    mensagem,
                    'nevesstoreoficial01@gmail.com',
                    [email],
                    fail_silently=False,
                )

            # Por segurança, retornamos sucesso mesmo se o e-mail não existir (evita que descubram cadastros)
            return JsonResponse({'message': 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Método não permitido.'}, status=405)