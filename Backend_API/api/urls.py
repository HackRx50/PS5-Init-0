from django.urls import path, include
from .views import *

urlpatterns = [
    path('claim', create_claim, name='create-claim'),
    path('claim/update/<int:claim_id>', update_claim_prediction, name='update_claim_prediction'),
    path('find_criminal_history', find_criminal_history, name='find_criminal_history'),
    path('api/process-pdf', process_pdf, name='process_pdf'),
    path('test', test, name='test'),
]
