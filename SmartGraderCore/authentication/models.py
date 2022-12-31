from django.db import models
from helper.models import SafeDeleteAndAuditDetailsModel
from django.contrib.auth.hashers import make_password
from django.utils.crypto import get_random_string
from helper.related import SpanningForeignKey
from safedelete.models import HARD_DELETE_NOCASCADE


# TODO: change null required fields as required
class User(SafeDeleteAndAuditDetailsModel):
    username = models.CharField(max_length=100, unique=True)
    roll_no = models.CharField(max_length=12, null=True)
    first_name = models.CharField(max_length=100, null=True)
    last_name = models.CharField(max_length=100, null=True)
    email = models.EmailField(max_length=70, unique=True)
    department = models.CharField(max_length=50, null=True)
    program = models.CharField(max_length=30, null=True)
    password = models.CharField(max_length=100, null=True)
    last_login = models.DateTimeField(null=True)
    last_login_ip = models.CharField(max_length=100, null=True)
    is_active = models.BooleanField(default=True)
    is_enabled = models.BooleanField(default=True)
    is_logged_in = models.BooleanField(default=False)
    password_reset_token = models.CharField(max_length=100,null=True)
    session_id = models.CharField(max_length=100, null=True)
    courses = models.ManyToManyField('Course', through='UserHasCourses', through_fields=('user', 'course'),)

    def __str__(self):
        return self.username

    # call separately set password before saving or updating password field of user
    def set_password(self, password):
        self.password = make_password(password)

    class Meta:
        db_table = 'users'


class Course(SafeDeleteAndAuditDetailsModel):
    name = models.CharField(max_length=50)
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=200,null=True)
    semester = models.CharField(max_length=50,null=True)
    year = models.IntegerField(null=True)
    department = models.CharField(max_length=50,null=True)
    is_active = models.BooleanField(default=True)
    image_directory = models.CharField(max_length=100,null=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'courses'


class UserHasCourses(SafeDeleteAndAuditDetailsModel):
    _safedelete_policy = HARD_DELETE_NOCASCADE
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrollment_id = models.BigIntegerField(null=True)
    enrollment_role_id = models.BigIntegerField(null=True)
    enrollment_action_list = models.CharField(max_length=300, null=True)
    enrollment_section_list = models.CharField(max_length=300, null=True)

    class Meta:
        db_table = 'user_has_courses'


class Action(SafeDeleteAndAuditDetailsModel):
    app = models.CharField(max_length=100, null=True)
    url = models.CharField(max_length=100, null=True)
    method = models.CharField(max_length=100, null=True)

    def __str__(self):
        return self.url

    class Meta:
        db_table = 'actions'


class GlobalLogs(SafeDeleteAndAuditDetailsModel):
    is_logged_in = models.BooleanField(default=True)
    user_id = models.CharField(max_length=100, null=True)
    ip = models.CharField(max_length=50, null=True)
    app = models.CharField(max_length=50, null=True)
    url = models.IntegerField( null=True)
    method = models.CharField(max_length=50, null=True)
    meta = models.CharField(max_length=500, null=True)
    file_path = models.CharField(max_length=200, null=True)

    def __str__(self):
        return self

    class Meta:
        db_table = 'global_logs'

