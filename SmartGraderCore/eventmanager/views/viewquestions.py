from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.utils import get_course_data_from_cache
from authentication.decorator import csrf_protection, authentication
from eventmanager.serializers.subevent import *
import json
from eventmanager.serializers.questionpaper import MyQuestionsViewSerializer
from helper.utils import get_pdf_encoded_content


class ViewQuestions(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_user_has_subevents(self,enrollment_id,event_id,type):
        # return all the subevents of given type
        uhs = UserHasSubevents.objects.filter(subevent__event__id=event_id, subevent__type=type, enrollment__id = enrollment_id)
        if uhs.count == 0:
            raise exceptions.AccessException(detail="QVIEW subevents doesn't exists for this event")
        return uhs

    def get_question_file(self, obj):
        if bool(obj.question_file_path):
            return get_pdf_encoded_content(file_path=obj.question_file_path.path)

    def get_supplementary_file(self, obj):
        if bool(obj.supplementary_file_path):
            return get_pdf_encoded_content(file_path=obj.supplementary_file_path.path)


    def get(self, request, course_id,event_id):
        # If there does not exist even one QVIEW subevent linked to this event defined for the user who made this request in the table users_have_subevents that is currently going on, return a NOACCESS error and finish.
        enrollment_id = get_course_data_from_cache(request, course_id, 'enrollment_id')
        user_has_subevents = self.get_user_has_subevents(enrollment_id,event_id,'QVIEW')
        question_sets = []
        for user_has_subevent in user_has_subevents:
            subevent = user_has_subevent.subevent
            params = json.loads(subevent.params)
            gen_subevents = params.get('GEN',[])
            q_list = []
            # if subevent.id not in question_sets:
            #     question_sets[subevent.id] = set()

            for gen_subevent_id in gen_subevents:
                gen_subevent = Subevent.objects.get(id = gen_subevent_id)

                if gen_subevent.type == 'SUPLOAD':
                    #check question set scheme
                    params = json.loads(gen_subevent.params)
                    QSS = None
                    if 'QSS' in params:
                        QSS = params['QSS']
                    if QSS == 'OS' or QSS is None:
                        # If it is OS, then add all question_sets that are a part of the assignment to which this event is
                        # linked to the pile which are not already in the pile.
                        assignment = subevent.event.assignment
                        #question_sets[subevent.id].update(assignment.questionset)
                        temp_q_sets=QuestionSet.objects.filter(assignment=assignment)
                        # q_list.extend(assignment.questionset)
                        q_list.extend(temp_q_sets)
                    elif QSS == 'FS':
                        #find the submission group of this user from submission_group_has_users, then find out the question
                        # set associated with that submission group from the table submission_groups and add that question_set
                        # to the pile if it is not already in the pile.
                        submission_group_has_user = SubmissionGroupHasUser.objects.get(enrollment__id=  enrollment_id , submission_group__subevent=gen_subevent.id)
                        #question_sets[subevent.id].update(submission_group_has_user.submission_group.choosen_question_set)
                        q_list.append(submission_group_has_user.submission_group.choosen_question_set)
                elif gen_subevent.type == 'GUPLOAD' or gen_subevent.type == 'RGUPLOAD':
                    grading_duties = list(GradingDuty.objects.filter(subevent__id = gen_subevent.id , grader = enrollment_id))
                    question_set = set()
                    for gd in grading_duties:
                        #question_sets[subevent.id].update(gd.response.questions.question_set)
                        q_list.append(gd.response.question.question_set)
            q_sets = list(set(q_list))
            question_sets.extend(q_sets)
        question_sets = list(set(question_sets))

        ds = {}
        for qset in question_sets:
            # #fetch all subevents who dont have entries in userhassubevent but correspond to event of current looping subevent for this user
            # rem_subevents = Subevent.objects.filter(event=subevent.event,gen_subevent = subevent)

            ds[qset.id] = vars(qset)
            if bool(qset.question_file_path):
                ds[qset.id]['question_file_path'] = qset.question_file_path.path
            if bool(qset.supplementary_file_path):
                ds[qset.id]['supplementary_file_path'] = qset.supplementary_file_path.path
            ds[qset.id]['questions'] = list()
            q_data = Question.objects.filter(question_set = qset, is_actual_question = True)
            ds[qset.id]['questions'].extend(q_data)

        question_sets = ds.values()
        serializer = MyQuestionsViewSerializer(question_sets, many=True)
        return Response(
            {'data': serializer.data}, status= status.HTTP_201_CREATED
        )

