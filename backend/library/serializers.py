from rest_framework import serializers
from .models import Category, Collection, Model3D


class CategorySerializer(serializers.ModelSerializer):
    model_count = serializers.IntegerField(source="models.count", read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "model_count"]


class Model3DSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Model3D
        fields = [
            "id", "title", "slug", "description", "creator", "category", "category_name",
            "thumbnail_url", "model_file", "likes", "views", "license", "featured", "created_at",
        ]
        read_only_fields = ["id", "slug", "likes", "views", "created_at"]


class CollectionSerializer(serializers.ModelSerializer):
    model_count = serializers.IntegerField(source="models.count", read_only=True)
    models = Model3DSerializer(many=True, read_only=True)

    class Meta:
        model = Collection
        fields = ["id", "title", "slug", "description", "curator", "thumbnail_url", "models", "model_count", "featured", "created_at"]
