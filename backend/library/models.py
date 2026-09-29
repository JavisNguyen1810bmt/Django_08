from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=90, unique=True, blank=True)
    description = models.CharField(max_length=240, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Model3D(models.Model):
    class License(models.TextChoices):
        CC_BY = "CC BY", "Creative Commons Attribution"
        CC_BY_NC = "CC BY-NC", "Creative Commons Attribution-NonCommercial"
        ROYALTY_FREE = "Royalty-free", "Royalty-free"
        ARRANGEMENT = "Arrangement", "See creator's terms"

    title = models.CharField(max_length=140)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    description = models.TextField(blank=True)
    creator = models.CharField(max_length=100)
    category = models.ForeignKey(Category, related_name="models", on_delete=models.PROTECT)
    thumbnail_url = models.URLField(max_length=500, blank=True)
    model_file = models.FileField(upload_to="models/", blank=True)
    likes = models.PositiveIntegerField(default=0)
    views = models.PositiveIntegerField(default=0)
    license = models.CharField(max_length=30, choices=License.choices, default=License.CC_BY)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["category", "-created_at"]), models.Index(fields=["-likes"])]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or "model"
            candidate = base_slug
            suffix = 2
            while Model3D.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{suffix}"
                suffix += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Collection(models.Model):
    title = models.CharField(max_length=140)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    description = models.TextField(blank=True)
    curator = models.CharField(max_length=100, default="3DLibrary")
    thumbnail_url = models.URLField(max_length=500, blank=True)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    models = models.ManyToManyField(Model3D, related_name="collections", blank=True)

    class Meta:
        ordering = ["-featured", "title"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
