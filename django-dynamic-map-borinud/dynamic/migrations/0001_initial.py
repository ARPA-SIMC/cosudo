# Generated by Django 2.2.13 on 2020-11-28 17:07

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Alarm',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('var', models.CharField(max_length=6)),
                ('trange', models.CharField(max_length=20)),
                ('level', models.CharField(max_length=20)),
                ('ident', models.CharField(max_length=20, null=True)),
                ('network', models.CharField(max_length=20)),
                ('lon', models.CharField(max_length=20)),
                ('lat', models.CharField(max_length=20)),
                ('status', models.CharField(choices=[('a', 'Active'), ('d', 'Disabled')], max_length=1)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Edit',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('type', models.CharField(choices=[('i', 'Invalidation'), ('v', 'Validation')], max_length=1)),
                ('startDate', models.DateTimeField(blank=True, null=True)),
                ('finalDate', models.DateTimeField(blank=True, null=True)),
                ('data_type', models.CharField(choices=[('s', 'Station'), ('d', 'Data')], default='d', max_length=1)),
            ],
        ),
        migrations.CreateModel(
            name='Permissions',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            options={
                'permissions': [('can_extract', 'Allowed to extract grib')],
            },
        ),
        migrations.CreateModel(
            name='StationEdit',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('var', models.CharField(max_length=6)),
                ('trange', models.CharField(max_length=20)),
                ('level', models.CharField(max_length=20)),
                ('ident', models.CharField(max_length=20, null=True)),
                ('network', models.CharField(max_length=20)),
                ('lon', models.CharField(max_length=20)),
                ('lat', models.CharField(max_length=20)),
                ('startDate', models.DateTimeField()),
                ('finalDate', models.DateTimeField(blank=True, null=True)),
                ('edit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dynamic.Edit')),
            ],
        ),
        migrations.CreateModel(
            name='DataEdit',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('var', models.CharField(max_length=6)),
                ('trange', models.CharField(max_length=20)),
                ('level', models.CharField(max_length=20)),
                ('ident', models.CharField(max_length=20, null=True)),
                ('network', models.CharField(max_length=20)),
                ('lon', models.CharField(max_length=20)),
                ('lat', models.CharField(max_length=20)),
                ('date', models.DateTimeField()),
                ('edit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='dynamic.Edit')),
            ],
        ),
    ]