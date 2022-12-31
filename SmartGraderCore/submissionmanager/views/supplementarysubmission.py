import json

from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.decorator import csrf_protection, authentication
from authentication.utils import get_course_data_from_cache
from eventmanager.serializers.subevent import *
from submissionmanager.serializers.mainsubmission import MainSubmissionCreateSerializer, MainSubmissionEditSerializer, \
    SuppSubmissionEditSerializer
from eventmanager.utils import get_user_supload_subevent, get_submissiongroup_has_user
from helper.exceptions import *
from helper.utils import get_pdf_encoded_content
from rest_framework.parsers import MultiPartParser, FormParser


class SuppSubmission(APIView):


    parser_classes = (MultiPartParser, FormParser)

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)



    # get all the events with subevents
    def get(self, request, course_id,event_id):
        # get enrollment id from cache
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        submission_group_has_user = get_submissiongroup_has_user(event_id,enrollment_id)
        submission_group = submission_group_has_user.submission_group
        upload =  submission_group.upload_id_supp
        if upload is None:
            raise serializers.ValidationError(messages.QUESTION_SET_NOVAL_3)
        file_path = upload.file_path
        is_paginated = upload.is_paginated
        content = get_pdf_encoded_content(file_path)
        original_file_name = upload.original_file_name
        return Response({"data": {'upload_file':content,'original_file_name': original_file_name,'is_paginated':is_paginated }}, status=status.HTTP_200_OK)



    def validate_submission_group_has_user(self,enrollment_id, event_id):
        submission_group_has_user = SubmissionGroupHasUser.objects.filter(
            submission_group__subevent__event__id=event_id,
            submission_group__subevent__type='SUPLOAD',
            enrollment__id=enrollment_id
            )
        if submission_group_has_user.count() == 0:
            raise AccessException()
        return submission_group_has_user.get().submission_group

    def post(self, request, course_id,event_id):

        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        subevent = get_user_supload_subevent(event_id, enrollment_id)
        sghu = get_submissiongroup_has_user(event_id, enrollment_id)
        submission_group = None
        if sghu:
            submission_group = sghu.submission_group
        params = json.loads(subevent.params)
        if params['SBM'] == 'OLI':
            raise AccessException()

        # validate duplicate
        if bool(submission_group and submission_group.upload_id_supp):
            raise DuplicateEntryException()

        file =  request.FILES.get('file')
        context = {'subevent':subevent,'params':params, 'event_id':event_id, 'submission_group':submission_group
                   ,'enrollment_id':enrollment_id}
        serializer = MainSubmissionCreateSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        upload = serializer.save()
        content = get_pdf_encoded_content(file_path=upload.file_path.path)
        return Response(
            data={'file': content, 'is_paginated' :upload.is_paginated}, status=status.HTTP_201_CREATED
        )


    def put(self, request, course_id, event_id, submission_group_id =None, is_masqueraded = False):

        if is_masqueraded:
            enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
            submission_group = SubmissionGroup.objects.filter(id=submission_group_id)
            if submission_group.count() == 0:
                raise ValidationException(detail='Invalid submission group id')
            submission_group = submission_group.get()
            subevent = submission_group.subevent
        else:
            enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
            subevent = get_user_supload_subevent(event_id, enrollment_id)
            sghu = get_submissiongroup_has_user(event_id, enrollment_id)

            submission_group = None
            if sghu:
                submission_group = sghu.submission_group
        # if not bool(submission_group and submission_group.upload_id_supp):
        #     raise AccessException("no previous upload found")

        params = json.loads(subevent.params)
        if params['SBM'] == 'OLI':
            raise PermissionError()

        context = {'subevent': subevent, 'params': params, 'event_id': event_id, 'submission_group': submission_group,
             'enrollment_id': enrollment_id ,  'submission_type' : 'supplementary'}
        serializer = SuppSubmissionEditSerializer(data=request.data, context=context)

        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)