from django.http import JsonResponse
from django.urls import path
from .views import CreateOrderView, UserOrderListView

def payment_index(request):
    return JsonResponse({"message": "Payments API is ready."})


app_name = 'payments'

urlpatterns = [
    path('', payment_index, name='index'),
    path('checkout/', CreateOrderView.as_view(), name='checkout'),
    path('my-orders/', UserOrderListView.as_view(), name='user_orders'),
]