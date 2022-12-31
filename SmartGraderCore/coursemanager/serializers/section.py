from rest_framework import serializers

from coursemanager.models import Section
from helper import messages, exceptions

class SectionViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ('id', 'name')


class SectionEditSerializer(serializers.ModelSerializer):

    def validate_name(self,val):
        if self.instance:
            if val is not None and self.instance.name != val and Section.objects.filter(name=val).exists():
                raise exceptions.DuplicateEntryException(
                    detail='name already exists for different section,change and try again')
        elif Section.objects.filter(name=val).exists():
            raise exceptions.DuplicateEntryException(
                detail='name already exists for different event,change and try again')
        return val

    class Meta:
        model = Section
        fields = ('name',)

