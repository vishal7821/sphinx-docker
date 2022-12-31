from rest_framework import fields

from eventmanager import validators
from eventmanager.models import *
from eventmanager.validators import *
from helper.utils import save_course_file, get_enrollments_from_csv
from eventmanager.utils import create_enrollment_has_subevents, validate_participants_list
import json

class SubeventCreateSerializer(serializers.ModelSerializer):


    def __init__(self,data = fields.empty,**kwargs):
        super(SubeventCreateSerializer, self).__init__(data = data,**kwargs)
        self.TYPES = ['SVIEW', 'MVIEW','RMVIEW','GVIEW', 'RGVIEW','AVIEW','QVIEW','SUPLOAD','GUPLOAD','RGREQ','RGUPLOAD']


    def validate_type(self, val):
        if val not in self.TYPES:
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_4)
        return val



    def validate(self,attrs):

        #validate name
        validators.validate_name(attrs.get('event'), attrs.get('name'))

        # validating time
        validators.validate_time(attrs['start_time'],attrs['end_time'])
        if attrs['allow_late_ending']:
            if 'late_end_time' not in attrs or 'display_late_end_time' not in attrs:
                raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_6)
            validators.validate_all_times(attrs['end_time'],attrs['late_end_time'],attrs['display_end_time'],attrs['display_late_end_time'])


        #validating participants csv
        #for SUPLOAD participant list validation is based on Submission mode
        #for RGUPLOAD participant list is based on regrading duty scheme
        #for QVIEW, AVIEw participants_spec must be 1
        if attrs['type'] not in ['SUPLOAD' , 'RGUPLOAD','QVIEW','AVIEW']:

            if 'participants_spec' not in attrs:
                raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_13)

            if not attrs['participants_spec']:
                if not ('plist_CSV_FILE'  in self.context.get('request').data and  self.context.get('request').data['plist_CSV_FILE']):
                    raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_15)
                # participants_csv_file = attrs['plist_CSV_FILE']
                # csv_fields =[constants.USERNAME_LIST]
                # self.context['p_enrollment_list'] = validate_subevent_participants_csv_data(participants_csv_file, csv_fields, attrs.get('event'), self.context.get('course_id'))

            else:
                if not ('plist_subevents' in self.context.get('request').data and self.context.get('request').data['plist_subevents']):
                    raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_12)

        return attrs


    class Meta:
        model = Subevent
        fields = ('name', 'start_time', 'type', 'end_time', 'is_blocking', 'display_end_time', 'allow_late_ending',
                  'event','late_end_time', 'display_late_end_time','participants_spec' )#'gen_subevent'

    def create(self, validated_data):


        subevent = Subevent(**validated_data)
        subevent.save()


        return subevent



class SubeventViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subevent
        fields = ('id', 'name', 'start_time', 'type', 'end_time', 'is_blocking', 'display_end_time', 'allow_late_ending', 'late_end_time', 'display_late_end_time')
        #depth = 2



class MySubeventViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subevent
        fields = ('id', 'name', 'start_time', 'type',  'is_blocking', 'display_end_time', 'allow_late_ending', 'display_late_end_time')
        #depth = 2

class SubeventUpdateSerializer(serializers.ModelSerializer):

    def validate_name(self,val):
        event_id = self.context.get('event_id')
        if val is not None and self.instance.name != val and Subevent.objects.filter(event__id =event_id ,name = val ).exists():
            raise exceptions.DuplicateEntryException(detail='name already exists fro another subevent of this event,change and try again')
        return val

    def _validate_is_blocking(self,val,start_time, end_time):
        pass
        # if val :
        #     enrollments = UserHasSubevents.objects.filter(subevent = self.instance)
        #     blockingsubevents = []
        #     for e in enrollments:
        #         subevents= UserHasSubevents.objects.filter(enrollment = e , subevent__is_blocking = True)
        #         blockingsubevents .extend(e.subevents)
        #     blockingsubevents = set(blockingsubevents)
        #
        # for s in blockingsubevents:
        #     if (start_time >= s.start_time and start_time < s.end_time) or (end_time > s.start_time and end_time <= s.end_time):
        #         raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_44)


    def validate(self, attrs):
        s_t = attrs.get('start_time' , self.instance.start_time)
        e_t = attrs.get('end_time', self.instance.end_time)
        d_e_t = attrs.get('display_end_time', self.instance.display_end_time)
        l_e_t = None
        d_l_e_t = None
        validate_time(s_t, e_t)
        if attrs.get('allow_late_ending', self.instance.allow_late_ending):
            l_e_t = attrs.get('late_end_time', self.instance.late_end_time)
            d_l_e_t = attrs.get('display_late_end_time', self.instance.display_late_end_time)

        validate_all_times(e_t, l_e_t, d_e_t, d_l_e_t)

        self._validate_is_blocking(attrs.get('is_blocking' , False) , s_t , e_t)

        return attrs
    class Meta:
        model = Subevent
        fields = ('name', 'start_time', 'end_time', 'is_blocking', 'display_end_time', 'allow_late_ending',
                  'late_end_time','display_late_end_time')





