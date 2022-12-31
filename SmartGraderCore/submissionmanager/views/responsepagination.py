import json

from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.decorator import csrf_protection, authentication
from authentication.utils import get_course_data_from_cache
from eventmanager.serializers.subevent import *
from eventmanager.utils import get_user_supload_subevent, get_submissiongroup_has_user
from helper.exceptions import *
from rest_framework.parsers import MultiPartParser, FormParser
from helper.utils import get_image_directory
from django.core.files.storage import FileSystemStorage

class ResponsesPage(APIView):

    def validate_questionid_for_pagination(self,question_id , question_set):
        question = Question.objects.filter(id = question_id , question_set = question_set , is_actual_question = True)
        if not question.exists():
            raise ValidationException("Question id is invalid")
        return question.get()


    def validate_page_no(self, course_id , submission_group, page_no):
        to_image_directory = get_image_directory(course_id)
        if not to_image_directory:
            raise serializers.ValidationError(**messages.COURSE_IMAGE_DIRECTORY_NOEXIST_1)
        file_path = submission_group.upload_id_main.file_path
        dir_name = file_path.name[:-4]
        img_dirs = to_image_directory
        img_dir = img_dirs + '/' + dir_name
        file_system_storage = FileSystemStorage()
        image_list = file_system_storage.listdir(img_dir)
        if int(page_no) > len(image_list[1]):
            raise ValidationException("Page number is invalid")

    def post(self, request, course_id, event_id, question_id,user_id):
        page_no = json.loads(request.body).get('response')
        enrollment_id = user_id
        subevent = get_user_supload_subevent(event_id, enrollment_id)
        sghu = get_submissiongroup_has_user(event_id, enrollment_id)
        submission_group = None
        is_interactive_flag = False
        if sghu:
            submission_group = sghu.submission_group
        if subevent.event.assignment.is_interactive is True:
            if submission_group.choosen_question_set is None:
                raise AccessException()
            question = self.validate_questionid_for_pagination(question_id, submission_group.choosen_question_set)
            response = SubmissionResponse.objects.filter(submission_group=submission_group, question=question)
            data = {'submission_group': submission_group, 'question': question, 'response_text': page_no}
            if response.exists():
                response = response.get()
                # response.upload_page_no = page_no
                response.response_text = page_no
                response.save()
            else:
                response = SubmissionResponse(**data)
                response.upload_id = -1
                response.save()

            return Response(
                data={'question_id': response.question.id, 'response': response.response_text},
                status=status.HTTP_201_CREATED
            )
        else:
            print("")
            if submission_group.choosen_question_set is None or submission_group.upload_id_main is None:
                raise AccessException()

            # validate question id
            question = self.validate_questionid_for_pagination(question_id, submission_group.choosen_question_set)
            # validate page no
            self.validate_page_no(course_id, submission_group, page_no)

            data = {'submission_group': submission_group, 'question': question, 'upload_page_no': page_no,
                    'upload': submission_group.upload_id_main}

            response = SubmissionResponse.objects.filter(submission_group=submission_group, question=question,
                                                         upload=submission_group.upload_id_main)

            if response.exists():
                response = response.get()
                response.upload_page_no = page_no
                response.save()
            else:
                response = SubmissionResponse(**data)
                response.save()

            upload = Upload.objects.get(id=response.upload.id)
            upload.is_paginated = True;
            upload.save()

            return Response(
                data={'question_id': response.question.id, 'page_no': response.upload_page_no},
                status=status.HTTP_201_CREATED
            )
class ResponsePagination(APIView):
    parser_classes = (MultiPartParser, FormParser)

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def validate_questionid_for_pagination(self,question_id , question_set):
        question = Question.objects.filter(id = question_id , question_set = question_set , is_actual_question = True)
        if not question.exists():
            raise ValidationException("Question id is invalid")
        return question.get()

    def validate_page_no(self, course_id , submission_group, page_no):
        to_image_directory = get_image_directory(course_id)
        if not to_image_directory:
            raise serializers.ValidationError(**messages.COURSE_IMAGE_DIRECTORY_NOEXIST_1)
        file_path = submission_group.upload_id_main.file_path
        dir_name = file_path.name[:-4]
        img_dirs = to_image_directory
        img_dir = img_dirs + '/' + dir_name
        file_system_storage = FileSystemStorage()
        image_list = file_system_storage.listdir(img_dir)
        if int(page_no) > len(image_list[1]):
            raise ValidationException("Page number is invalid")

    def post(self, request, course_id, event_id, question_id):
        page_no = json.loads(request.body).get('response')
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        subevent = get_user_supload_subevent(event_id, enrollment_id)
        sghu = get_submissiongroup_has_user(event_id, enrollment_id)
        submission_group = None
        is_interactive_flag = False
        if sghu:
            submission_group = sghu.submission_group
        if subevent.event.assignment.is_interactive is True:
            if submission_group.choosen_question_set is None:
                raise AccessException()
            question = self.validate_questionid_for_pagination(question_id, submission_group.choosen_question_set)
            response = SubmissionResponse.objects.filter(submission_group=submission_group, question=question)
            data = {'submission_group': submission_group, 'question': question,'response_text' : page_no}
            if response.exists():
                response = response.get()
                #response.upload_page_no = page_no
                response.response_text = page_no
                response.save()
            else:
                response = SubmissionResponse(**data)
                response.upload_id = -1
                response.save()


            return Response(
                data={'question_id': response.question.id, 'response': response.response_text},
                status=status.HTTP_201_CREATED
            )
        else:
            print("")
            if submission_group.choosen_question_set is None or submission_group.upload_id_main is None:
                raise AccessException()

            # validate question id
            question = self.validate_questionid_for_pagination(question_id, submission_group.choosen_question_set)
            # validate page no
            self.validate_page_no(course_id, submission_group, page_no)

            data = {'submission_group': submission_group, 'question': question, 'upload_page_no': page_no,
                    'upload': submission_group.upload_id_main}

            response = SubmissionResponse.objects.filter(submission_group=submission_group, question=question,
                                                         upload=submission_group.upload_id_main)

            if response.exists():
                response = response.get()
                response.upload_page_no = page_no
                response.save()
            else:
                response = SubmissionResponse(**data)
                response.save()

            upload = Upload.objects.get(id=response.upload.id)
            upload.is_paginated = True;
            upload.save()

            return Response(
                data={'question_id': response.question.id, 'page_no': response.upload_page_no},
                status=status.HTTP_201_CREATED
            )

    def delete(self, request, course_id, event_id, question_id, page_no):
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        get_user_supload_subevent(event_id, enrollment_id)
        sghu = get_submissiongroup_has_user(event_id, enrollment_id)
        submission_group = None
        if sghu:
            submission_group = sghu.submission_group

        # validate question id
        question = self.validate_questionid_for_pagination(question_id, submission_group.choosen_question_set)
        # validate page no
        self.validate_page_no(course_id, submission_group, page_no)
        response = SubmissionResponse.objects.get(submission_group=submission_group, question=question,
                                                  upload=submission_group.upload_id_main)

        response.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)