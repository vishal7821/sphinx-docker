from django.db import models

"""
# Create your models here.
class User(models.Model):
    username = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=12)
    email = models.EmailField(max_length=70)
    department = models.CharField(max_length=30)
    password = models.CharField(max_length=100)
    last_login = models.DateTimeField(blank=True)
    created_by = models.ForeignKey("self",on_delete=models.SET_NULL)
    updated_by = models.ForeignKey("self",on_delete=models.SET_NULL)
    is_deleted = models.DateTimeField(blank=True)
    courses = models.ManyToManyField('Course',through='Enrollment',through_fields=('user', 'course'),)

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'auth_user'


class Course(models.Model):
    name = models.CharField(max_length=50)
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    semester = models.CharField(max_length=50)
    year = models.IntegerField(max_length=50)
    department = models.CharField(max_length=50)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'auth_course'


class Role(models.Model):
    name = models.CharField()  # student , instructor, grader, tutors
    action_permissions = models.ManyToManyField('Action', through_fields = ('role', 'action'),)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'auth_role'


class Enrollment(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    course = models.ForeignKey(Course,on_delete=models.CASCADE)
    date_joined = models.DateField(default=None)
    role = models.ForeignKey(Role,on_delete=models.CASCADE)

    class Meta:
        db_table = 'auth_enrollment'

class Action(models.Model):
    name = models.CharField()#assignment(read , update, delete , create) , user(read , update, delete, create)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'auth_action'


class Permission(models.Model):
    role = models.ForeignKey(Role,on_delete=models.CASCADE)
    action = models.ForeignKey(Action,on_delete=models.CASCADE)

    class Meta:
        db_table = 'auth_permission'


    """""