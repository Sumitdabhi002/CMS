from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ClockInView, ClockOutView, DepartmentViewSet, ProjectViewSet, ProjectAllocationViewSet, TeamMemberViewSet, MyProfileView, MyProjectView, MyTeamView, MyWorkSummaryView, AdminDashboardView, DepartmentPerformanceExcelView,AdminEmployeeOverview,ProfileView, TodayAttendanceView

router = DefaultRouter()
router.register('departments', DepartmentViewSet)
router.register('projects', ProjectViewSet)
router.register('project-allocations', ProjectAllocationViewSet)
router.register('team-member', TeamMemberViewSet)

urlpatterns = router.urls + [
  path('my-profile/', MyProfileView.as_view()),
  path('my-team/', MyTeamView.as_view()),
  path('my-project/', MyProjectView.as_view()),
  path('my-work-summary/', MyWorkSummaryView.as_view()),
  path('admin-dashboard/', AdminDashboardView.as_view()),
  path('department-performance-excel/', DepartmentPerformanceExcelView.as_view()),
  path("admin/employees-overview/", AdminEmployeeOverview.as_view()),
  path("profile/", ProfileView.as_view()),
  path("clock-in/", ClockInView.as_view(), name="clock-in"),
  path("clock-out/", ClockOutView.as_view(), name="clock-out"),
  path("today-attendance/", TodayAttendanceView.as_view()),
]

