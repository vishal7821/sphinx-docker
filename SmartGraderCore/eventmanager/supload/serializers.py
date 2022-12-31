import json
from rest_framework import serializers, fields
from eventmanager.models import *
from eventmanager.serializers.submissiongroup import SubmissionGroupSerializer
from eventmanager.validators import validate_supload_required_fields, validate_supload_csv_data
from helper import messages, constants
from helper.utils import save_course_file


class SuploadSerializer(serializers.Serializer):
    SBM = serializers.ChoiceField(choices=['OLS','OLI','OSS'])
    SGS = serializers.ChoiceField(choices=['IN','FG','OG'],validators=[],required=False)
    plist_CSV_FILE = serializers.FileField(required=False)
    SGS_OG_max = serializers.IntegerField(validators=[],required=False,allow_null=True) # is SGS is OG we need this field
    QSS = serializers.ChoiceField(choices=['OS','FS'],validators=[],required=False)
    NAC = serializers.BooleanField()
    MUS = serializers.IntegerField(required=False)
    MUT = serializers.CharField(max_length=50,required=False)
    SUP = serializers.BooleanField()
    SUS = serializers.IntegerField(required=False)
    SUT = serializers.ListField(child=serializers.CharField(),required=False)
    DEL = serializers.ListField(child=serializers.CharField(),required=False)
    COL = serializers.CharField(max_length=50,required=False)

    def __init__(self,data = fields.empty,**kwargs):
        super().__init__(data = data,**kwargs)
        self.SBM_TYPES = ['OLS','OLI','OSS']
        self.SGS_TYPES = ['IN','FG','OG']
        self.QSS_TYPES = ['OS','FS']


    def validate(self, kwargs):


        # validate param combination
        # find the list of colmns in csv
        required_csv_fields = []
        s_mode = kwargs.get('SBM')
        event = self.context.get('event')

        #validate csv file is present or not
        if 'participants_spec' not in self.context.get('request').data:
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_13)
        # validate participants_spec must be 0 and participant_CSV must be provided
        if not int(self.context.get('request').data['participants_spec']):
            if not ('plist_CSV_FILE' in kwargs and kwargs.get('plist_CSV_FILE')):
                raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_11)
        else:
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_19_11)

        if s_mode == 'OLI' or s_mode == 'OSS':
            required_csv_fields.append(constants.USERNAME_LIST)
        elif s_mode =='OLS':
            sg_scheme = kwargs.get('SGS')

            if  sg_scheme not in self.SGS_TYPES:
                raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_22)
            if sg_scheme == 'OG' and  kwargs.get('SGS_OG_max') is None:
                raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_25)
            if sg_scheme == 'OG' and kwargs.get('SGS_OG_max')<1:
                raise serializers.ValidationError({'SGS_OG_max':'value should be strictly positive integer'})
            if sg_scheme == 'OG' and kwargs.get('NAC'):
                raise serializers.ValidationError({'NAC':'for open group submission group scheme NAC = true doesnot make sense'})
            required_csv_fields.append(constants.USERNAME_LIST)
            if sg_scheme == 'FG' or sg_scheme == 'IN':

                if not kwargs.get(constants.SUPLOAD_CSV_FILE):
                    raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_15)

                qs_scheme = kwargs.get('QSS')

                if not qs_scheme:
                    raise serializers.ValidationError({'QSS':'required field'})


                # qs_scheme can be open only if there are 2 question set associated with this assignment
                if qs_scheme == 'OS' and event and event.assignment and event.assignment.questionset and event.assignment.questionset.count()<2:
                    raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_23)

                #if SGS  = OG then qs_scheme must be OG if question set count>1 else qs_scheme must fixed
                if sg_scheme == 'OG' and event.assignment.questionset.count()>1 and qs_scheme == 'FS':
                    raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_23)
                if qs_scheme == 'FS':
                    required_csv_fields.append(constants.QUESTION_SET_NAME)


                na_code = kwargs.get('NAC')

                if na_code:
                    required_csv_fields.append(constants.SECRET_ACCESS_CODE)

            # validate fields MUS, MUT, SUP, SUS, SUT, DEl, COL
            validate_supload_required_fields(kwargs)

        self.context['required_csv_fields'] = required_csv_fields

        # validate csv data
        if required_csv_fields:
            self.context['group_list'] = validate_supload_csv_data(kwargs.get(constants.SUPLOAD_CSV_FILE),required_csv_fields,event,self.context.get('course_id'))
        return kwargs


    def save(self):
        # create a group, add users to group (populate users has group table)
        # create subevent
        # create subevent for users (populate users has subevent table)
        # update the param field in subevent table
        data = self.validated_data
        course_id = self.context.get('course_id')
        subevent = self.context.get('subevent')
        if data.get('SBM') in ['OLS']:

            group_list = self.context.get('group_list',[])

            if data.get('SGS') in ['FG','IN']:
                for g in group_list:
                    group = {}

                    if constants.QUESTION_SET_NAME in g:
                        group['choosen_question_set'] = QuestionSet.objects.get(name = g.get(constants.QUESTION_SET_NAME),
                                                                                               assignment_id=subevent.event.assignment_id).id
                    if constants.SECRET_ACCESS_CODE in g:
                        group['access_code_gold'] = g[constants.SECRET_ACCESS_CODE]
                    group['subevent'] = subevent.id
                    serializer = SubmissionGroupSerializer(data=group)
                    serializer.is_valid(raise_exception=True)
                    submission_group = serializer.save()

                    enrollments = g['enrollment_list']


                    for e in enrollments:
                        enrollment = Enrollment.objects.get(id = e)
                        submission_group_has_user = SubmissionGroupHasUser(enrollment = enrollment, submission_group = submission_group)
                        submission_group_has_user.save()


            # also add thses user subevent
            for g in group_list:
                enrollments = g['enrollment_list']

                for e in enrollments:
                    enrollment = Enrollment.objects.get(id=e)
                    user_has_subevent = UserHasSubevents(subevent=subevent, enrollment=enrollment)
                    user_has_subevent.save()


        #save csv file in course dir
        file = data.get(constants.SUPLOAD_CSV_FILE)
        filename = save_course_file(file,file.name,course_id)

        #todo save this filename in courselog table

        #save params
        data['CSV_filename'] = filename
        data.pop(constants.SUPLOAD_CSV_FILE)
        subevent.params = json.dumps(data)
        subevent.save()





