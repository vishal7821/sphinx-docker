from django.http import Http404
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.decorator import csrf_protection, authentication
from authentication.utils import get_course_data_from_cache
from eventmanager.serializers.event import *


class EventList(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)


    #get all the events with subevents which are related to users
    def get(self, request, course_id):
        events = Event.objects.all()
        serializer = EventViewSerializer(events, many=True)
        return Response(data={'events': serializer.data})





    def post(self,request,course_id):
        serializer = EventCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event  =serializer.save()
        serializer = EventViewSerializer(event)
        return Response(
            {'event': serializer.data}, status=status.HTTP_201_CREATED
        )

class MyEventList(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_objects(self):
        return Event.objects.all()

    def get(self, request, course_id):

        #get enrollment id from cache
        enrollment_id  =get_course_data_from_cache(request, course_id, 'enrollment_id')
        enrollment = Enrollment.objects.get(id=enrollment_id)
        subevents = enrollment.subevents.all()
        ds = {}
        interactivemap = {}
        for subevent in subevents:
            # #fetch all subevents who dont have entries in userhassubevent but correspond to event of current looping subevent for this user
            # rem_subevents = Subevent.objects.filter(event=subevent.event,gen_subevent = subevent)
            if subevent.event.id not in  ds:
                ds[subevent.event.id] = vars(subevent.event)
                ds[subevent.event.id]['subevents'] = list()
                ds[subevent.event.id]['subevents'].append(subevent)
                if subevent.event.assignment_id not in interactivemap:
                    interactivemap[subevent.event.assignment_id] = subevent.event.assignment.is_interactive
            else:
                ds[subevent.event.id]['subevents'].append(subevent)
                if subevent.event.assignment_id not in interactivemap:
                    interactivemap[subevent.event.assignment_id] = subevent.event.assignment.is_interactive

            #append subevents who dont have userhassubevent entry but attached using gen_subevent
            # for remsubevent in rem_subevents:
            #     ds[subevent.event.id]['subevents'].append(remsubevent)
        events = ds.values()
        #print(interactivemap)
        serializer = MyEventViewSerializer(events,many=True)
        temp = serializer.data

        for event in temp:
            for id in interactivemap:
                if event['assignment_id'] == id :
                    event['assignment.is_interactive'] = interactivemap[id]
        return Response({'events':serializer.data})

class EventDetail(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_object(self, pk):
        try:
            return Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            raise Http404

    def put(self, request, course_id, event_id):
        event = self.get_object(event_id)
        serializer = EventUpdateSerializer(event, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, course_id, event_id):
        event = self.get_object(event_id)
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
