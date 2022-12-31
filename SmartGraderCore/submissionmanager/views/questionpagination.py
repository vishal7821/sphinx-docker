import json

from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.decorator import csrf_protection, authentication
from authentication.utils import get_course_data_from_cache
from submissionmanager.serializers.submission import QuestionPaginateSerializer
from eventmanager.utils import get_user_supload_subevent
from eventmanager.utils import get_submissiongroup_has_user
from helper.exceptions import *


class QuestionPagination(APIView):
    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def post(self, request, course_id,event_id, question_id):
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        subevent = get_user_supload_subevent(event_id, enrollment_id)
        submission_group = get_submissiongroup_has_user(enrollment_id, event_id)

        if not bool(submission_group.upload_id_main):
            raise AccessException("no previous upload found")

        if (submission_group.choosen_question_set is None ):
            raise AccessException("Question set not selected by submission group")

        params = json.load(subevent.params)

        context = {'subevent': subevent, 'params': params, 'event_id': event_id, 'submission_group': submission_group,
                   'enrollment_id': enrollment_id}
        serializer = QuestionPaginateSerializer(data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


        return Response(
            status=status.HTTP_201_CREATED
        )