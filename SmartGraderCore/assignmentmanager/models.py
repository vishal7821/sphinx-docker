from django.db import models
from helper.models import SafeDeleteAndAuditDetailsModel
from django.contrib.auth.hashers import make_password
from django.utils.crypto import get_random_string
from helper.related import SpanningForeignKey
from coursemanager.models import Topic
from safedelete.models import HARD_DELETE_NOCASCADE
from django.core.validators import MaxValueValidator, MinValueValidator

# Create your models here.


class Assignment(SafeDeleteAndAuditDetailsModel):
    name = models.CharField(max_length=100)
    comments = models.CharField(max_length=200, null=True)
    is_interactive = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'assignments'


class QuestionSet(SafeDeleteAndAuditDetailsModel):
    name = models.CharField(max_length=100)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='questionset')
    question_file_path = models.FileField( blank=True)
    supplementary_file_path = models.FileField( blank=True)
    solution_file_path = models.FileField(blank=True)
    total_marks = models.IntegerField()
    name_coords = models.CharField(max_length=50, null=True, blank=True)
    roll_coords = models.CharField(max_length=50, null=True, blank=True)
    original_question_file_name = models.CharField(max_length=100,blank=True,null=True)
    original_supplementary_file_name = models.CharField(max_length=100,blank=True,null=True)
    original_solution_file_name = models.CharField(max_length=100,blank=True,null=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'question_sets'


class Question(SafeDeleteAndAuditDetailsModel):
    subpart_no = models.CharField(max_length=100,null=True)
    title = models.CharField(max_length=100)
    type = models.CharField(max_length=100, null=True)
    file_page = models.IntegerField(null=True)
    file_cords = models.CharField(max_length=200,null=True)
    text = models.TextField(max_length=60000, null= True)
    #difficulty_level = models.CharField(max_length=100,null=True)
    difficulty_level = models.IntegerField(
        default=1,
        validators=[MaxValueValidator(10), MinValueValidator(0)]
    )
    marks = models.FloatField(null=True,default=0)
    solution_list = models.CharField(max_length=300,null=True)
    is_autograded = models.BooleanField(null=True)
    parent = models.ForeignKey('Question',on_delete=models.CASCADE, related_name='%(class)s_requests_created',null=True)
    grading_duty_scheme = models.CharField(max_length=100,null=True)
    is_actual_question = models.BooleanField(default=True)
    topics = models.ManyToManyField(Topic, through='QuestionHasTopics', through_fields=('question', 'topic'))
    question_set = models.ForeignKey(QuestionSet,on_delete=models.CASCADE)
    options = models.TextField(max_length=60000, null= True)
    def __str__(self):
        return self.title

    class Meta:
        db_table = 'questions'


class QuestionOptions(SafeDeleteAndAuditDetailsModel):
    label = models.CharField(max_length=200)
    text = models.CharField(max_length=200)
    is_correct = models.BooleanField()
    image_path = models.CharField(max_length=200)
    image_size = models.IntegerField()
    question = models.ForeignKey(Question,on_delete=models.CASCADE)

    def __str__(self):
        return self.option_text

    class Meta:
        db_table = 'question_options'


class Rubric(SafeDeleteAndAuditDetailsModel):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    text = models.CharField(max_length=200)
    marks = models.IntegerField()

    def __str__(self):
        return self.text

    class Meta:
        db_table = 'rubrics'


class QuestionHasTopics(SafeDeleteAndAuditDetailsModel):
    _safedelete_policy = HARD_DELETE_NOCASCADE
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic,on_delete=models.CASCADE)

    class Meta:
        db_table = 'question_has_topics'


