from django.db import models
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product3D(models.Model):
    artist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products'
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # File xem thử (.glb) dùng cho React Three Fiber
    preview_file = models.FileField(upload_to='previews_3d/', null=True, blank=True)
    thumbnail = models.ImageField(upload_to='thumbnails/', null=True, blank=True)
    
    # File gốc (.zip) - bảo mật
    source_file = models.FileField(upload_to='protected_sources/')
    
    polygon_count = models.IntegerField(default=0)
    file_format = models.CharField(max_length=50, default='FBX, OBJ, BLEND')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title