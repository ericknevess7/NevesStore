import os
import json
import threading
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

ACCESS_TOKEN = getattr(settings, 'MERCADOPAGO_ACCESS_TOKEN', os.environ.get("MERCADOPAGO_ACCESS_TOKEN", ""))
sdk = mercadopago.SDK(ACCESS_TOKEN)


# ==========================================
# FUNÇÃO AUXILIAR: ENVIO DE E-MAIL EM SEGUNDO PLANO
# ==========================================

def enviar_email_async(assunto, mensagem, destinatarios, fail_silently=True):
    """Dispara o e-mail numa thread separada para não causar WORKER TIMEOUT no Render"""
    def _enviar():
        try:
            send_mail(
                assunto,
                mensagem,
                getattr(settings, 'DEFAULT_FROM_EMAIL', 'Neves Store <nevesstoreoficial01@gmail.com>'),
                destinatarios if isinstance(destinatarios, list) else [destinatarios],
                fail_silently=fail_silently,
            )
        except Exception as e:
            print(f"Erro ao enviar e-mail em segundo plano: {e}")

    threading.Thread(target=_enviar).start()


# ==========================================
# VIEWS DE RENDERIZAÇÃO DO FRONTEND
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
# ENDPOINTS DA API
# ==========================================

@csrf_exempt
def create_preference(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            host = request.get_host()
            protocol = 'https' if 'onrender.com' in host or request.is_secure() else 'http'
            site_url = f"{protocol}://{host}"

            preference_data = {
                "items": [
                    {
                        "title": data.get("title", "Compra - Neves Store"),
                        "quantity": int(data.get("quantity", 1)),
                        "unit_price": float(data.get("price", 10.0)),
                        "currency_id": "BRL"
                    }
                ],
                "back_urls": {
                    "success": f"{site_url}/carrinho.html?status=success",
                    "failure": f"{site_url}/carrinho.html?status=failure",
                    "pending": f"{site_url}/carrinho.html?status=pending"
                },
                "auto_return": "approved",
                "notification_url": f"{site_url}/api/webhook/mercadopago/"
            }

            preference_response = sdk.preference().create(preference_data)
            preference = preference_response["response"]

            return JsonResponse({"id": preference["id"], "init_point": preference["init_point"]})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
def webhook_mercadopago(request):
    """Notificação automática do Mercado Pago quando o Pix é pago"""
    if request.method in ["POST", "GET"]:
        try:
            data = json.loads(request.body) if request.body else {}
            payment_id = (
                request.GET.get("id") or 
                request.GET.get("data.id") or 
                data.get("data", {}).get("id")
            )
            topic = request.GET.get("topic") or data.get("type") or request.GET.get("type")

            if payment_id and topic in ["payment", "payment.updated"]:
                payment_info = sdk.payment().get(payment_id)
                payment_data = payment_info.get("response", {})
                
                status = payment_data.get("status")

                if status == "approved":
                    payer_email = payment_data.get("payer", {}).get("email", "Cliente")
                    transaction_amount = payment_data.get("transaction_amount", 0.0)
                    
                    admin_email = getattr(settings, 'ADMIN_EMAIL', '01erickneves01@gmail.com')
                    assunto_admin = f"🔥 NOVO PIX RECEBIDO AUTOMATICAMENTE — R$ {transaction_amount:.2f}"
                    mensagem_admin = (
                        f"PAGAMENTO CONFIRMADO PELO MERCADO PAGO!\n\n"
                        f"💰 Valor: R$ {transaction_amount:.2f}\n"
                        f"📧 E-mail do Pagador: {payer_email}\n"
                        f"🆔 ID da Transação: {payment_id}\n"
                        f"Status: APROVADO VIA WEBHOOK ✅\n\n"
                        f"O valor já caiu na tua conta do Mercado Pago!"
                    )

                    enviar_email_async(assunto_admin, mensagem_admin, admin_email)

            return JsonResponse({"status": "ok"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=200)

    return JsonResponse({"status": "ignored"}, status=200)


@csrf_exempt
def enviar_email_pedido(request):
    """Envia o e-mail de confirmação para o cliente E para o administrador"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email_cliente = data.get('email')
            nome_cliente = data.get('nome', 'Cliente')
            telefone_cliente = data.get('telefone', 'Não informado')
            endereco_cliente = data.get('endereco', 'Não informado')
            itens = data.get('itens', [])
            total = data.get('total', 'R$ 0,00')

            if not email_cliente:
                return JsonResponse({'error': 'Email do cliente não fornecido.'}, status=400)

            # 1. Monta texto para o cliente
            itens_cliente_texto = "\n".join([
                f"- {item.get('title')} | Cor/Modelo: {item.get('cor', 'Padrão')} | Tam: {item.get('tamanho', 'Único')} — {item.get('price')}"
                for item in itens
            ])
            
            assunto_cliente = "Confirmação de Pedido — Neves Store 🚀"
            mensagem_cliente = (
                f"Olá, {nome_cliente}!\n\n"
                f"Recebemos o seu pedido na Neves Store e já estamos a preparar tudo com muito cuidado!\n\n"
                f"📦 Itens comprados:\n{itens_cliente_texto}\n\n"
                f"💰 Valor Total: {total}\n\n"
                f"🚚 Importante: O seu produto será enviado com prazo estimado de 2 a 4 dias úteis.\n\n"
                f"Obrigado por comprar com a Neves Store!"
            )

            enviar_email_async(assunto_cliente, mensagem_cliente, email_cliente, fail_silently=False)

            # 2. Monta e-mail para o ADMIN
            itens_admin_texto = "\n".join([
                f"• Produto: {item.get('title')}\n"
                f"  - Cor/Modelo: {item.get('cor', 'Não especificado')}\n"
                f"  - Tamanho: {item.get('tamanho', 'Único')}\n"
                f"  - Qtd: {item.get('quantidade', 1)}\n"
                f"  - Preço: {item.get('price')}\n"
                f"----------------------------------------"
                for item in itens
            ])

            admin_email = getattr(settings, 'ADMIN_EMAIL', '01erickneves01@gmail.com')
            assunto_admin = f"🔥 NOVA VENDA REALIZADA — {nome_cliente} ({total})"
            mensagem_admin = (
                f"NOVA COMPRA REALIZADA NA NEVES STORE!\n\n"
                f"👤 DADOS DO CLIENTE:\n"
                f"• Nome: {nome_cliente}\n"
                f"• E-mail: {email_cliente}\n"
                f"• Telefone/WhatsApp: {telefone_cliente}\n"
                f"• Endereço: {endereco_cliente}\n\n"
                f"👟 DETALHES DOS PRODUTOS COMPRADOS:\n"
                f"{itens_admin_texto}\n\n"
                f"💰 VALOR TOTAL: {total}\n"
            )

            enviar_email_async(assunto_admin, mensagem_admin, admin_email)

            return JsonResponse({'message': 'E-mails enviados com sucesso!'})
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

            return JsonResponse({'message': 'Usuário cadastrado com sucesso!'})
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
            return JsonResponse({'error': 'Usuário não encontrado.'}, status=404)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')

            if not email:
                return JsonResponse({'error': 'E-mail é obrigatório.'}, status=400)

            user = User.objects.filter(email=email).first()
            if not user:
                return JsonResponse({'error': 'Usuário não encontrado.'}, status=404)
                
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

            return JsonResponse({'message': 'Perfil atualizado com sucesso!'})
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
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                protocol = 'https' if request.is_secure() or 'onrender.com' in request.get_host() else 'http'
                host = request.get_host()
                link_recuperacao = f"{protocol}://{host}/login/?uid={uid}&token={token}"

                assunto = "Recuperação de Senha — Neves Store 🔒"
                mensagem = (
                    f"Olá, {user.first_name or 'Cliente'}!\n\n"
                    f"Recebemos um pedido para redefinir a senha da sua conta na Neves Store.\n\n"
                    f"Clique no link abaixo para criar uma nova senha:\n"
                    f"{link_recuperacao}\n\n"
                    f"Se não solicitou esta alteração, ignore este e-mail.\n\n"
                    f"Atenciosamente,\nEquipe Neves Store"
                )

                enviar_email_async(assunto, mensagem, email, fail_silently=False)

            return JsonResponse({'message': 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Método não permitido.'}, status=405)
