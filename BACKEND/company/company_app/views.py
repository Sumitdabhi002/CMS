from django.http import HttpResponse
import pandas as pd
from django.db import transaction
from django.db.models import Q, Sum, Count
from django.utils.timezone import now

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Attendance,
    Department,
    Project,
    WorkProgress,
    ProjectAllocation,
    TeamMember,
    Employee,
)
from .serializers import (
    DepartmentSerializer,
    ProjectSerializer,
    WorkProgressSerializer,
    ProjectAllocationSerializer,
    TeamMemberSerializer,
    EmployeeSerializer,
    ProfileSerializer
)
from .permissions import IsAdmin, IsEmployee


# -------------------------
# BASIC VIEWSETS
# -------------------------

class DepartmentViewSet(ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdmin]

class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdmin]

    def perform_update(self, serializer):
        project = self.get_object()

        new_total = serializer.validated_data.get(
            "total_budget",
            project.total_budget
        )

        allocated = ProjectAllocation.objects.filter(
            project=project
        ).aggregate(total=Sum("allocated_budget"))["total"] or 0

        if new_total < allocated:
            raise ValidationError(
                f"Total budget cannot be less than already allocated amount ({allocated})."
            )

        serializer.save()



class WorkProgressViewSet(ModelViewSet):
    serializer_class = WorkProgressSerializer
    permission_classes = [IsEmployee]

    def get_queryset(self):
        return WorkProgress.objects.filter(
            employee__user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user.employee)


class ProjectAllocationViewSet(ModelViewSet):
    queryset = ProjectAllocation.objects.all()
    serializer_class = ProjectAllocationSerializer
    permission_classes = [IsAdmin]

    def validate_budget(self, project, new_budget, instance=None):
        """
        Validate that allocated budget does not exceed project total budget.
        """

        qs = ProjectAllocation.objects.filter(project=project)

        # Exclude current allocation during update
        if instance:
            qs = qs.exclude(id=instance.id)

        allocated = qs.aggregate(
            total=Sum("allocated_budget")
        )["total"] or 0

        remaining = project.total_budget - allocated

        if new_budget > remaining:
            raise ValidationError(
                f"Allocation exceeds remaining budget. "
                f"Remaining budget: ₹{remaining}"
            )

    @transaction.atomic
    def perform_create(self, serializer):
        project = serializer.validated_data["project"]
        new_budget = serializer.validated_data["allocated_budget"]

        self.validate_budget(project, new_budget)

        serializer.save()

    @transaction.atomic
    def perform_update(self, serializer):
        project = serializer.validated_data["project"]
        new_budget = serializer.validated_data["allocated_budget"]

        self.validate_budget(project, new_budget, self.get_object())

        serializer.save()

