from django.db import models
from safedelete.models import SafeDeleteModel
from safedelete.models import SOFT_DELETE_CASCADE
from django.contrib.auth.hashers import make_password
from django.utils.crypto import get_random_string


class SafeDeleteAndAuditDetailsModel(SafeDeleteModel):
    _safedelete_policy = SOFT_DELETE_CASCADE

    created_at = models.DateTimeField(auto_now_add=True,null=True)
    created_by = models.CharField(max_length=100, null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)
    updated_by = models.CharField(max_length=100, null=True)
    deleted_by = models.CharField(max_length=100, null=True,blank=True)

    class Meta:
        abstract = True