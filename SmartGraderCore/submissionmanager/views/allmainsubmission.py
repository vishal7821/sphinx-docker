from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.decorator import csrf_protection, authentication
from helper.exceptions import *
from eventmanager.models import *
from submissionmanager.serializers.allsubmissions import AllSubmissionsSerializer
from helper.utils import get_pdf_encoded_content


class AllMainSubmissions(APIView):
    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)

    def validate_submission_group(self,request, course_id, event_id, submission_group_id):
        try:
            return SubmissionGroup.objects.filter(id=submission_group_id,subevent__event__id= event_id).get()
        except SubmissionGroup.NotFoundException:
            raise AccessException()

    def get(self,request,event_id,submission_group_id):
        s_g = self.validate_submission_group(event_id,submission_group_id)
        file_path = s_g.upload_id_main.file_path
        content = get_pdf_encoded_content(file_path)
        return Response({"data": content}, status=status.HTTP_200_OK)
