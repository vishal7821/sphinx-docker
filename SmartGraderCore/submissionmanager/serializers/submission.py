from rest_framework import fields

from eventmanager import validators
import json
from eventmanager.models import *
from eventmanager.serializers.submissiongroup import SubmissionGroupSerializer
from eventmanager.validators import *
from helper.exceptions import *
from eventmanager.utils import is_lists_intersects , get_section_list_enrollments

class UserViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name','last_name','roll_no')


class SubmissionGroupViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionGroup
        fields = ('id','choosen_question_set','access_code_submitted' , 'is_late_submission')


class ParamViewSerializer(serializers.Serializer):
    DEL = serializers.CharField(max_length=100)
    COL = serializers.CharField(max_length=100)
    NAC = serializers.CharField(max_length=100)
    SGS = serializers.CharField(max_length=100)
    QSS = serializers.CharField(max_length=100)
    NAC_flag = serializers.BooleanField()
    SUP = serializers.BooleanField()
    SUT = serializers.CharField(max_length=100)


class SubmissionViewSerializer(serializers.Serializer):
   users = UserViewSerializer(many=True)
   submission_group = SubmissionGroupViewSerializer()
   param = ParamViewSerializer()


class QuestionPaginateSerializer(serializers.ModelSerializer):

    def validate_question(self,question_set_id, event_id, question_id):
        event = Event.objects.get(id=event_id)
        assignment = None
        if event:
            assignment = event.assignment

        qs = QuestionSet.objects.filter(id = question_set_id, assignment__id = assignment.id)
        if qs.count() == 0:
            raise ValidationException(detail="not a valid Question id")
        q = Question.objects.filter(question_set__id=question_set_id, id=question_id)
        if not q.exists():
            raise ValidationException(detail="not a valid Question id")

    def validate_upload_page_no(self, question_set_id, event_id, question_id):
        None


    def validate(self,attrs):
        subevent = self.context.get('subevent',None)
        params = self.context.get('params',None)
        event_id =  self.context.get('event_id',None)
        if params['SGS'] == 'OG' and 'chosen_question_set_id' not in attrs :
            raise ValidationException({"chosen_question_set_id":"required field"})
        if params['NAC'] == 1 and 'access_code_submitted' not in attrs:
            raise ValidationException({'access_code_submitted': "required field"})
        validate_question(attrs['chosen_question_set_id'],event_id)
        return attrs


    class Meta:

        model = SubmissionResponse
        fields = ('id','upload_page_no')

    def create(self, validated_data):
        subevent = self.context.get('subevent', None)
        params = self.context.get('params', None)
        event_id = self.context.get('event_id', None)

        req = self.context.get('request')
        sr = SubmissionResponse(**validated_data)
        sr.save()
        return sr


class SubmissionCreateSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()

    def validate_choosen_question_set(self,val):
        event_id = self.context.get('event_id', None)
        event = Event.objects.get(id=event_id)
        assignment = None
        if event:
            assignment = event.assignment

        qs = QuestionSet.objects.filter(id = val.id, assignment__id = assignment.id)
        if qs.count() == 0:
            raise ValidationException(detail="not a valid Question id")
        return val.id



    def validate(self,attrs):
        subevent = self.context.get('subevent',None)
        params = self.context.get('params',None)
        event_id =  self.context.get('event_id',None)
        if params['SGS'] == 'OG' and 'choosen_question_set' not in attrs :
            raise ValidationException({"choosen_question_set":"required field"})
        # if params['NAC'] == 1 and 'access_code_submitted' not in attrs:
        #     raise ValidationException({'access_code_submitted': "required field"})
       # validate_question(attrs['choosen_question_set'],event_id)
        return attrs


    class Meta:

        model = SubmissionGroup
        fields = ('id','access_code_submitted','choosen_question_set')

    def create(self, validated_data):
        subevent = self.context.get('subevent', None)
        params = self.context.get('params', None)
        event_id = self.context.get('event_id', None)
        enrollment_id = self.context.get('enrollment_id',None)
        enrollment = Enrollment.objects.get(id = enrollment_id)
        if params['QSS'] == 'FS':
            validated_data.pop('choosen_question_set')
        if params['NAC'] == 0 and 'access_code_submitted' in validated_data:
            validated_data.pop('access_code_submitted')
        req = self.context.get('request')
        validated_data['subevent'] = subevent.id
        serializer = SubmissionGroupSerializer(data=validated_data)
        serializer.is_valid(raise_exception=True)
        sg = serializer.save()
        #sg = SubmissionGroup(**validated_data)
        #sg.save()
        s_g_h_u_data = {'submission_group' : sg , 'enrollment' : enrollment}
        s_g_h_u = SubmissionGroupHasUser(**s_g_h_u_data)
        s_g_h_u.save()
        return sg


