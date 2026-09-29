from django.contrib import admin
from .models import Category, Collection, Model3D


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Model3D)
class Model3DAdmin(admin.ModelAdmin):
    list_display = ("title", "creator", "category", "featured", "likes", "views", "created_at")
    list_filter = ("category", "featured", "license")
    search_fields = ("title", "description", "creator")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("title", "curator", "featured", "created_at")
    list_filter = ("featured",)
    search_fields = ("title", "description", "curator")
    filter_horizontal = ("models",)
    prepopulated_fields = {"slug": ("title",)}
