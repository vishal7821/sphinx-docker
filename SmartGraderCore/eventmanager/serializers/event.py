from rest_framework import serializers

from assignmentmanager.serializers.assignment import AssignmentsViewSerializer, AssignmentViewSerializer
from eventmanager.models import *
from eventmanager.serializers.subevent import SubeventViewSerializer,MySubeventViewSerializer
from helper import messages, exceptions


# class EventCreateSerializer(serializers.ModelSerializer):
#     assignment_id = serializers.IntegerField(required=False )
#     is_external = serializers.BooleanField(required=False)
#     name = serializers.CharField(max_length=100, validators=[])
#
#     def validate_name(self,val):
#         if self.instance:
#             if val is not None and self.instance.name != val and Event.objects.filter(name=val).exists():
#                 raise exceptions.DuplicateEntryException(
#                     detail='name already exists for different event,change and try again')
#         elif Event.objects.filter(name=val).exists():
#             raise exceptions.DuplicateEntryException(
#                 detail='name already exists for different event,change and try again')
#         return val
#
#
#     def validate_assignment_id(self,val):
#         if val is not None and not Assignment.objects.filter(pk = val).exists():
#             raise serializers.ValidationError(**messages.EVENT_MANAGER_NOEXIST_1)
#         return val
#
#     def validate_grade_aggregation_method(self,val):
#         methods = ['AVG', 'MAX', 'MIN','MED']
#         if not val in methods:
#             raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_2)
#         return val
#
#     def validate(self, attrs):
#         if ('assignment_id' in attrs and attrs['assignment_id']) and ('is_external' in attrs and  attrs['is_external']):
#             raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_1)
#
#         if not ('assignment_id' in attrs and attrs['assignment_id']  ) and not ('is_external' in attrs and  attrs['is_external']):
#             raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_3)
#
#
#         return attrs
#
#     class Meta:
#         model = Event
#         fields = ('name','assignment_id','grade_aggregation_method','is_external')

class EventCreateSerializer(serializers.ModelSerializer):

    def validate_name(self,val):
        if self.instance:
            if val is not None and self.instance.name != val and Event.objects.filter(name=val).exists():
                raise exceptions.DuplicateEntryException(
                    detail='name already exists for different event,change and try again')
        elif Event.objects.filter(name=val).exists():
            raise exceptions.DuplicateEntryException(
                detail='name already exists for different event,change and try again')
        return val

    def validate_grade_aggregation_method(self,val):
        methods = ['AVG', 'MAX', 'MIN','MED']
        if not val in methods:
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_2)
        return val

    def validate(self, attrs):
        if ('assignment' in attrs and attrs['assignment']) and ('is_external' in attrs and  attrs['is_external']):
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_1)

        if not ('assignment' in attrs and attrs['assignment']  ) and not ('is_external' in attrs and  attrs['is_external']):
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_3)


        return attrs

    class Meta:
        model = Event
        fields = ('name','assignment','grade_aggregation_method','is_external')



class EventUpdateSerializer(serializers.ModelSerializer):

    def validate_name(self,val):
        if self.instance:
            if val is not None and self.instance.name != val and Event.objects.filter(name=val).exists():
                raise exceptions.DuplicateEntryException(
                    detail='name already exists for different event,change and try again')
        elif Event.objects.filter(name=val).exists():
            raise exceptions.DuplicateEntryException(
                detail='name already exists for different event,change and try again')
        return val

    def validate_grade_aggregation_method(self,val):
        methods = ['AVG', 'MAX', 'MIN','MED']
        if not val in methods:
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_2)
        return val

    def validate(self, attrs):
        if ('assignment' in attrs and attrs['assignment']) and ('is_external' in attrs and  attrs['is_external']):
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_1)

        if not ('assignment' in attrs and attrs['assignment']  ) and not ('is_external' in attrs and  attrs['is_external']):
            raise serializers.ValidationError(**messages.EVENT_MANAGER_NOVAL_3)

        if ('assignment' in attrs and attrs['assignment']  ) and not ('is_external' in attrs and  attrs['is_external']):
            attrs['is_external'] = 0
        return attrs


    class Meta:
        model = Event
        fields = ('name','assignment','grade_aggregation_method','is_external')

class EventViewSerializer(serializers.ModelSerializer):
    subevents = SubeventViewSerializer(many=True)
    class Meta:
        model = Event
        fields = ('id', 'name', 'assignment_id', 'is_external', 'grade_aggregation_method','subevents')
        #depth = 2


class MyEventViewSerializer(serializers.ModelSerializer):
    subevents = MySubeventViewSerializer(many=True)
    #assignments = Assignment.objects.all()
    #assignments_data = AssignmentsViewSerializer(assignments, many=True)
    #extra_kwargs = {'assignments': serializer.data}
    class Meta:
        model = Event
        fields = ('id', 'name', 'assignment_id', 'is_external','subevents')
        #depth = 1

