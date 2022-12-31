import json

from rest_framework import serializers, exceptions

from eventmanager.models import *
from helper import messages, constants, exceptions

#In modifyGrader , grader change implementation is handled for question_id = empty ,todo handle gradingduty updation for grader change in case of GUPLOAD is noy MQS,MQR or RGUPLOAD is not QRN
class ModifyGraderSerializer(serializers.Serializer):
    grader_id = serializers.IntegerField(required=True)
    question_id = serializers.IntegerField(required=True)
    new_graders =serializers.ListField(child=serializers.IntegerField(min_value=0, max_value=100))

    def get_enrollment(self,en_id):
        try:
            return Enrollment.objects.get(id=en_id)
        except Enrollment.DoesNotExist:
            raise exceptions.AccessException()


    def validate_grader_id(self,grader_id):
        # validate grader and it's role
        enrollment = self.get_enrollment(grader_id)
        if enrollment.role.id != constants.ROLE_GRADER_ID:
            raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_16)

        return grader_id

    def validate_question_id(self,question_id):
        # validate questions
        try:
            if not Question.objects.filter(id =question_id).exists():
                raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_17)

        except Question.DoesNotExist:
            raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_17)

        return question_id

    def validate_new_graders(self,val):
        for g in val:
            self.validate_grader_id(g)
        return val

    def _validate_subevent(self,subevent_id):
        # validate if subevent is of type gupload or rgupload
        try:
            subevent = Subevent.objects.get(id= subevent_id)
            if subevent and (subevent.type != constants.SUBEVENT_TYPE_GUPLOAD and subevent.type != constants.SUBEVENT_TYPE_RGUPLOAD):
                raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_18)
            else:
                return subevent
        except Subevent.DoesNotExist:
            raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_17)


    def validate(self,attrs):
        #validate subevent type
        subevent = self._validate_subevent(self.context.get('subevent_id'))

        # validate question_id , grader_id pair is linked to this subevent
        params = json.loads(subevent.params)

        datalist = params.get('data_list',None)
        question_data = None
        is_que_present = False
        grader_cnt=0
        if len(datalist)>0:
            for  data in datalist:
                if attrs['grader_id'] in data.get('grader_list'):
                    grader_cnt+=1

                if data.get('question_id',None) == attrs['question_id']:
                    is_que_present = True
                    if attrs['grader_id'] not in data['grader_list'] :
                        raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_45)
                    else:
                        g_list =data['grader_list']
                        g_list.remove(attrs['grader_id'])
                        g_list.extend(attrs['new_graders'])
                        data['grader_list'] = list(set(g_list))


            if not is_que_present:
                raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_46)

        elif attrs['grader_id'] in params[constants.SUBEVENT_GUPLOAD_PARAM_GRADER_LIST]:
            grader_cnt+=1
        else:
            raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_45)




        self.context['grader_cnt'] = grader_cnt
        self.context['data_list'] = datalist
        self.context['subevent'] = subevent

        return attrs

    def save(self):
        # for this grader , for the response of this question find all the grading duties ,
        validated_data = self.validated_data
        grading_duties = GradingDuty.objects.filter(response__question__id = validated_data['question_id'],
                                                    grader__id = validated_data['grader_id'])
        # distribute this grading duties among new graders
        new_graders = validated_data['new_graders']
        subevent = self.context.get('subevent')
        num = len(new_graders)
        for i,g_d in enumerate(grading_duties):
            new_grader = new_graders[i%num]
            g_d.update(grader = new_grader)
            if not UserHasSubevents.objects.filter(enrollment_id = new_grader.id , subevent_id = subevent.id ):
                #cretate user has subevent
                userhassubevent = UserHasSubevents(enrollment_id = new_grader.id, subevent = subevent.id)
                userhassubevent.save()
        # Also modify the GLIST or RGLIST parameters of this subevent appropriately to
        # reflect the new grader assignment.
        params = json.loads(subevent.params)
        if subevent.type == constants.SUBEVENT_TYPE_GUPLOAD:
            glist = params.get(constants.SUBEVENT_GUPLOAD_PARAM_GRADER_LIST)
            if(self.context.get('grader_cnt')==1):
                glist.remove(validated_data['grader_id'])
            glist.extend(new_graders)
            params[constants.SUBEVENT_GUPLOAD_PARAM_GRADER_LIST] = list(set(glist))
        elif subevent.type == constants.SUBEVENT_TYPE_RGUPLOAD:
            rglist = params.get(constants.SUBEVENT_GUPLOAD_PARAM_REGRADER_LIST)
            if (self.context.get('grader_cnt') == 1):
                rglist.remove(validated_data['grader_id'])
            rglist.extend(new_graders)
            params[constants.SUBEVENT_GUPLOAD_PARAM_REGRADER_LIST] = list(set(rglist))
        params['data_list'] = self.context.get('data_list')
        subevent.params = json.dumps(params)
        subevent.save()
        #returning the updated params
        return subevent.params
