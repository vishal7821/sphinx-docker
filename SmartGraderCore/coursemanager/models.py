from django.db import models
from helper.models import SafeDeleteAndAuditDetailsModel
from authentication.models import User
from helper.related import SpanningForeignKey
from safedelete.models import HARD_DELETE_NOCASCADE, SOFT_DELETE
# Create your models here.


class Enrollment(SafeDeleteAndAuditDetailsModel):
    _safedelete_policy = SOFT_DELETE
    user = SpanningForeignKey('authentication.User', default=None, null=True, blank=True, verbose_name='User',
                              on_delete=models.CASCADE)
    role = models.ForeignKey('Role', on_delete=models.CASCADE)
    sections = models.ManyToManyField('Section',through='EnrollmentHasSections', through_fields=('enrollment', 'section'))
    subevents = models.ManyToManyField('eventmanager.Subevent', through='eventmanager.UserHasSubevents' ,through_fields=('enrollment','subevent'))

    class Meta:
        db_table = 'enrollments'


class Role(SafeDeleteAndAuditDetailsModel):
    name = models.CharField(max_length=100)  # student , instructor, grader, tutors
    action_list = models.CharField(max_length=500)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'roles'


class Topic(SafeDeleteAndAuditDetailsModel):
    name = models.CharField(max_length=100, unique=True)
    super_topic = models.ForeignKey('Topic', on_delete=models.CASCADE, null=True)
    description = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'topics'


class Section(SafeDeleteAndAuditDetailsModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'sections'


class EnrollmentHasSections(SafeDeleteAndAuditDetailsModel):
    _safedelete_policy = HARD_DELETE_NOCASCADE
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)

    class Meta:
        db_table = 'enrollment_has_sections'


class CourseLog(models.Model):
    is_logged_in = models.BooleanField
    user_id = models.CharField(max_length=100)
    ip = models.CharField(max_length=100)
    app = models.CharField(max_length=100)
    url = models.CharField(max_length=100)
    method = models.CharField(max_length=100)
    file_path = models.CharField(max_length=100)
    flag_id = models.CharField(max_length=100)
    message_id = models.CharField(max_length=100)

    class Meta:
        db_table = 'course_log'