class AQviewSerializer(serializers.Serializer):
    gen_subevent =  serializers.ListField(child=serializers.CharField())
    plist_CSV_FILE = serializers.FileField(required=False)
    plist_subevents = serializers.ListField(child=serializers.CharField(), required=False)


    def validate_plist_subevents(self, value):
        if len(value)>0 and isinstance(value[0], str):
            value = json.loads(value[0])
        return value


    def validate_gen_subevent(self,val):
        if len(val) > 0 and isinstance(val[0], str):
            val = json.loads(val[0])
        if len(val)==0:
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_5)
        gen_type = []
        for id in val:
            subevent = Subevent.objects.get(pk = id)

            if not subevent:
                raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_5)
            gen_type.append(subevent.type)

            if subevent.type not in ['SUPLOAD' , 'GUPLOAD' ,'RGUPLOAD']:
                raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_6)

        if 'SUPLOAD' in gen_type and ('GUPLOAD' in gen_type or 'RGUPLOAD' in gen_type):
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_6)
        return val

    def validate(self, attrs):

        #validating participants_spec
        if not ('participants_spec' in self.context.get('request').data) and not(int(self.context.get('request').data['participants_spec'])):
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_4)

        # validating participants subevent list and fetching all enrollments of subevents of plist_subevents
        if not ('plist_subevents' in attrs and attrs['plist_subevents']):
                raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_12)
        plist_subevents = attrs['plist_subevents']
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

        #participants of gen_subevent must be same as particaipants of participants_subevent list
        all_enrollments = []
        for subevent_id in attrs['gen_subevent']:
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
        gen_enrollments = set(all_enrollments)
        diff = gen_enrollments.symmetric_difference(enrollments)
        if len(diff)>0:
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_10)
        self.context['enrollments'] = enrollments

        return attrs

    def create(self, validated_data):

        #fetch all enrollments
        enrollment_ids = self.context.get('enrollments')
        enrollments=[]
        for id in enrollment_ids:
            e = Enrollment.objects.get(pk=id)
            enrollments.append(e)
        #create enrollmentHasSubevent entries
        create_enrollment_has_subevents(enrollments, self.context.get('subevent'))

        subevent = self.context.get('subevent')
        param = {'GEN':validated_data['gen_subevent']}
        subevent.params = json.dumps(param)
        subevent.save()
        return subevent



class SMRMGRGviewSerializer(serializers.Serializer):
    plist_CSV_FILE = serializers.FileField(required=False)
    plist_subevents = serializers.ListField(child=serializers.CharField(), required=False)

    def validate_plist_subevents(self, value):
        if len(value)>0 and isinstance(value[0], str):
            value = json.loads(value[0])
        return value

    def validate(self, attrs):
        requestdata = self.context.get('request').data
        # fetch all participants
        if not int(requestdata['participants_spec']):

            participants_csv_file = attrs.get('plist_CSV_FILE')
            csv_fields = [constants.USERNAME_LIST]
            enrollments = validate_subevent_participants_csv_data(participants_csv_file, csv_fields,
                                                                  self.context.get('event'),
                                                                  self.context.get('course_id'))

        else:
            plist_subevents = attrs.get('plist_subevents')
            all_enrollments = []
            for subevent_id in plist_subevents:
                subevent = Subevent.objects.get(pk = subevent_id)
                if subevent.type == 'SUPLOAD':
                    params = json.loads(subevent.params)
                    csv_filename = ''
                    if 'CSV_filename' not in params:
                        raise serializers.ValidationError('participants are not present in provided subevents')
                    csv_filename = params['CSV_filename']
                    enrollment_list = get_enrollments_from_csv(csv_filename, self.context.get('course_id'))
                else:
                    enrollment_list = UserHasSubevents.objects.filter(subevent=subevent_id).values_list('enrollment', flat=True)
                all_enrollments.extend(enrollment_list)
            enrollments = set(all_enrollments)

        # validate whether SUPLOAD for each participant is exist or not
        validate_participants_list(enrollments, requestdata['type'] , self.context.get('event'))

        if not requestdata['participants_spec']:
            filename = save_course_file(participants_csv_file, participants_csv_file.name, self.context.get('course_id'))
            # todo save this filename in courselog table
        self.context['enrollments'] = enrollments
        return attrs

    def create(self, validated_data):
        subevent = self.context.get('subevent')

        # create Enrollmenthassubevent entries
        enrollment_ids = self.context.get('enrollments')
        enrollments = []
        for id in enrollment_ids:
            e = Enrollment.objects.get(pk=id)
            enrollments.append(e)

        #create enrollmentHasSubevent entries
        create_enrollment_has_subevents(enrollments,subevent)

        return subevent