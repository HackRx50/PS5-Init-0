# Generated by Django 5.1.1 on 2024-09-20 14:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_claim_created_at_claim_prediction_claim_probability_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='claim',
            name='probability',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