class TeamMemberViewSet(ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAdmin]

    @action(detail=False, methods=["post"], url_path="assign-lead")
    def assign_team_lead(self, request):
        team_id = request.data.get("team_id")
        employee_id = request.data.get("employee_id")

        try:
            member = TeamMember.objects.get(
                team_id=team_id,
                employee_id=employee_id
            )
        except TeamMember.DoesNotExist:
            return Response(
                {"error": "Employee is not part of this team"},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            TeamMember.objects.filter(
                team_id=team_id,
                is_team_lead=True
            ).update(is_team_lead=False)

            member.is_team_lead = True
            member.save()

        return Response({"message": "Team lead assigned successfully"})


# -------------------------
# EMPLOYEE APIs
# -------------------------

class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employee = request.user.employee
        return Response({
            "id": employee.id,
            "username": request.user.username,
            "role": request.user.role,
            "department": employee.department.name if employee.department else None,
        })


class MyTeamView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employee = request.user.employee
        teams = employee.teammember_set.select_related("team")
        team_names = [membership.team.name for membership in teams]

        return Response({"team": team_names})


class MyProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employee = request.user.employee
        team_member = employee.teammember_set.select_related("team").first()

        if not team_member:
            return Response({"message": "Not assigned to any team"})

        allocation = ProjectAllocation.objects.filter(
            team=team_member.team
        ).select_related("project").first()

        if not allocation:
            return Response({"message": "No project assigned to this team"})

        project = allocation.project

        return Response({
            "project_name": project.name,
            "status": project.status,
            "allocated_budget": allocation.allocated_budget
        })


class MyWorkSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employee = request.user.employee
        total_hours = employee.workprogress_set.aggregate(
            total=Sum("hours_worked")
        )["total"] or 0

        return Response({
            "total_hours_worked": total_hours
        })


# -------------------------
# ADMIN DASHBOARD
# -------------------------

class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        total_employees = Employee.objects.count()
        total_departments = Department.objects.count()
        total_projects = Project.objects.count()

        project_status_summary = Project.objects.values(
            "status"
        ).annotate(count=Count("id"))

        total_allocated_budget = ProjectAllocation.objects.aggregate(
            total=Sum("allocated_budget")
        )["total"] or 0

        total_teams = TeamMember.objects.values("team").distinct().count()

        return Response({
            "total_employees": total_employees,
            "total_department": total_departments,
            "total_projects": total_projects,
            "project_status_summary": project_status_summary,
            "total_allocated_budget": total_allocated_budget,
            "total_teams": total_teams
        })


# -------------------------
# EMPLOYEE OVERVIEW (OPTIMIZED)
# -------------------------

class AdminEmployeeOverview(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = now().date()

        employees = Employee.objects.select_related(
            "user", "department"
        ).prefetch_related(
            "attendance_set",
            "teammember_set__team__projectallocation_set__project"
        )

        data = []

        for emp in employees:
            attendance = emp.attendance_set.filter(date=today).first()
            today_hours = attendance.total_hours() if attendance else 0

            team_member = emp.teammember_set.select_related("team").first()
            project_name = None

            if team_member:
                allocation = team_member.team.projectallocation_set.select_related("project").first()
                if allocation:
                    project_name = allocation.project.name

            data.append({
                "id": emp.id,
                "name": emp.user.username,
                "department": emp.department.name if emp.department else None,
                "project": project_name or "Not Assigned",
                "clock_in": attendance.clock_in if attendance else None,
                "clock_out": attendance.clock_out if attendance else None,
                "today_hours": round(today_hours, 2),
            })

        return Response(data)


# -------------------------
# CLOCK IN / OUT (SAFE)
# -------------------------

class ClockInView(APIView):
    permission_classes = [IsEmployee]

    def post(self, request):
        today = now().date()

        attendance, created = Attendance.objects.get_or_create(
            employee=request.user.employee,
            date=today
        )

        if attendance.clock_in:
            return Response(
                {"error": "Already clocked in"},
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance.clock_in = now()
        attendance.save()

        return Response({"message": "Clocked in"})


class ClockOutView(APIView):
    permission_classes = [IsEmployee]

    def post(self, request):
        today = now().date()

        attendance = Attendance.objects.filter(
            employee=request.user.employee,
            date=today
        ).first()

        if not attendance:
            return Response(
                {"error": "Clock in first"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if attendance.clock_out:
            return Response(
                {"error": "Already clocked out"},
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance.clock_out = now()
        attendance.save()

        return Response({"message": "Clocked out"})


# -------------------------
# EXCEL EXPORT (SAFE DISTINCT)
# -------------------------

class DepartmentPerformanceExcelView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):

        report = Department.objects.annotate(
            total_employees=Count("employee", distinct=True),

            total_projects=Count("project", distinct=True),

            total_completed_projects=Count(
                "project",
                filter=Q(project__status="COMPLETED"),
                distinct=True
            ),

            total_budget=Sum("project__total_budget"),

            total_work_hours=Sum("employee__workprogress__hours_worked")
        )

        data = []

        for dept in report:
            data.append({
                "Department Name": dept.name,
                "Total Employees": dept.total_employees,
                "Total Projects": dept.total_projects,
                "Completed Projects": dept.total_completed_projects,
                "Total Budget": dept.total_budget or 0,
                "Total Work Hours": dept.total_work_hours or 0,
            })

        df = pd.DataFrame(data)

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        response["Content-Disposition"] = (
            "attachment; filename=department_performance_report.xlsx"
        )

        with pd.ExcelWriter(response, engine="openpyxl") as writer:
            df.to_excel(
                writer,
                index=False,
                sheet_name="Department Performance"
            )

        return response

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employee = request.user.employee
        serializer = ProfileSerializer(employee)
        return Response(serializer.data)

    def put(self, request):
        employee = request.user.employee
        serializer = ProfileSerializer(
            employee,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
    
class TodayAttendanceView(APIView):
    permission_classes = [IsEmployee]

    def get(self, request):

        today = now().date()

        attendance = Attendance.objects.filter(
            employee=request.user.employee,
            date=today
        ).first()

        if not attendance:
            return Response({"clock_in": None})

        return Response({
            "clock_in": attendance.clock_in,
            "clock_out": attendance.clock_out
        })