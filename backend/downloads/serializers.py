from rest_framework import serializers
from .models import Download


class DownloadSerializer(serializers.ModelSerializer):
    product_title = serializers.ReadOnlyField(source='product.title')

    class Meta:
        model = Download
        fields = ['id', 'product', 'product_title', 'downloaded_at']