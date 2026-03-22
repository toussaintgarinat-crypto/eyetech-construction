from rest_framework import viewsets, permissions, serializers
from .models import User, Project, DrillingPoint, ARMeasurement, Photo, PrintPlan
from .serializers import UserSerializer, ProjectSerializer, DrillingPointSerializer, ARMeasurementSerializer, PhotoSerializer, PrintPlanSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.projects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DrillingPointViewSet(viewsets.ModelViewSet):
    queryset = DrillingPoint.objects.all()
    serializer_class = DrillingPointSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DrillingPoint.objects.filter(project__user=self.request.user)

    def perform_create(self, serializer):
        project_id = self.request.data.get('project')
        if not project_id:
            raise serializers.ValidationError({'project': 'This field is required.'})
        try:
            project = Project.objects.get(id=project_id, user=self.request.user)
        except Project.DoesNotExist:
            raise serializers.ValidationError({'project': 'Project not found or does not belong to the current user.'})
        serializer.save(project=project)

class ARMeasurementViewSet(viewsets.ModelViewSet):
    queryset = ARMeasurement.objects.all()
    serializer_class = ARMeasurementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ARMeasurement.objects.filter(project__user=self.request.user)

    def perform_create(self, serializer):
        project_id = self.request.data.get('project')
        if not project_id:
            raise serializers.ValidationError({'project': 'This field is required.'})
        try:
            project = Project.objects.get(id=project_id, user=self.request.user)
        except Project.DoesNotExist:
            raise serializers.ValidationError({'project': 'Project not found or does not belong to the current user.'})
        serializer.save(project=project)

class PhotoViewSet(viewsets.ModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Photo.objects.filter(project__user=self.request.user)

    def perform_create(self, serializer):
        project_id = self.request.data.get('project')
        if not project_id:
            raise serializers.ValidationError({'project': 'This field is required.'})
        try:
            project = Project.objects.get(id=project_id, user=self.request.user)
        except Project.DoesNotExist:
            raise serializers.ValidationError({'project': 'Project not found or does not belong to the current user.'})
        serializer.save(project=project)

class PrintPlanViewSet(viewsets.ModelViewSet):
    queryset = PrintPlan.objects.all()
    serializer_class = PrintPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PrintPlan.objects.filter(project__user=self.request.user)

    def perform_create(self, serializer):
        project_id = self.request.data.get('project')
        if not project_id:
            raise serializers.ValidationError({'project': 'This field is required.'})
        try:
            project = Project.objects.get(id=project_id, user=self.request.user)
        except Project.DoesNotExist:
            raise serializers.ValidationError({'project': 'Project not found or does not belong to the current user.'})
        serializer.save(project=project)

