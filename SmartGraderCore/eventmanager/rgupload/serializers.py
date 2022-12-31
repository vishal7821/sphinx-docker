import csv

from rest_framework import serializers

from assignmentmanager.models import QuestionSet
from authentication.models import User
from coursemanager.models import Enrollment
from helper import messages, constants
from eventmanager.validators import *
from eventmanager.models import UserHasSubevents
from eventmanager.utils import create_enrollment_has_subevents
from eventmanager import validators
import json


class RguploadSerializer(serializers.Serializer):
    RDS = serializers.ChoiceField(choices=['SOR','RAN','QRN'],validators=[])
    plist_CSV_FILE = serializers.FileField(required=False)
    plist_subevents = serializers.ListField(child=serializers.CharField(), required=False)
    #
    # def validate_RDS(self,val):
    #     if val not in ['SOR','RAN','QRN']:
    #         raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_42)
    #     return val
    def validate_plist_subevents(self, value):
        if len(value)>0 and isinstance(value[0], str):
            value = json.loads(value[0])
        return value

    def _validate_participants_spec(self,rds):
        if rds in ['RAN' , 'QRN'] and 'participants_spec' not in self.context.get('request').data:
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_13)

    def validate(self, attrs):
        self._validate_participants_spec(attrs['RDS'])
        event = self.context.get('event')
        course_id = self.context.get('course_id')
        required_csv_fields = []
        requestdata = self.context.get('request').data
        #validate participant_specs ,For RDS = RAN ,participants_spec can be 0/1 else participants_spec must be 0

        required_csv_fields.append(constants.GRADER_LIST)
        if attrs['RDS'] == 'QRN' :
            # validate participants_spec must be 0 and participant_CSV must be provided
            if not int(requestdata.get('participants_spec')):
                if not ('plist_CSV_FILE' in attrs and attrs.get('plist_CSV_FILE')):
                    raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_11)
            else:
                raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_11)

            # file = self.context.get('request').FILES['plist_CSV_FILE']
            # self.context['data_list'] = validate_rgupload_csv_data(file, event, course_id)

            required_csv_fields.append(constants.QUESTION_SET)
            required_csv_fields.append(constants.QUESTION)
            p_csv_file = attrs.get('plist_CSV_FILE', None)

            course_id = self.context.get('course_id')
            event = self.context.get('event')
            data = validators.validate_gupload_csv_data(p_csv_file, required_csv_fields, event, course_id, None)
            self.context['data_list'] = data.get('data_list')
            self.context['grader_list'] = data.get('grader_list')

        elif attrs['RDS'] == 'RAN':
            # fetch all participants
            if not int(requestdata.get('participants_spec')):#participants specified using CSV
                # file = attrs.get('plist_CSV_FILE')
                # self.context['data_list'] = read_graders(file,event,course_id)

                p_csv_file = attrs.get('plist_CSV_FILE', None)
                course_id = self.context.get('course_id')
                event = self.context.get('event')
                data = validators.validate_gupload_csv_data(p_csv_file, required_csv_fields, event, course_id, None)
                self.context['data_list'] = data.get('data_list')
                self.context['grader_list'] = data.get('grader_list')

            else:
                plist_subevents = attrs.get('plist_subevents')
                all_enrollments = []
                grader_ids = []
                for subevent in plist_subevents:
                    enrollments =  UserHasSubevents.objects.filter(subevent=subevent).values_list('enrollment', flat=True)
                    for u in enrollments:
                        grader_ids.append(validate_enrollment(event.id, u, course_id, constants.ROLE_GRADER))
                    all_enrollments.extend(enrollments)
                #grader_list = {'grader_list': set(grader_ids)}
                self.context['data_list'] = []
                self.context['grader_list'] = set(all_enrollments)



        return attrs

    def create(self, validated_data):
        subevent = self.context.get('subevent')
        req = self.context.get('request')
        gen_subevent = None
        data_list = self.context.get('data_list',[])
        grader_list = list(self.context.get('grader_list', []))
        param = {'RDS':req.data['RDS'], 'data_list': list(data_list), constants.SUBEVENT_GUPLOAD_PARAM_REGRADER_LIST: grader_list , 'GEN':gen_subevent}
        subevent.params = json.dumps(param)
        subevent.save()

        #create UserHasSubevent entries
        enrollment_ids = grader_list
        enrollments = []
        for id in enrollment_ids:
            e = Enrollment.objects.get(pk=id)
            enrollments.append(e)
        # create enrollmentHasSubevent entries
        create_enrollment_has_subevents(enrollments, self.context.get('subevent'))
        return subevent


