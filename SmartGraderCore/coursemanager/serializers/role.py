from rest_framework import serializers
from helper import exceptions
from coursemanager.models import Role


class RoleViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ('id', 'name', 'action_list')


class RoleEditSerializer(serializers.ModelSerializer):

    def validate_name(self,val):
        if self.instance:
            if val is not None and self.instance.name != val and Role.objects.filter(name=val).exists():
                role_data = Role.objects.filter(name=val)
                if (role_data[0].name == val):
                    raise exceptions.DuplicateEntryException(
                        detail='name already exists for different role,change and try again')
        elif Role.objects.filter(name=val).exists():
            raise exceptions.DuplicateEntryException(
                detail='name already exists for different role,change and try again')
        return val


    class Meta:
        model = Role
        fields = ('name', 'action_list')

