# Generated by Django 2.1.2 on 2018-11-08 16:50

from django.conf import settings
from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('dataset', '0003_auto_20181029_1102'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserDatapointClaim',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(blank=True)),
                ('updated_at', models.DateTimeField(blank=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AlterModelOptions(
            name='datapoint',
            options={'ordering': ['index']},
        ),
        migrations.AlterModelOptions(
            name='dataset',
            options={'ordering': ['created_at']},
        ),
        migrations.AlterModelOptions(
            name='label',
            options={'ordering': ['index']},
        ),
        migrations.AddField(
            model_name='userdatapointclaim',
            name='datapoint',
            field=models.ForeignKey(on_delete='CASCADE', related_name='user_claims', to='dataset.Datapoint'),
        ),
        migrations.AddField(
            model_name='userdatapointclaim',
            name='user',
            field=models.ForeignKey(on_delete='CASCADE', to=settings.AUTH_USER_MODEL),
        ),
    ]
