from rest_framework import serializers
from .models import Category, Product3D

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class Product3DSerializer(serializers.ModelSerializer):
    artist = serializers.ReadOnlyField(source='artist.username')
    creator = serializers.ReadOnlyField(source='artist.username')
    artist_name = serializers.ReadOnlyField(source='artist.username')
    category_name = serializers.ReadOnlyField(source='category.name')
    thumbnail_url = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    views = serializers.SerializerMethodField()

    class Meta:
        model = Product3D
        fields = [
            'id', 'artist', 'creator', 'artist_name', 'category', 'category_name',
            'title', 'slug', 'description', 'price', 'thumbnail_url', 'image',
            'preview_file', 'thumbnail', 'polygon_count', 'file_format', 'likes', 'views',
            'created_at'
        ]
        extra_kwargs = {'artist': {'read_only': True}, 'category': {'read_only': True}}

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.url
        return ''

    def get_image(self, obj):
        return self.get_thumbnail_url(obj)

    def get_likes(self, obj):
        return 0

    def get_views(self, obj):
        return 0