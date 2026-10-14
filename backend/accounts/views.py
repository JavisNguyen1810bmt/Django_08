from rest_framework import generics, permissions
from .models import User
from .serializers import RegisterSerializer, UserSerializer

# API Đăng ký tài khoản mới (Public)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

# API Lấy và Cập nhật Profile của User đang đăng nhập
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user