import uuid
from django.db import migrations, models


def verify_existing_users(apps, schema_editor):
    User = apps.get_model('core', 'User')
    User.objects.all().update(is_email_verified=True)


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_project_description_project_location'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_email_verified',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='email_verification_token',
            field=models.UUIDField(blank=True, default=uuid.uuid4, editable=False, null=True),
        ),
        migrations.RunPython(verify_existing_users, migrations.RunPython.noop),
    ]
