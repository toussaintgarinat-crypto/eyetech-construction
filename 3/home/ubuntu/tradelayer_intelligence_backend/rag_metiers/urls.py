from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstanceRAGViewSet, QuestionRAGViewSet

router = DefaultRouter()
router.register('instances', InstanceRAGViewSet, basename='instance-rag')
router.register('questions', QuestionRAGViewSet, basename='question-rag')

urlpatterns = [
    path('', include(router.urls)),
]
