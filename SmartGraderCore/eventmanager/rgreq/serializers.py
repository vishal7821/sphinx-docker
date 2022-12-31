from rest_framework import serializers

from eventmanager.models import UserHasSubevents
from helper import constants
from eventmanager.models import Subevent
from coursemanager.models import Enrollment
from helper import messages
from eventmanager.validators import validate_subevent_participants_csv_data
from eventmanager.utils import validate_participants_list,create_enrollment_has_subevents,validate_gupload_subevent
import json

from helper.utils import get_enrollments_from_csv


class RgreqSerializer(serializers.Serializer):
    gen_subevent = serializers.ListField(child=serializers.CharField())
    plist_CSV_FILE = serializers.FileField(required=False)
    plist_subevents = serializers.ListField(child=serializers.CharField(), required=False)
    parent_subevent = serializers.CharField()

    def validate_plist_subevents(self, value):
        if len(value) > 0 and isinstance(value[0], str):
            value = json.loads(value[0])
        return value

    def validate_gen_subevent(self,val):
        if len(val) > 0 and isinstance(val[0], str):
            val = json.loads(val[0])
        if len(val)>1:
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_43)
        return val

    def validate(self,attrs):
        requestdata=self.context.get('request').data
        #validate gen_subevent
        #1.Must be RGUPLOAD
        gensubevent_list = attrs.get('gen_subevent',[])
        if len(gensubevent_list) !=1:
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_48)
        gensubevent = Subevent.objects.get(pk = attrs.get('gen_subevent')[0])
        if gensubevent.type != 'RGUPLOAD':
             raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_40)
        #2.gensubevent must not be linked to any other RGREQ
        params = json.loads(gensubevent.params)
        if params.get('GEN') :
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_41)

        #3.validating parent subevent TED
        parentsubeventid  = attrs.get('parent_subevent',None)
        eventid = self.context.get('event').id
        validate_gupload_subevent(eventid, parentsubeventid)
        rgreqsubevents = Subevent.objects.filter(type = "RGREQ" , event__id = eventid)
        for subeve in rgreqsubevents:
            params = json.loads(subeve.params)
            if params.get('TED') and params.get('TED') == parentsubeventid:
                raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_47)

        #4.validate participants, SUPLOAD must exist for each participant
        # fetch all participants
        if not int(requestdata.get('participants_spec')):

            participants_csv_file = attrs.get('plist_CSV_FILE')
            csv_fields = [constants.USERNAME_LIST]
            enrollments = validate_subevent_participants_csv_data(participants_csv_file, csv_fields,
                                                                      attrs.get('event'),
                                                                      self.context.get('course_id'))
        else:
            plist_subevents = attrs.get('plist_subevents')
            all_enrollments = []
            for subevent_id in plist_subevents:
                subevent = Subevent.objects.get(pk=subevent_id)
                if subevent.type == 'SUPLOAD':
                    params = json.loads(subevent.params)
                    csv_filename = ''
                    if 'CSV_filename' not in params:
                        raise serializers.ValidationError('participants are not present in provided subevents')
                    csv_filename = params['CSV_filename']
                    enrollment_list = get_enrollments_from_csv(csv_filename, self.context.get('course_id'))
                else:
                    enrollment_list = UserHasSubevents.objects.filter(subevent=subevent_id).values_list('enrollment',
                                                                                                        flat=True)
                all_enrollments.extend(enrollment_list)
            enrollments = set(all_enrollments)

        validate_participants_list(enrollments, requestdata.get('type') , self.context.get('event'))
        self.context['enrollments'] = enrollments
        self.context['gensubevent'] = gensubevent

        return attrs


    def create(self, validated_data):
        subevent = self.context.get('subevent')
        #update GEN param of RGUPLOAD gensubevent = current RGREQ
        gensubevent = self.context.get('gensubevent')
        params =json.loads(gensubevent.params)
        params['GEN'] = subevent.name
        gensubevent.params = json.dumps(params)
        gensubevent.save()

        #create UserHasSubevents
        enrollment_ids = self.context.get('enrollments')
        enrollments = []
        for id in enrollment_ids:
            e = Enrollment.objects.get(pk=id)
            enrollments.append(e)
        create_enrollment_has_subevents(enrollments, subevent)


        #update params fields GEN and TED of RGREQ
        GEN = validated_data['gen_subevent']
        TED = validated_data['parent_subevent']
        param = { 'GEN': GEN , 'TED' : TED }
        subevent.params = json.dumps(param)
        subevent.save()

        return subevent
