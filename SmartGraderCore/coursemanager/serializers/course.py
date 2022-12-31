from rest_framework import serializers
from authentication.models import Course
from helper import exceptions


class CourseViewSerializer(serializers.ModelSerializer):

    def validate_name(self,val):
        if self.instance:
            if val is not None and self.instance.name != val and Course.objects.filter(name=val).exists():
                raise exceptions.DuplicateEntryException(
                    detail='name already exists for different course,change and try again')
        elif Course.objects.filter(name=val).exists():
            raise exceptions.DuplicateEntryException(
                detail='name already exists for different course,change and try again')
        return val

    def validate_title(self,val):
        if self.instance:
            if val is not None and self.instance.title != val and Course.objects.filter(title=val).exists():
                raise exceptions.DuplicateEntryException(
                    detail='title already exists for different course,change and try again')
        elif Course.objects.filter(title=val).exists():
            raise exceptions.DuplicateEntryException(
                detail='title already exists for different course,change and try again')
        return val



    class Meta:
        model = Course
        fields = ('name','title', 'description', 'semester', 'year', 'department', 'is_active')


