from rest_framework import serializers
from payments.models import Wallet
from .models import User

# Serializer hiển thị thông tin User sang React
class UserSerializer(serializers.ModelSerializer):
    wallet_balance = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'avatar', 'bio',
            'is_staff', 'is_superuser', 'wallet_balance',
        ]
        read_only_fields = ['is_staff', 'is_superuser', 'wallet_balance']

    def get_wallet_balance(self, obj):
        wallet, _ = Wallet.objects.get_or_create(user=obj)
        return wallet.balance

# Serializer xử lý dữ liệu Đăng ký
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'buyer')
        )
        return user