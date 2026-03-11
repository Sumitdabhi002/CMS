from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
# Create your models here.

#User model
class User(AbstractUser):
  ROLE_CHOISES = (
    ('ADMIN', 'Admin'),
    ('EMPLOYEE', 'Employee'),
  )

  role = models.CharField(choices=ROLE_CHOISES, max_length=20)

#Department Model
class Department(models.Model):
  name = models.CharField(max_length=100, unique=True)
  description = models.TextField(blank=True)

  def __str__(self):
    return self.name

#Employee Profile
class Employee(models.Model):
  user = models.OneToOneField(User, on_delete=models.CASCADE)
  department = models.ForeignKey(Department, on_delete=models.SET_NULL, blank=True, null=True)
  designation = models.CharField(max_length=100)
  phone  = models.CharField(max_length=15)
  address = models.TextField()
  date_joined = models.DateField()

  def __str__(self):
    return self.user.username

#Team
class Team(models.Model):
  name = models.CharField(max_length=20)
  department = models.ForeignKey(Department, on_delete=models.CASCADE)

  def __str__(self):
    return self.name

#Team members (with Team Lead)
class TeamMember(models.Model):
  team = models.ForeignKey(Team, on_delete=models.CASCADE)
  employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
  is_team_lead = models.BooleanField(default=False)

  class Meta:
    unique_together = ('team', 'employee')

  def __str__(self):
    return f"{self.employee} - {self.team}"

#Project
class Project(models.Model):
  STATUS_CHOICES = (
    ('PENDING', 'Pending'),
    ('IN_PROGRESS', 'In Progrss'),
    ('COMPLETED', 'Completed'),
  )

  name = models.CharField(max_length=200)
  description = models.TextField()
  department = models.ForeignKey(Department, on_delete=models.CASCADE)
  start_date = models.DateField()
  end_date = models.DateField(blank=True, null=True)
  status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
  total_budget = models.DecimalField(max_digits=12, decimal_places=2)

  def __str__(self):
    return self.name
  
#Project Allocation 
class ProjectAllocation(models.Model):
  project = models.ForeignKey(Project, on_delete=models.CASCADE)
  team = models.ForeignKey(Team, on_delete=models.CASCADE)
  allocated_budget = models.DecimalField(max_digits=12, decimal_places=2)
  allocated_at = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return f"{self.project} - {self.team}"
  
#Work progress
class WorkProgress(models.Model):
  project = models.ForeignKey(Project, on_delete=models.CASCADE)
  employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
  date = models.DateField()
  work_description = models.TextField()
  hours_worked = models.DecimalField(max_digits=5, decimal_places=2)

  def __str__(self):
    return f"{self.employee} - {self.project}"

class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
      return f"{self.employee.user.username} - {self.date}"

    def total_hours(self):
      if self.clock_in and self.clock_out:
        return (self.clock_out - self.clock_in).total_seconds() / 3600
      return 0
    
# User = settings.AUTH_USER_MODEL
class ChatRoom(models.Model):
  name = models.CharField(max_length=255,blank=True)
  is_group = models.BooleanField(default=False)
  created_at= models.DateTimeField(auto_now_add=True)

class ChatRoomMember(models.Model):
  room = models.ForeignKey(ChatRoom,on_delete=models.CASCADE)
  user = models.ForeignKey(User,on_delete=models.CASCADE)

class ChatMessage(models.Model):
  room = models.ForeignKey(ChatRoom,on_delete=models.CASCADE)
  sender = models.ForeignKey(User,on_delete=models.CASCADE)
  message = models.TextField()
  created_at = models.DateTimeField(auto_now_add=True)