from django.contrib import admin
from .models import User, Department, Employee, Team, TeamMember, WorkProgress, Project, ProjectAllocation,Attendance
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
# Register your models here.

User = get_user_model()

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Custom Fields", {"fields": ("role",)}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Custom Fields", {"fields": ("role",)}),
    )
admin.site.register(User, CustomUserAdmin)
admin.site.register(Department)
admin.site.register(Employee)
admin.site.register(Team)
admin.site.register(TeamMember)
admin.site.register(WorkProgress)
admin.site.register(Project)
admin.site.register(ProjectAllocation)
admin.site.register(Attendance)