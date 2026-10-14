import tempfile

from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile

from accounts.models import User
from .models import Category, Product3D


class ProductUploadApiTests(APITestCase):
    def setUp(self):
        self.media_dir = tempfile.TemporaryDirectory()
        media_override = override_settings(MEDIA_ROOT=self.media_dir.name)
        media_override.enable()
        self.addCleanup(media_override.disable)
        self.addCleanup(self.media_dir.cleanup)
        self.user = User.objects.create_user(username='artist', password='test-password')
        self.category = Category.objects.get(slug='robo')
        self.client.force_authenticate(user=self.user)

    def test_authenticated_artist_can_upload_to_a_real_category(self):
        response = self.client.post(
            '/api/models/',
            {
                'title': 'Ninja final 2',
                'category': str(self.category.id),
                'description': 'Test model',
                'price': '0',
                'source_file': SimpleUploadedFile(
                    'ninja-final-2.glb',
                    b'glb test content',
                    content_type='model/gltf-binary',
                ),
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        product = Product3D.objects.get(title='Ninja final 2')
        self.assertEqual(product.artist, self.user)
        self.assertEqual(product.category, self.category)
        self.assertEqual(product.slug, 'ninja-final-2')
        self.assertTrue(product.source_file.name.endswith('ninja-final-2.glb'))

    def test_upload_rejects_a_category_id_that_does_not_exist(self):
        response = self.client.post(
            '/api/models/',
            {
                'title': 'Invalid category model',
                'category': '999999',
                'source_file': SimpleUploadedFile('model.glb', b'glb'),
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
