from django.contrib import admin
from .models import Category, Product3D

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product3D)
class Product3DAdmin(admin.ModelAdmin):
    list_display = ['title', 'artist', 'price', 'category', 'created_at', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}