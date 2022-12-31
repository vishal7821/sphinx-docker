from PIL import Image
from django.http import Http404
from rest_framework import status,serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from assignmentmanager.models import Question, Rubric
from eventmanager.models import GradingdutyHasRubrics
from assignmentmanager.serializers.rubric import RubricViewSerializer, RubricCreateSerializer, RubricEditSerializer
from assignmentmanager.utils import get_question_set_object
from helper.utils import get_specific_image_from_dir, get_image_directory
from authentication.decorator import csrf_protection, authentication
from django.utils.decorators import method_decorator
from helper import exceptions

Image.MAX_IMAGE_PIXELS = None


class RubricList(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_question(self,assignment_id, question_set_id, question_id):
        try:
            return Question.objects.get(question_set__assignment__id=assignment_id,
                                            question_set__id=question_set_id, id=question_id)
        except Question.DoesNotExist:
            raise exceptions.AccessException()

    def get(self, request, course_id, assignment_id, question_set_id, question_id):
        question = self.get_question( assignment_id, question_set_id, question_id)
        rubrics = question.rubric_set
        serializer = RubricViewSerializer(rubrics, many=True)
        # todo add file in the response -> completed todo
        #getting file related to question of rubric
        questionset = get_question_set_object(assignment_id, question_set_id)
        question_page = None
        if question.file_page and questionset.question_file_path.name:
            q_file_name = questionset.question_file_path
            dir_name = q_file_name.name[:-4]
            img_dirs = get_image_directory(course_id)
            img_dir = img_dirs + '/' + dir_name
            question_page_no = question.file_page - 1
            question_file_name = dir_name + '_' + str(question_page_no) + '.jpg'
            question_page = get_specific_image_from_dir(img_dir,question_file_name)

        data = {'rubrics':serializer.data,'file_cords':question.file_cords,'question_page': question_page}
        return Response({'data':data},status=status.HTTP_200_OK)

    def post(self,request, course_id, assignment_id, question_set_id, question_id):
        question = self.get_question(assignment_id,question_set_id,question_id)
        #request.data._mutable = True
        context = {'question': question}
        #request.data['question'] = question.id
        serializer = RubricCreateSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        #request.data._mutable = False
        return Response({'data':serializer.data}, status=status.HTTP_201_CREATED)



class RubricDetail(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_object(self, assignment_id, question_set_id, question_id,rubric_id):
        try:
            return Rubric.objects.get(question__question_set__assignment__id = assignment_id,
                                      question__question_set__id = question_set_id, question__id = question_id, id = rubric_id)
        except Rubric.DoesNotExist:
            raise exceptions.AccessException()

    def put(self,request, course_id, assignment_id, question_set_id, question_id,rubric_id):
        rubric = self.get_object( assignment_id, question_set_id, question_id,rubric_id)
        serializer = RubricEditSerializer(rubric, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data':serializer.data})

    def delete(self,request, course_id, assignment_id, question_set_id, question_id,rubric_id):
        rubric = self.get_object(assignment_id, question_set_id, question_id,rubric_id)
        #updating is_aggregate_marks_dirty bit to 1
        gradingduty_h_rubrics = GradingdutyHasRubrics.objects.filter(rubric = rubric)
        for gdhr in gradingduty_h_rubrics:
            grading_duty = gdhr.gradingduty
            if grading_duty:
                grading_duty.is_aggregate_marks_dirty = 1
                grading_duty.save()
        rubric.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)