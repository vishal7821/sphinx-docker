from django.http import Http404
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.decorator import csrf_protection, authentication
from eventmanager.gupload.serializers import GuploadSerializer
from eventmanager.rgreq.serializers import RgreqSerializer
from eventmanager.rgupload.serializers import RguploadSerializer
from eventmanager.serializers.subevent import *
from eventmanager.supload.serializers import SuploadSerializer

class SubeventList(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)


    # def get_event(self,event_id):
    #     try:
    #         return Event.objects.get(pk = event_id)
    #     except Event.DoesNotExist:
    #         raise serializers.ValidationError(messages.EVENT_MANAGER_NOVAL_11)


    def post(self, request, course_id,event_id):
        type = request.data.get('type')
        param_serializer = None
        subevent = None
        context = {'request': request,'course_id':course_id, 'event': event_id}
        mutable = request.POST._mutable
        request.POST._mutable = True
        request.data['event'] = event_id
        request.POST._mutable = mutable
        serializer = SubeventCreateSerializer(data=request.data, context = context)

        if type in ['QVIEW', 'AVIEW']:
            param_serializer = AQviewSerializer(data= request.data, context = context)
        elif type in ['SVIEW', 'MVIEW' , 'RMVIEW','GVIEW','RGVIEW']:
            param_serializer = SMRMGRGviewSerializer(data= request.data, context = context)
        elif type == 'SUPLOAD':
            param_serializer = SuploadSerializer(data = request.data, context = context)
        elif type == 'GUPLOAD':
            param_serializer = GuploadSerializer(data = request.data, context = context)
        elif type == 'RGREQ':
            param_serializer = RgreqSerializer(data=request.data, context=context)
        elif type == 'RGUPLOAD':
            param_serializer = RguploadSerializer(data=request.data, context=context)


        serializer.is_valid(raise_exception=True)
        param_serializer.context['event'] = serializer.validated_data.get('event')
        param_serializer.is_valid(raise_exception=True)
        subevent = serializer.save()
        param_serializer.context['subevent'] = subevent
        param_serializer.save()



        if 'event' in serializer.validated_data:
            serializer.validated_data.pop('event')
        if 'gen_subevent' in serializer.validated_data:
            serializer.validated_data.pop('gen_subevent')
        ser = SubeventViewSerializer(subevent)
        return Response(
            {'data': ser.data}, status= status.HTTP_201_CREATED
        )


class SubeventDetail(APIView):

    # @method_decorator(csrf_protection)
    # @method_decorator(authentication)
    # def dispatch(self, *args, **kwargs):
    #     return super().dispatch(*args, **kwargs)

    def get_object(self, event_id, subevent_id):
        try:
            return Subevent.objects.get(event_id = event_id, id  = subevent_id)
        except Subevent.DoesNotExist:
            raise exceptions.AccessException()

    def put(self, request, course_id, event_id, subevent_id):
        subevent = self.get_object(event_id, subevent_id)
        context = {'event_id':event_id}
        serializer = SubeventUpdateSerializer(subevent, data=request.data, context=context)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


    def delete(self, request, course_id, event_id,subevent_id):
        #todo check if cascading delete is working
        subevent = self.get_object(event_id,subevent_id)
        subevent.delete()
        return Response({'detail': 'subevent deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

