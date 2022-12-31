from assignmentmanager.models import Assignment, QuestionSet
from django.http import Http404
from helper.exceptions import AccessException
from django.db.models import Sum
from assignmentmanager.models import Question
def get_question_set_object(assignment_id, question_set_id):
    try:
        return QuestionSet.objects.filter(assignment__id=assignment_id, id=question_set_id).get()
    except QuestionSet.DoesNotExist:
        raise AccessException

def update_questiontree_on_insertion(question):
    temp = 0
    childoldmarks = 0
    child = question
    parentQue = question.parent
    while parentQue:
        if parentQue.is_actual_question:
            temp = parentQue.marks
            parentQue.is_actual_question = False
            parentQue.marks = child.marks
        else:
            temp = parentQue.marks
            parentQue.marks = parentQue.marks - childoldmarks + child.marks
        child = parentQue
        childoldmarks = temp
        parentQue.save()
        parentQue = parentQue.parent

def update_questiontree_marks_on_deletion(question):
    childoldmarks = question.marks
    childnewmarks = 0
    parentQue = question.parent
    if parentQue:
        childcnt = Question.objects.filter(parent__id=parentQue.id).count()
        if childcnt == 1:
            parentQue.is_actual_question = True
    while parentQue:
        temp = parentQue.marks
        parentQue.marks = parentQue.marks - childoldmarks + childnewmarks
        parentQue.save()
        childoldmarks = temp
        childnewmarks = parentQue.marks
        parentQue = parentQue.parent

def update_questionset_marks(question):
    questionset=question.question_set
    updated_marks =  Question.objects.filter(question_set=questionset,is_actual_question=True).aggregate(Sum('marks'))
    questionset.total_marks = updated_marks.get('marks__sum')
    questionset.save()

def update_question_marks(question, old_marks , new_marks):
    childoldmarks = old_marks
    childnewmarks = new_marks
    parentQue = question.parent

    while parentQue:
        temp = parentQue.marks
        if parentQue.is_actual_question:
            parentQue.is_actual_question = False
            parentQue.marks = question.marks
        else:
            parentQue.marks = parentQue.marks - childoldmarks + childnewmarks
        parentQue.save()
        childoldmarks = temp
        childnewmarks = parentQue.marks
        parentQue = parentQue.parent