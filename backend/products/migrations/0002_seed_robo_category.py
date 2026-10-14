from django.db import migrations


def create_robo_category(apps, schema_editor):
    Category = apps.get_model('products', 'Category')
    Category.objects.get_or_create(slug='robo', defaults={'name': 'ROBO'})


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_robo_category, migrations.RunPython.noop),
    ]
