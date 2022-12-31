from django.conf.urls import url
from django.urls import path
from authentication.views.login import LoginView
from authentication.views.logout import LogoutView
from authentication.views.account import AccountDetail
from authentication.views.password_change import PasswordChangeView
from authentication.views.password_reset import *
from authentication.views.csrf import CsrfTokenView

urlpatterns = [
    url(r'^login/$', LoginView.as_view(), name='login'),
    url(r'^logout/$', LogoutView.as_view(), name='logout'),
    url(r'^account/$', AccountDetail.as_view(),name='account'),
    url(r'^password/change/$', PasswordChangeView.as_view(),name='password_change'),
    url(r'^reset/password/$', PasswordResetView.as_view(),name='reset_password'),
    url(r'^confirm/reset/password/$', PasswordResetConfirmView.as_view(),name='confirm_reset_password'),
    url(r'^csrf_token/$',CsrfTokenView.as_view(),name='csrf_token')
]
