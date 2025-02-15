# Generated by Django 5.1.1 on 2024-09-20 12:20

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Claim',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=255)),
                ('contact_number', models.CharField(max_length=15)),
                ('email_address', models.EmailField(max_length=254)),
                ('incident_date', models.DateField()),
                ('claim_type', models.CharField(max_length=100)),
                ('claim_amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('incident_description', models.TextField()),
                ('policy_number', models.CharField(max_length=50)),
                ('issuer_name', models.CharField(max_length=255)),
                ('payment_method', models.CharField(max_length=50)),
                ('bank_acc_number', models.CharField(max_length=20)),
                ('supporting_document_url', models.URLField()),
                ('incident_photo_url', models.URLField()),
            ],
        ),
    ]
