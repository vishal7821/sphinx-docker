from django.db import models
from helper.models import SafeDeleteAndAuditDetailsModel
from helper.related import SpanningForeignKey
from coursemanager.models import Enrollment
from assignmentmanager.models import QuestionSet, Question, Assignment , Rubric
from safedelete.models import HARD_DELETE_NOCASCADE

# Create your models here.


class Event(SafeDeleteAndAuditDetailsModel):
    name = models.CharField(max_length=100,default='1')
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE,  null=True, blank=True)
    grade_aggregation_method = models.CharField(max_length=50,null=True)
    is_external = models.BooleanField(default=False)
    def __str__(self):
        return self.name

    class Meta:
        db_table = 'events'


class Subevent(SafeDeleteAndAuditDetailsModel):
    name = models.CharField(max_length=100)
    event = models.ForeignKey(Event, on_delete=models.CASCADE,related_name='subevents')
    #gen_subevent = models.ForeignKey('Subevent', on_delete=models.CASCADE, related_name='%(class)s_requests_created',null=True)
    type =  models.CharField(max_length=50)
    start_time =  models.DateTimeField()
    end_time = models.DateTimeField()
    display_end_time = models.DateTimeField()
    allow_late_ending = models.BooleanField()
    late_end_time = models.DateTimeField(null=True)
    display_late_end_time = models.DateTimeField(null=True)
    is_blocking = models.BooleanField()
    participants_spec = models.BooleanField(null = True)
    params =  models.CharField(max_length=300,null=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'subevents'


class UserHasSubevents(SafeDeleteAndAuditDetailsModel):
    _safedelete_policy = HARD_DELETE_NOCASCADE
    subevent = models.ForeignKey(Subevent,on_delete=models.CASCADE)
    enrollment = models.ForeignKey(Enrollment, on_delete= models.CASCADE)

    class Meta:
        db_table = 'user_has_subevents'

class Upload(SafeDeleteAndAuditDetailsModel):
    file_path = models.FileField(blank=True)
    file_size  = models.IntegerField()
    original_file_name = models.CharField(max_length=100, blank=True, null=True)
    is_successful_upload = models.BooleanField(default=False)
    uploader = models.ForeignKey(Enrollment,on_delete=models.CASCADE)
    subevent = models.ForeignKey(Subevent, on_delete=models.CASCADE, null=True)
    uploaded_at = models.DateTimeField(null=True)
    uploader_ip = models.CharField(max_length=100,null=True)
    is_bulk_upload = models.BooleanField(default=False)
    is_paginated = models.BooleanField(default=False)

    class Meta:
        db_table = 'uploads'


class SubmissionGroup(SafeDeleteAndAuditDetailsModel):
    subevent= models.ForeignKey(Subevent,on_delete=models.CASCADE)
    access_code_gold = models.CharField(max_length=50,null=True,blank=True)
    access_code_submitted =models.CharField(max_length=50,null=True,blank=True)
    is_late_submission = models.BooleanField(default=False)
    choosen_question_set = models.ForeignKey(QuestionSet, on_delete=models.CASCADE,null=True,blank=True)
    upload_id_main = models.ForeignKey(Upload,on_delete=models.CASCADE,null=True,blank=True)
    upload_id_supp = models.ForeignKey(Upload,on_delete=models.CASCADE,null=True,blank=True, related_name = 'upload_supp')
    enrollments = models.ManyToManyField(Enrollment,through='SubmissionGroupHasUser',through_fields=('submission_group','enrollment'))

    class Meta:
        db_table = 'submission_groups'


class SubmissionGroupHasUser(SafeDeleteAndAuditDetailsModel):
    _safedelete_policy = HARD_DELETE_NOCASCADE
    submission_group = models.ForeignKey(SubmissionGroup,on_delete=models.CASCADE)
    enrollment = models.ForeignKey(Enrollment,on_delete=models.CASCADE)

    class Meta:
        db_table = 'submission_group_has_users'


class SubmissionResponse(SafeDeleteAndAuditDetailsModel):
    submission_group = models.ForeignKey(SubmissionGroup,on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    upload_page_no = models.IntegerField(null=True)
    upload_coords = models.CharField(max_length=50,null=True,blank=True)
    response_text = models.CharField(max_length=200,null=True,blank=True)
    upload = models.ForeignKey(Upload,on_delete=models.CASCADE)

    class Meta:
        db_table = 'responses'




class GradingDuty(SafeDeleteAndAuditDetailsModel):
    subevent = models.ForeignKey(Subevent, on_delete=models.CASCADE , related_name='subevent')
    response = models.ForeignKey(SubmissionResponse,on_delete=models.CASCADE)
    marks_adjustment = models.IntegerField(null=True)
    request_subevent = models.ForeignKey(Subevent, on_delete=models.CASCADE , related_name='request_subevent', null=True)
    prev_grading_duty = models.ForeignKey('self',on_delete=models.CASCADE, null=True )
    is_regrading = models.BooleanField(default=False)
    grader_comment = models.CharField(max_length=200, null=True,blank=True)
    student_comment = models.CharField(max_length=200,null=True,blank=True)
    is_completed = models.BooleanField(default=False)
    aggregate_marks = models.IntegerField(null = True)
    is_late_grading = models.BooleanField(default=False)
    is_aggregate_marks_dirty = models.BooleanField(default=False)
    grader = models.ForeignKey(Enrollment, on_delete=models.CASCADE)

    class Meta:
        db_table = 'grading_duties'

class GradingdutyHasRubrics(SafeDeleteAndAuditDetailsModel):
    _safedelete_policy = HARD_DELETE_NOCASCADE
    gradingduty = models.ForeignKey(GradingDuty, on_delete=models.CASCADE)
    rubric = models.ForeignKey(Rubric, on_delete=models.CASCADE)

    class Meta:
        db_table = 'grading_duty_has_rubrics'