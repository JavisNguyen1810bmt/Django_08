from django.http import JsonResponse
from django.urls import path
from .views import (
    AdminBuffBalanceView,
    CreateOrderView,
    UserOrderListView,
    WalletView,
)

def payment_index(request):
    return JsonResponse({"message": "Payments API is ready."})


app_name = 'payments'

urlpatterns = [
    path('', payment_index, name='index'),
    path('checkout/', CreateOrderView.as_view(), name='checkout'),
    path('my-orders/', UserOrderListView.as_view(), name='user_orders'),
    path('wallet/', WalletView.as_view(), name='wallet'),
    path('admin-buff-balance/', AdminBuffBalanceView.as_view(), name='admin-buff-balance'),
]