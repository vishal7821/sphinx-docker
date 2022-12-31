from django.conf.urls import url
from django.urls import path
from assignmentmanager.views import *
from coursemanager.views.course import *
from coursemanager.views.enrollment import *
from coursemanager.views.role import *
from coursemanager.views.section import *
from coursemanager.views.topic import *
from eventmanager.views import *


urlpatterns = [
    url(r'^(?P<course_id>[\w\-]+)/$', CourseDetail.as_view(), name='course'),

    url(r'^(?P<course_id>[\w\-]+)/roles/$', RoleList.as_view(), name='role_list'),
    url(r'^(?P<course_id>[\w\-]+)/roles/(?P<role_id>[\w\-]+)/$', RoleDetail.as_view(), name='role_detail'),

    url(r'^(?P<course_id>[\w\-]+)/topics/$', TopicList.as_view(), name='topic_list'),
    url(r'^(?P<course_id>[\w\-]+)/topic/(?P<topic_id>[\w\-]+)/$', TopicDetail.as_view(), name='topic_detail'),

    url(r'^(?P<course_id>[\w\-]+)/topics/$', TopicList.as_view(), name='topic_list'),
    url(r'^(?P<course_id>[\w\-]+)/topic/(?P<topic_id>[\w\-]+)/$', TopicDetail.as_view(), name='topic_detail'),

    url(r'^(?P<course_id>[\w\-]+)/sections/$', SectionList.as_view(), name='section_list'),
    url(r'^(?P<course_id>[\w\-]+)/section/(?P<section_id>[\w\-]+)/$', SectionDetail.as_view()
        , name='section_detail'),

    url(r'^(?P<course_id>[\w\-]+)/enrollments/$', EnrollmentList.as_view(), name='enrollment_list'),
    url(r'^(?P<course_id>[\w\-]+)/enrollment/(?P<enrollment_id>[\w\-]+)/$', EnrollmentDetail.as_view()
        , name='enrollment_detail'),
]