from django.core.management.base import BaseCommand
from django.utils.text import slugify

from library.models import Category, Collection, Model3D


DEMO_MODELS = [
    ("Mossy Guardian", "Mina K.", "Characters", "https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=1000&q=85", 2400, 18200, True),
    ("The Quiet Between", "Noah Rivera", "Architecture", "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1000&q=85", 1800, 12600, False),
    ("Orbital Study 04", "Studio Nami", "Abstract", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=85", 986, 8100, False),
    ("Solstice — 1987", "Theo Park", "Vehicles", "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=85", 3100, 24800, False),
    ("Ritual of Bloom", "Ada Okafor", "Characters", "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=85", 742, 6400, False),
    ("After the Rain", "Ivo Martins", "Architecture", "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85", 1200, 10300, False),
    ("Soft Machinery", "Luca D.", "Abstract", "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=85", 563, 4700, False),
    ("Little Red Runner", "Marta S.", "Vehicles", "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85", 2000, 16900, False),
]


class Command(BaseCommand):
    help = "Create sample categories, models, and collections for 3DLibrary."

    def handle(self, *args, **options):
        category_map = {}
        for name in ("Characters", "Architecture", "Abstract", "Vehicles", "Nature"):
            category, _ = Category.objects.get_or_create(slug=slugify(name), defaults={"name": name})
            category_map[name] = category

        model_map = {}
        for title, creator, category_name, thumbnail, likes, views, featured in DEMO_MODELS:
            model, _ = Model3D.objects.update_or_create(
                slug=slugify(title),
                defaults={
                    "title": title,
                    "creator": creator,
                    "category": category_map[category_name],
                    "thumbnail_url": thumbnail,
                    "likes": likes,
                    "views": views,
                    "featured": featured,
                    "description": f"A community 3D study by {creator}.",
                },
            )
            model_map[title] = model

        collections = [
            ("Worlds to get lost in", "Curated by 3DLibrary", "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=950&q=85", ["Mossy Guardian", "The Quiet Between", "After the Rain"]),
            ("Objects with a past", "Curated by Jules M.", "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=950&q=85", ["Solstice — 1987", "Little Red Runner"]),
            ("A softer kind of future", "Curated by 3DLibrary", "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=950&q=85", ["Orbital Study 04", "Soft Machinery", "Ritual of Bloom"]),
        ]
        for title, curator, thumbnail, model_titles in collections:
            collection, _ = Collection.objects.get_or_create(
                slug=slugify(title),
                defaults={"title": title, "curator": curator, "thumbnail_url": thumbnail, "featured": True},
            )
            collection.models.set(model_map[name] for name in model_titles)

        self.stdout.write(self.style.SUCCESS("Demo content is ready."))
