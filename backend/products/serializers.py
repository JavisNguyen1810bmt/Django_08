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
    category_name = serializers.ReadOnlyField(source='category.name', allow_null=True)
    slug = serializers.SlugField(required=False)
    thumbnail_url = serializers.SerializerMethodField()
    model_url = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    views = serializers.SerializerMethodField()
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Product3D
        fields = [
            'id', 'artist', 'creator', 'artist_name', 'category', 'category_name',
            'title', 'slug', 'description', 'price', 'thumbnail_url', 'image',
            'preview_file', 'model_url', 'thumbnail', 'polygon_count', 'file_format', 'likes', 'views',
            'source_file', 'created_at'
        ]
        extra_kwargs = {'artist': {'read_only': True}, 'source_file': {'write_only': True}}

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            return obj.thumbnail.url
        return ''

    def get_image(self, obj):
        return self.get_thumbnail_url(obj)

    def get_model_url(self, obj):
        model_file = obj.preview_file
        if not model_file and obj.source_file:
            extension = obj.source_file.name.rsplit('.', 1)[-1].lower()
            if extension not in {'glb', 'gltf', 'fbx', 'obj'}:
                return ''
            model_file = obj.source_file
        if not model_file:
            return ''
        request = self.context.get('request')
        url = model_file.url
        return request.build_absolute_uri(url) if request else url

    def get_likes(self, obj):
        return 0

    def get_views(self, obj):
        return 0