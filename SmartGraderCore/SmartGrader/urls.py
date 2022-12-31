"""SmartGrader URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.urls import path

from coursemanager.views.course import *
from coursemanager.views.enrollment import *
from coursemanager.views.role import *
from coursemanager.views.section import *
from coursemanager.views.topic import *

from assignmentmanager.views.questiontopic import *
from assignmentmanager.views.question import *
from assignmentmanager.views.questionset import *
from assignmentmanager.views.assignment import *
from assignmentmanager.views.questionsetfile import *
from assignmentmanager.views.rubric import *

from eventmanager.views.event import *
from eventmanager.views.subevent import *
from eventmanager.views.modifygrader import *
from eventmanager.views.viewquestions import *
from eventmanager.views.viewSolutions import *
#from submissionmanager.views import impersonatedSubmission
from submissionmanager.views.autogradingmanager import AutoGrade
from submissionmanager.views.bulkupload import BulkUpload, UserRecognition, BulkSubmissionDetail
from submissionmanager.views.submission import *
from submissionmanager.views.mainsubmission import *
from submissionmanager.views.questionpagination import *
from submissionmanager.views.supplementarysubmission import *
from submissionmanager.views.joingroup import *
from submissionmanager.views.allsubmissions import *
from submissionmanager.views.allmainsubmission import *
from submissionmanager.views.allsuppsubmission import *
from submissionmanager.views.myresponses import *
from submissionmanager.views.responsepagination import *
from submissionmanager.views.graderassignment import *
from submissionmanager.views.mygradingduties import *
from submissionmanager.views.mymarks import *
from submissionmanager.views.sectionsubmissions import *
from submissionmanager.views.regraderassignment import *

urlpatterns = [
    path('auth/', include('authentication.urls')),

    # --------------------------course manager start ---------------------------
    url(r'^courses/$', CourseList.as_view(), name='course'),
    url(r'^course/(?P<course_id>[\w\-]+)/$', CourseDetail.as_view(), name='course'),

    url(r'^course/(?P<course_id>[\w\-]+)/roles/$', RoleList.as_view(), name='role_list'),
    url(r'^course/(?P<course_id>[\w\-]+)/role/(?P<role_id>[\w\-]+)/$', RoleDetail.as_view(), name='role_detail'),

    url(r'^course/(?P<course_id>[\w\-]+)/topics/$', TopicList.as_view(), name='topic_list'),
    url(r'^course/(?P<course_id>[\w\-]+)/topic/(?P<topic_id>[\w\-]+)/$', TopicDetail.as_view(), name='topic_detail'),

    # url(r'^course/(?P<course_id>[\w\-]+)/topics/$', TopicList.as_view(), name='topic_list'),
    # url(r'^course/(?P<course_id>[\w\-]+)/topic/(?P<topic_id>[\w\-]+)/$', TopicDetail.as_view(), name='topic_detail'),

    url(r'^course/(?P<course_id>[\w\-]+)/sections/$', SectionList.as_view(), name='section_list'),
    url(r'^course/(?P<course_id>[\w\-]+)/section/(?P<section_id>[\w\-]+)/$', SectionDetail.as_view()
        , name='section_detail'),

    url(r'^course/(?P<course_id>[\w\-]+)/enrollments/$', EnrollmentList.as_view(), name='enrollment_list'),
    url(r'^course/(?P<course_id>[\w\-]+)/enrollment/(?P<enrollment_id>[\w\-]+)/$', EnrollmentDetail.as_view()
        , name='enrollment_detail'),

    # --------------------------course manager end ---------------------------




    # ------------------------- assignment manager start ------------------------
    # assignment
    url(r'^course/(?P<course_id>[\w\-]+)/assignments/$', AssignmentList.as_view(), name='assignments-list'),
    url(r'^course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/$', AssignmentDetail.as_view(),
        name='assignments-detail'),

    # question_set
    url(r'^course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_sets/$', QuestionSetList.as_view(),
        name='question_set_list'),
    url(r'^course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/$', QuestionSetDetail.as_view(),
        name='question_set_detail'),

    #question set file processing
    url(r'^course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/question_file/$', QuestionSetFile.as_view(),
        name='question_set_file'),
    url(r'^course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
            r'(?P<question_set_id>[\w\-]+)/question_file/images/$', QuestionSetFileImages.as_view(),
            name='question_set_file_images'),
    url(r'^course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
            r'(?P<question_set_id>[\w\-]+)/solution_file/$', QuestionSetSolutionFile.as_view(),
            name='question_set_solution_file'),
    url(r'^course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
            r'(?P<question_set_id>[\w\-]+)/supplementary_file/$', QuestionSetSupplementaryFile.as_view(),
            name='question_set_supplementary_file'),

    # question
    url(r'^course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/questions/$', QuestionList.as_view(),
        name='question_List'),
    url(r'^course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/$', QuestionDetail.as_view(),
        name='question_Detail'),

    #rubrics
    url(r'^course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/rubrics/$', RubricList.as_view(),
        name='rubric_list'),
    url(r'^course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/rubric/(?P<rubric_id>[\w\-]+)/$', RubricDetail.as_view(),
        name='rubric_detail'),

    # link topic to question
    url(r'^course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/topic/(?P<topic_id>[\w\-]+)/$',
        QuestionTopicView.as_view(),
        name='link_question_topic'),

    # ------------------------- assignment manager end ------------------------

    #--------------------------Event Manager start---------------------------------
    url(r'^course/(?P<course_id>[\w\-]+)/events/$', EventList.as_view(), name='event_list'),
    url(r'^course/(?P<course_id>[\w\-]+)/myevents/$', MyEventList.as_view(), name='my_event_list'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/$', EventDetail.as_view(), name='event_details'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevents/$', SubeventList.as_view(), name='subevent_list'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/$', SubeventDetail.as_view(), name='subevent_details'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/graderList/$', ModifyGrader.as_view(), name='modify_grader'),
    #-------------------------- Event Manager end ---------------------------------------

    #------------------------------Qview start--------------------------------------------
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myQuestions/$', ViewQuestions.as_view(), name='my_questions'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySolutions/$', ViewSolutions.as_view(), name='my_solutions'),
    #------------------------------Qview end ---------------------------------------------

    #----------------------- Submission Start---------------------------------------------------
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/$', Submission.as_view(), name='submission'),


    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmission/verifyNAC/$', SubmissionNAC.as_view(),
        name='submissionNAC'),

    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/main/$', MainSubmission.as_view(), name='main_submissions'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/supplementary/$', SuppSubmission.as_view(),name='supplementary_submissions'),

    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/submissions/paginate/(?P<question_id>[\w\-]+)/(?P<page_no>[\w\-]+)/$', QuestionPagination.as_view(), name='question_paginate'),


    #------------------------Submission End --------------------------------------------------------

    #------------------------ submission group start-------------------------------------------------
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/(?P<submission_group_id>[\w\-]+)/join/$',
        JoinSubmissionGroup.as_view(), name='join_submission_group'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/allSubmissions/$',
        AllSubmissions.as_view(), name='all_submissions'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/allSubmissions/(?P<submission_group_id>[\w\-]+)/main/$',
        AllMainSubmissions.as_view(), name='submission_group_main'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/allSubmissions/(?P<submission_group_id>[\w\-]+)/supplementary/$',
            AllSuppSubmissions.as_view(), name='submission_group_supplementary'),
    #-------------------------submission group end --------------------------------------------------

    #-------------------------My submission start-----------------------------------------------------

    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myResponses/$',
        MyResponses.as_view(), name='my_responses'),
    #url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myResponses/(?P<question_id>[\w\-]+)/(?P<page_no>[\w\-]+)/$',
    #    ResponsePagination.as_view(), name='response_pagination'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myResponses/(?P<question_id>[\w\-]+)/$',
        ResponsePagination.as_view(), name='response_pagination'),
    #-------------------------My submission end -----------------------------------------------------

    # -------------------------Grader start-----------------------------------------------------

    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/doGraderAssignment/$',
        GraderAssignment.as_view(), name='grader_assignment'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myGrading/(?P<subevent_id>[\w\-]+)/$',
        MyGradingDuties.as_view(), name='my_grading_duties'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myGrading/(?P<subevent_id>[\w\-]+)/gradingDuty/(?P<gradingduty_id>[\w\-]+)/$',
        MyGradingDutyDetail.as_view(), name='my_grading_duty_detail'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myGrading/(?P<subevent_id>[\w\-]+)/gradingDuty/(?P<gradingduty_id>[\w\-]+)/main/$',
        MyGradingDutyMainFile.as_view(), name='my_grading_duty_main'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myGrading/(?P<subevent_id>[\w\-]+)/gradingDuty/(?P<gradingduty_id>[\w\-]+)/supplementary/$',
        MyGradingDutySuppFile.as_view(), name='my_grading_duty_supp'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myGrading/(?P<subevent_id>[\w\-]+)/gradingDuty/(?P<gradingduty_id>[\w\-]+)/(?P<rubric_id>[\w\-]+)/$',
        MyGradingDutyRubrics.as_view(), name='my_grading_duty_rubrics'),
    # -------------------------grader end -----------------------------------------------------

    #--------------------------Student marks view start----------------------------------------------
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myMarks/$',
        MyMarks.as_view(), name='my_marks'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissionMarks/$',
        MySubmissionMarks.as_view(), name='my_submission_marks'),
    #--------------------------Student marks view end-----------------------------------------------

    #--------------------------Regrader start------------------------------------------------------
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/response/(?P<response_id>[\w\-]+)/regrading/$',
        RegraderAssignment.as_view(), name='regrading'),
    #--------------------------Regrader end------------------------------------------------------

    #--------------------------section submission start--------------------------------------------
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionSubmissions/$',
        MySectionSubmission.as_view(), name='my_section_submissions'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionSubmissionGroups/$',
        MySectionSubmissionGroups.as_view(), name='my_section_submission_groups'),

    #--------------------------section submission end-----------------------------------------------

    #-------------------------masquaraded urls start------------------------------------------------

    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionSubmissionGroup/(?P<submission_group_id>[\w\-]+)/$',
        Submission.as_view(), {'is_masqueraded': True},name='super_submission'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionSubmissionGroup/(?P<submission_group_id>[\w\-]+)/main/$',
        MainSubmission.as_view(), {'is_masqueraded': True},name='super_main_submission'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionSubmissionGroup/(?P<submission_group_id>[\w\-]+)/supplementary/$',
        SuppSubmission.as_view(), {'is_masqueraded': True},name='super_supp_submission'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionEnrollment/(?P<enrollment_id>[\w\-]+)/mySectionSubmissionGroups/(?P<submission_group_id>[\w\-]+)/join/$',
        JoinSubmissionGroup.as_view(), {'is_masqueraded': True},name='super_join_submission_group'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySectionSubmissionGroup/(?P<submission_group_id>[\w\-]+)/responses/$',
        MyResponses.as_view(), {'is_masqueraded': True},name='super_responses'),

    #-------------------------masquaraded urls start------------------------------------------------

    #--------------------------Bulk Submission start------------------------------------------------------
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/bulkUpload/$',
        BulkUpload.as_view(), name='bulkUpload'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/recognizeUsers/$',
        UserRecognition.as_view(), name='recgnizeUsers'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/upload/(?P<upload_id>[\w\-]+)/bulkUploadDetail/$',
        BulkSubmissionDetail.as_view(), name='bulkUploadDetail'),
    #--------------------------Bulk Submission end------------------------------------------------------

#--------------------------Auto Grading start------------------------------------------------------
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/subevent/(?P<subevent_id>[\w\-]+)/question/(?P<question_id>[\w\-]+)/autoGrade/$',
        AutoGrade.as_view(), name='autoGrade'),

    url(r'^course/(?P<course_id>[\w\-]+)/assignment/(?P<assignment_id>[\w\-]+)/question_set/'
        r'(?P<question_set_id>[\w\-]+)/interactivequestion/(?P<question_id>[\w\-]+)/$', InteractiveQuestionList.as_view(),
        name='interactive_question_List'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/(?P<user_id>[\w\-]+)/$', ImpersonatedSubmission.as_view(), name='impersonatedsubmission'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/mySubmissions/main/(?P<user_id>[\w\-]+)/$', ImpersonatedMainSubmission.as_view(), name='impersonated_main_submissions'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/impersonatedResponses/(?P<user_id>[\w\-]+)/$', ResponsePage.as_view(), name='impersonated_response_submissions'),
    url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/impersonatedResponses/(?P<question_id>[\w\-]+)/(?P<user_id>[\w\-]+)/$', ResponsesPage.as_view(), name='impersonated_response_submissions'),


    #url(r'^course/(?P<course_id>[\w\-]+)/event/(?P<event_id>[\w\-]+)/myResponses/(?P<user_id>[\w\-]+)/$',ImpersonatedResponsesPagination.as_view(), name='impersonatedresponse_pagination'),
    #--------------------------Auto Grahttp://localhost:3000/course/1/event/9/mySubmissions/main/ding end------------------------------------------------------

 ]
