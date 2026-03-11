from rest_framework import serializers
from .models import *
from .models import Employee

class UserSerializer(serializers.ModelSerializer):
  
  class Meta:
    model = User
    fields = ['id', 'username', 'role', 'email']
  
class DepartmentSerializer(serializers.ModelSerializer):
  
  class Meta:
    model = Department
    fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
  user = UserSerializer(read_only=True)

  class Meta:
    model = Employee
    fields = ["id", "user", "department", "role"]

class TeamSerializer(serializers.ModelSerializer):
  
  class Meta:
    model = Team
    fields = '__all__'

class TeamMemberSerializer(serializers.ModelSerializer):
  
  class Meta:
    model = TeamMember
    fields = '__all__'

  def validate(self, data):
    team = data.get('team')
    is_team_lead = data.get('is_team_lead')

    if is_team_lead:
      qs = TeamMember.objects.filter(
        team = team,
        is_team_lead=True
      )
      if self.instance:
        qs = qs.exclude(id=self.instance.id)
      if qs.exists():
        raise serializers.ValidationError('This team already has a team lead')
    return data

class ProjectSerializer(serializers.ModelSerializer):
  
  class Meta:
    model = Project
    fields = '__all__'

class ProjectAllocationSerializer(serializers.ModelSerializer):
  
  class Meta:
    model = ProjectAllocation
    fields = '__all__'

class WorkProgressSerializer(serializers.ModelSerializer):
  
  class Meta:
    model = WorkProgress
    fields = '__all__'


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email")
    role = serializers.CharField(source="user.role", read_only=True)
    department = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Employee
        fields = ["id", "username", "email", "role", "department"]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        if "email" in user_data:
            instance.user.email = user_data["email"]
            instance.user.save()

        return instance
