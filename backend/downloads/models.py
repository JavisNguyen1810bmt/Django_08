from django.conf import settings
from django.db import models
from products.models import Product3D


class Download(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='downloads')
    product = models.ForeignKey(Product3D, on_delete=models.CASCADE, related_name='downloads')
    downloaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-downloaded_at']

    def __str__(self):
        return f"{self.user.username} downloaded {self.product.title}"