class SubmissionEditSerializer(serializers.ModelSerializer):

    def validate_question(self,question_set_id, event_id):
        event = Event.objects.get(id=event_id)
        assignment = None
        if event:
            assignment = event.assignment

        qs = QuestionSet.objects.filter(id = question_set_id, assignment__id = assignment.id)
        if qs.count() == 0:
            raise ValidationException(detail="not a valid Question id")

    def validate_choosen_question_set(self,val):
        event_id = self.context.get('event_id', None)
        event = Event.objects.get(id=event_id)
        assignment = None
        if event:
            assignment = event.assignment

        qs = QuestionSet.objects.filter(id = val.id, assignment__id = assignment.id)
        if qs.count() == 0:
            raise ValidationException(detail="not a valid Question id")
        return val



    def validate(self,attrs):
        # event_id =  self.context.get('event_id',None)
        # validate_question(attrs['chosen_question_set_id'],event_id)

        return attrs

    class Meta:
        model = SubmissionGroup
        fields = ( 'choosen_question_set',)


class SectionSubmissionGroupViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionGroup
        fields = ('id','access_code_gold','choosen_question_set','access_code_submitted' , 'is_late_submission')



class SectionSubeventViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subevent
        fields = ('id', 'name', 'start_time', 'type', 'end_time', 'is_blocking', 'display_end_time', 'allow_late_ending', 'late_end_time', 'display_late_end_time')
        #depth = 2

class SectionEnrollmentViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class SectionSubmissionGroupDataSerializer(serializers.Serializer):
    submission_group = SectionSubmissionGroupViewSerializer()
    enrollments  = SectionEnrollmentViewSerializer(many=True)

class MySectionSubmissionsSerializer(serializers.Serializer):
    subevent = SectionSubeventViewSerializer(allow_null=True)
    submission_group_data  = SectionSubmissionGroupDataSerializer(many=True,allow_null=True)
    enrollments_without_uploads = SectionEnrollmentViewSerializer(many=True,allow_null=True)
    submission_groups_without_upload = SectionSubmissionGroupViewSerializer(many = True,allow_null=True)



class MySectionSubmissionGroupsSerializer(serializers.Serializer):
    enrollment_list =  serializers.ListField(child=serializers.CharField())
    choosen_question_set = serializers.IntegerField(required=True)

    def validate_choosen_question_set(self,val):
        event_id = self.context.get('event_id', None)
        event = Event.objects.get(id=event_id)
        assignment = None
        if event:
            assignment = event.assignment

        qs = QuestionSet.objects.filter(id = val, assignment__id = assignment.id)
        if qs.count() == 0:
            raise ValidationException(detail="not a valid Question id")
        return val

    def validate_enrollment_list(self,val):
        section_list = self.context.get('section_list',None)
        event_id = self.context.get('event_id',None)
        section_list_enrollments = get_section_list_enrollments(section_list)
        val = [int(i) for i in val]
        is_user_section_intersect = is_lists_intersects(section_list_enrollments , val)

        if not is_user_section_intersect:
            raise ValidationException(detail = "Invalid enrollment list input")

        #validate whether enrollment belongs to any submission group, if yes then throw error
        for enroll_id in val:
            sghu = SubmissionGroupHasUser.objects.filter(enrollment__id = enroll_id , submission_group__subevent__event__id = event_id)
            if sghu.count()>0:
                raise ValidationException(detail = "enrollment can not be part of nultiple submission group within one event")
        #validate supload of all enrollments
        supload =[]
        for enroll_id in val:
            uhs = UserHasSubevents.objects.filter(subevent__event__id = event_id , subevent__type = 'SUPLOAD' , enrollment_id = enroll_id)
            if uhs.count()==0:
                raise ValidationException(detail = "Invalid enrollment list input")
            supload.append(uhs.get().subevent)
        supload= list(set(supload))
        if len(supload)>1:
            raise ValidationException(detail="Invalid enrollment list input")
        supload = supload[0]

        #validate OG$max exceed or not
        params = json.loads(supload.params)
        SGS = params.get('SGS')
        if SGS != 'OG':
            raise PermissionError()
        SGS_OG_max = params.get('SGS_OG_max', 0)
        if len(val)>SGS_OG_max:
            raise ValidationException(detail="Enrollment list exceeded Group max size")
        self.context['supload_subevent'] = supload
        return val

    def validate(self,attrs):

        return attrs


    def create(self, validated_data):
        supload_subevent = self.context.get('supload_subevent', None)
        choosen_question_set = validated_data.get('choosen_question_set')
        sub_group_data = {'subevent' : supload_subevent.id , 'choosen_question_set' : choosen_question_set}
        params = self.context.get('params', None)
        event_id = self.context.get('event_id', None)

        serializer = SubmissionGroupSerializer(data=sub_group_data)
        serializer.is_valid(raise_exception=True)
        submission_group = serializer.save()

        enrollment_ids = validated_data.get('enrollment_list')
        enrollments =[]
        for e in enrollment_ids:
            enrollment = Enrollment.objects.get(id=e)
            submission_group_has_user = SubmissionGroupHasUser(enrollment=enrollment, submission_group=submission_group)
            submission_group_has_user.save()
            enrollments.append(enrollment)
        enrollments = list(set(enrollments))
        return {'submission_group' :submission_group , 'enrollments' : enrollments}
