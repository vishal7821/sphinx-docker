from rest_framework import serializers
from authentication.utils import update_course_details_in_cache
from authentication.models import User , UserHasCourses
from coursemanager.models import Role, Enrollment, Section, EnrollmentHasSections
#EnrollmentHasSection
from helper.utils import create_user
from helper.validators import alphanumeric, email_validator
from coursemanager.serializers.role import RoleViewSerializer
from coursemanager.serializers.section import SectionViewSerializer
from helper import  exceptions


class CourseViewSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField(max_length=100,required=False,allow_null=True)


class UserViewSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField(max_length=100)
    roll_no = serializers.CharField(max_length=100,required=False,allow_null=True)
    first_name = serializers.CharField(max_length=100,required=False,allow_null=True)
    last_name = serializers.CharField(max_length=100,required=False,allow_null=True)
    email = serializers.EmailField(max_length=100,required=False,allow_null=True)
    department = serializers.CharField(max_length=100,required=False,allow_null=True)
    program = serializers.CharField(max_length=100,required=False,allow_null=True)
    last_login = serializers.DateTimeField(required=False,allow_null=True)
    last_login_ip = serializers.IPAddressField(allow_null=True,required=False)
    courses = CourseViewSerializer(many=True)


class EnrollmentViewSerializer(serializers.ModelSerializer):
    id = serializers.CharField(max_length=128)
    user = UserViewSerializer()
    role = RoleViewSerializer()
    sections = SectionViewSerializer(many=True)

    class Meta:
        model = Enrollment
        fields = ('id', 'user', 'role', 'sections')


class EnrollmentUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(validators=[alphanumeric])
    email = serializers.CharField(validators=[email_validator])

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'program', 'department', 'email')


class EnrollmentRoleSerializer(serializers.ModelSerializer):
    name = serializers.CharField()

    def validate(self, data):
        if not Role.objects.filter(name=data['name']).exists():
            raise serializers.ValidationError("Role doesn't exists")
        return data

    class Meta:
        model = Role
        fields = ('name',)
        validators = []


class EnrollmentSectionSerializer(serializers.ModelSerializer):
    name = serializers.CharField()

    def validate(self, data):
        if not Section.objects.filter(name=data['name']).exists():
            raise serializers.ValidationError("Section doesn't exists")
        return data

    class Meta:
        model = Section
        fields = ('name',)
        validators = []


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    user = EnrollmentUserSerializer()
    role = EnrollmentRoleSerializer()
    sections = EnrollmentSectionSerializer(many=True)

    def validate(self,attrs):
        # if this user is already enrolled in course raise NODUP error
        user = attrs.get('user')
        if user and UserHasCourses.objects.filter(user__username = user.get('username'), course__id = self.context.get('course_id')).exists():
            raise exceptions.DuplicateEntryException(detail="user can't be enrolled twice in a course")

        return attrs

    class Meta:
        model = Enrollment
        fields = ('user', 'role', 'sections')


    def create(self, validated_data):
        #create user if user doesn't exist, create enrollment for users, attach enrollment to sections
        user_data = validated_data.pop('user')
        section_data = validated_data.pop('sections')
        role_data = validated_data.pop('role')

        #create user or get the existing user from db
        user_q = User.objects.filter(username=user_data['username'])
        user = None
        email_details = None
        if not user_q.exists():
            # user = create_user(user_data)
            ret_data = create_user(user_data)
            user = ret_data['user']
            email_details = ret_data['email_details']
        else:
            user = user_q.get()

        #create enrollment
        role = Role.objects.filter(name=role_data['name']).get()
        enrollment = Enrollment.objects.create(user=user, role=role)

        #add section to enrollment
        #section_str = ''
        section_list =[]
        for s in section_data:
            section = Section.objects.filter(name=s['name']).get()
            EnrollmentHasSections.objects.create(enrollment=enrollment, section=section)
            #enrollment.sections.add(section)
            #section_str += str(section.id)
            section_list.append(section.id)
        section_str ='|'.join(map(str, section_list))

        #update or create user_has_course
        course_id = self.context.get('course_id',None)
        user_has_course_data = {'user_id':user.id,'course_id':course_id,'enrollment_id':enrollment.id,
                                'enrollment_role_id':enrollment.role.id,'enrollment_section_list':section_str,
                                'enrollment_action_list':enrollment.role.action_list
                                }
        UserHasCourses.objects.create(**user_has_course_data)

        #update memcache is user is logged in (add one more entry in courses)
        if user.session_id:
            update_course_details_in_cache(user.session_id,user.id)
        # return enrollment
        return {'enrollment': enrollment, 'email_details': email_details}



class EnrollmentEditRoleSerializer(serializers.ModelSerializer):

    def validate(self, data):
        if not Role.objects.filter(id=data['id']).exists():
            raise serializers.ValidationError("Role doesn't exists")
        return data

    class Meta:
        model = Role
        fields = ('id',)
        extra_kwargs = {'id': {'read_only': False, 'required': True}}


class EnrollmentEditSectionSerializer(serializers.ModelSerializer):

    def validate(self, data):
        if not Section.objects.filter(id=data['id']).exists():
            raise serializers.ValidationError("Section doesn't exists")
        return data

    class Meta:
        model = Section
        fields = ('id',)
        extra_kwargs = {'id': {'read_only': False, 'required': True}}


class EnrollmentEditUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(validators=[])
    email = serializers.CharField(validators= [])

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'program', 'department', 'email')
        extra_kwargs = {'id': {'read_only': False, 'required': True}}


class EnrollmentEditSerializer(serializers.ModelSerializer):
    role = EnrollmentEditRoleSerializer(required=False)
    sections = EnrollmentEditSectionSerializer(many=True, required=False)
    #user has course for this enrollment_id

    class Meta:
        model = Enrollment
        fields = ('role', 'sections')

    def update(self, instance, validated_data):
        # update role
        updated_field = {}
        if 'role' in validated_data:
            role = Role.objects.filter(id=validated_data['role']['id']).get()
            instance.role = role
            updated_field['enrollment_role_id'] = role.id
            updated_field['enrollment_action_list'] = role.action_list
            instance.save()

        # update sections
        if 'sections' in validated_data:
            qs = EnrollmentHasSections.objects.filter(enrollment=instance)
            qs.delete()
            sections = validated_data['sections']
            section_str = ''
            for s in sections:
                section = Section.objects.filter(id=s['id']).get()
                e = EnrollmentHasSections(section=section, enrollment=instance)
                e.save()
                section_str += str(section.id)
                section_str +='|'
                #instance.sections.add(section)
            section_str = section_str.rstrip('|')
            updated_field['enrollment_section_list'] = section_str

        #update user has course table entry for this enrollment
        UserHasCourses.objects.filter(enrollment_id= instance.id).update(**updated_field)

        #update memcache entry if user is logged in
        if instance.user.session_id:
            #this will reevaluate the course details from the db
            update_course_details_in_cache(instance.user.session_id,instance.user.id)
        return instance



