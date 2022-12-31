# Generated by Django 2.1.8 on 2019-06-19 07:11

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Action',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deleted', models.DateTimeField(editable=False, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('created_by', models.CharField(max_length=100, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('updated_by', models.CharField(max_length=100, null=True)),
                ('deleted_by', models.CharField(blank=True, max_length=100, null=True)),
                ('app', models.CharField(max_length=100, null=True)),
                ('url', models.CharField(max_length=100, null=True)),
                ('method', models.CharField(max_length=100, null=True)),
            ],
            options={
                'db_table': 'actions',
            },
        ),
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deleted', models.DateTimeField(editable=False, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('created_by', models.CharField(max_length=100, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('updated_by', models.CharField(max_length=100, null=True)),
                ('deleted_by', models.CharField(blank=True, max_length=100, null=True)),
                ('name', models.CharField(max_length=50)),
                ('title', models.CharField(max_length=50)),
                ('description', models.CharField(max_length=200, null=True)),
                ('semester', models.CharField(max_length=50, null=True)),
                ('year', models.IntegerField(null=True)),
                ('department', models.CharField(max_length=50, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('image_directory', models.CharField(max_length=100, null=True)),
            ],
            options={
                'db_table': 'courses',
            },
        ),
        migrations.CreateModel(
            name='GlobalLogs',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deleted', models.DateTimeField(editable=False, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('created_by', models.CharField(max_length=100, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('updated_by', models.CharField(max_length=100, null=True)),
                ('deleted_by', models.CharField(blank=True, max_length=100, null=True)),
                ('is_logged_in', models.BooleanField(default=True)),
                ('user_id', models.CharField(max_length=100, null=True)),
                ('ip', models.CharField(max_length=50, null=True)),
                ('app', models.CharField(max_length=50, null=True)),
                ('url', models.IntegerField(null=True)),
                ('method', models.CharField(max_length=50, null=True)),
                ('meta', models.CharField(max_length=500, null=True)),
                ('file_path', models.CharField(max_length=200, null=True)),
            ],
            options={
                'db_table': 'global_logs',
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deleted', models.DateTimeField(editable=False, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('created_by', models.CharField(max_length=100, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('updated_by', models.CharField(max_length=100, null=True)),
                ('deleted_by', models.CharField(blank=True, max_length=100, null=True)),
                ('username', models.CharField(max_length=100, unique=True)),
                ('roll_no', models.CharField(max_length=12, null=True)),
                ('first_name', models.CharField(max_length=100, null=True)),
                ('last_name', models.CharField(max_length=100, null=True)),
                ('email', models.EmailField(max_length=70, unique=True)),
                ('department', models.CharField(max_length=50, null=True)),
                ('program', models.CharField(max_length=30, null=True)),
                ('password', models.CharField(max_length=100, null=True)),
                ('last_login', models.DateTimeField(null=True)),
                ('last_login_ip', models.CharField(max_length=100, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_enabled', models.BooleanField(default=True)),
                ('is_logged_in', models.BooleanField(default=False)),
                ('password_reset_token', models.CharField(max_length=100, null=True)),
                ('session_id', models.CharField(max_length=100, null=True)),
            ],
            options={
                'db_table': 'users',
            },
        ),
        migrations.CreateModel(
            name='UserHasCourses',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('deleted', models.DateTimeField(editable=False, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('created_by', models.CharField(max_length=100, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('updated_by', models.CharField(max_length=100, null=True)),
                ('deleted_by', models.CharField(blank=True, max_length=100, null=True)),
                ('enrollment_id', models.BigIntegerField(null=True)),
                ('enrollment_role_id', models.BigIntegerField(null=True)),
                ('enrollment_action_list', models.CharField(max_length=300, null=True)),
                ('enrollment_section_list', models.CharField(max_length=300, null=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='authentication.Course')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='authentication.User')),
            ],
            options={
                'db_table': 'user_has_courses',
            },
        ),
        migrations.AddField(
            model_name='user',
            name='courses',
            field=models.ManyToManyField(through='authentication.UserHasCourses', to='authentication.Course'),
        ),
    ]