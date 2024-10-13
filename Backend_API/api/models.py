from django.db import models

class Claim(models.Model):
    full_name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=15)
    email_address = models.EmailField()
    incident_date = models.DateField()
    claim_type = models.CharField(max_length=100)
    claim_amount = models.DecimalField(max_digits=10, decimal_places=2)
    incident_description = models.TextField()
    policy_number = models.CharField(max_length=50)
    issuer_name = models.CharField(max_length=255)
    payment_method = models.CharField(max_length=50)
    bank_acc_number = models.CharField(max_length=20)
    supporting_document_url = models.URLField()
    incident_photo_url = models.URLField()
    prediction = models.CharField(max_length=255, blank=True, null=True)
    reasoning = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    probability = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.full_name} - {self.policy_number}"



class CaseDetails(models.Model):
    case_number = models.TextField(null=True, blank=True)
    case_year = models.TextField(null=True, blank=True)
    petitioner = models.TextField(null=True, blank=True)
    respondent = models.TextField(null=True, blank=True)
    unique_case_number = models.TextField(null=True, blank=True)
    cnr = models.TextField(null=True, blank=True)
    state = models.TextField(null=True, blank=True)
    district = models.TextField(null=True, blank=True)
    court_complex = models.TextField(null=True, blank=True)
    case_type = models.TextField(null=True, blank=True)
    filing_date = models.TextField(null=True, blank=True)
    regi_number = models.TextField(null=True, blank=True)
    first_hearing_date = models.TextField(null=True, blank=True)
    decision_date = models.TextField(null=True, blank=True)
    hearing_count = models.TextField(null=True, blank=True)
    nature_of_disposal = models.TextField(null=True, blank=True)
    court_number_and_judge = models.TextField(null=True, blank=True)
    petitioner_advocate = models.TextField(null=True, blank=True)
    respondent_advocate = models.TextField(null=True, blank=True)
    under_act = models.TextField(null=True, blank=True)
    under_section = models.TextField(null=True, blank=True)
    incident_details = models.TextField(null=True, blank=True)
    claim_amount = models.TextField(null=True, blank=True)
    settlement_amount = models.TextField(null=True, blank=True)
    interest_rate = models.TextField(null=True, blank=True)
    payment_mode = models.TextField(null=True, blank=True)
    judge_name = models.TextField(null=True, blank=True)
    summary_of_pdf = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Case: {self.case_number} - {self.case_year}"