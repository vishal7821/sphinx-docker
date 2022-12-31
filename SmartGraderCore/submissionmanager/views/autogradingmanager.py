import base64
import os

import cv2
from django.core.files.storage import FileSystemStorage
from rest_framework.response import Response
from rest_framework.views import APIView

from eventmanager.utils import get_upload_subevent, get_gupload_subevent, get_user_has_subevent
from helper import exceptions
from helper.exceptions import *
from rest_framework.parsers import MultiPartParser, FormParser

from helper.utils import get_image_directory, get_pdf_encoded_content, validate_gds
from submissionmanager.serializers.bulkgradingduty import BulkGradingSerializer, GradeSubmissionsSerializer
from submissionmanager.serializers.bulksubmission import BulkUploadSerializer, UserRecognitionSerializer, \
    BulkSubmissionMapSerializer

from authentication.utils import get_course_data_from_cache

import json
from eventmanager.models import *

class AutoGrade(APIView):
    parser_classes = (MultiPartParser, FormParser)
    def get(self, request, course_id, event_id, subevent_id, question_id):


        # 1. validate the gupload for this user in this event is going on or not
        # 2. fetch all grading duties allocated to user for the question in this gupload in the event
        # 3. fetch details of the question like question type, is autogradable, solution list, question coords
        # 4.  if not autogradable then raise exception and return
        # 5. find out number of contours to find using solution list
        # 6. fetch all pages of the responses of all the above fetched grading duties
        # 7. fetch cropped boxes of question answer from submission pages
        # 8. find contours and separate boxes of each contour
        # 9. use AI model to predict the corresponding handwritten answer
        # 10.return the aggregated prediction

        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        gupload_subevent = get_gupload_subevent(event_id, subevent_id)
        uhs = get_user_has_subevent(subevent_id, enrollment_id)

        context = {'course_id': course_id, 'subevent': gupload_subevent,
                   'event_id': event_id, 'enrollment_id': enrollment_id,
                   'question_id': question_id}
        serializer = BulkGradingSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        return_data = serializer.save()
        return Response(
            data=return_data
        )

    def post(self, request, course_id, event_id, subevent_id, question_id):

        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        gupload_subevent = get_gupload_subevent(event_id, subevent_id)
        uhs = get_user_has_subevent(subevent_id, enrollment_id)
        #validate question id
        question = Question.objects.filter(id=question_id)
        if question.count() == 0:
            raise ValidationException('No question present with given provided question ID')
        question = question.get()
        if question.type != '1':
            return Response(
                data={'message': 'success'}
            )
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        #validate gd has received gupload subevent as subevent and
        # gd has response row corresponding to the above question id

        context = {'course_id': course_id, 'subevent': gupload_subevent,
                   'event_id': event_id, 'enrollment_id': enrollment_id,
                   'question': question}
        serializer = GradeSubmissionsSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        return_data = serializer.save()
        #compute marks based on question_type
        # group subquestions of same gd
        #update grading duty as completed with marks and remark as 'the correctly answered
        # subquestions are.. or no subquestions answered correctly'
        return Response(
                data=return_data
            )