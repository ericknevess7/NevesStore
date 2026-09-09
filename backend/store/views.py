import os
import json
import mercadopago
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

ACCESS_TOKEN = os.environ.get("MERCADOPAGO_ACCESS_TOKEN", "TEST-1234567890-SIMULACAO")
sdk = mercadopago.SDK(ACCESS_TOKEN)

@csrf_exempt
def create_preference(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            # Se for chave de simulação, retorna um ID fictício para testes
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