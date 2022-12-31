from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.decorator import csrf_protection, authentication
from helper.exceptions import *
from eventmanager.models import *
from submissionmanager.serializers.allsubmissions import AllSubmissionsSerializer


class AllSubmissions(APIView):
    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_all_supload_subevents(self,event_id):
        return Subevent.objects.filter(event__id = event_id, type = 'SUPLOAD')

    def get_all_submission_groups(self,subevent_id):
        return SubmissionGroup.objects.filter(subevent__id = subevent_id)

    def get(self, request, course_id,event_id):
        subevents = self.get_all_supload_subevents(event_id)

        data = list()
        for s_e in subevents:
            subevent = s_e.get()
            x = {}
            x['subevent'] = subevent
            x['submissiongroups'] = self.get_all_submission_groups(subevent.id)
            data.append(x)
        serializer = AllSubmissionsSerializer(data=data,many=True)
        #todo: or each SUPLOAD subevent, return a list of students who were given permission to make submissions, but
        # have not (yet) made any submissions.
        return Response(
            data= {'data': serializer.data },status=status.HTTP_201_CREATED
        )