import boto3
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from .models import Claim, CaseDetails
import json
import re
from django.core.mail import send_mail
from .helper import *
from collections import defaultdict


@csrf_exempt
def create_claim(request):
    if request.method == 'POST':
        try:
            # Extract fields from POST request
            full_name = request.POST.get('full_name')
            contact_number = request.POST.get('contact_number')
            email_address = request.POST.get('email_address')
            incident_date = request.POST.get('incident_date')
            claim_type = request.POST.get('claim_type')
            claim_amount = request.POST.get('claim_amount')
            incident_description = request.POST.get('incident_description')
            policy_number = request.POST.get('policy_number')
            issuer_name = request.POST.get('issuer_name')
            payment_method = request.POST.get('payment_method')
            bank_acc_number = request.POST.get('bank_acc_number')

            # Get the uploaded files
            supporting_document = request.FILES.get('supporting_document')
            incident_photo = request.FILES.get('incident_photo')

            # Initialize S3 client
            s3 = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            bucket_name = settings.AWS_STORAGE_BUCKET_NAME

            # Upload files to S3
            supporting_document_url = None
            incident_photo_url = None
            
            if supporting_document:
                supporting_file_key = f'supporting_documents/{supporting_document.name}'
                s3.upload_fileobj(supporting_document, bucket_name, supporting_file_key)
                supporting_document_url = f'https://{bucket_name}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{supporting_file_key}'

            if incident_photo:
                incident_photo_key = f'incident_photos/{incident_photo.name}'
                s3.upload_fileobj(incident_photo, bucket_name, incident_photo_key)
                incident_photo_url = f'https://{bucket_name}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{incident_photo_key}'

            # Create the claim entry
            claim = Claim.objects.create(
                full_name=full_name,
                contact_number=contact_number,
                email_address=email_address,
                incident_date=incident_date,
                claim_type=claim_type,
                claim_amount=claim_amount,
                incident_description=incident_description,
                policy_number=policy_number,
                issuer_name=issuer_name,
                payment_method=payment_method,
                bank_acc_number=bank_acc_number,
                supporting_document_url=supporting_document_url,
                incident_photo_url=incident_photo_url,
            )
            
            # Prepare data for Bedrock API call
            claim_info = {
                "full_name": full_name,
                "contact_number": contact_number,
                "email_address": email_address,
                "incident_date": incident_date,
                "claim_type": claim_type,
                "claim_amount": "rupees" + claim_amount,
                "incident_description": incident_description,
                "policy_number": policy_number,
                "issuer_name": issuer_name,
                "payment_method": payment_method,
                "bank_acc_number": bank_acc_number,
                "supporting_document_url": supporting_document_url,
                "incident_photo_url": incident_photo_url,
            }

            # Create the prompt
            prompt_content = (
                "You are an expert in Indian insurance fraud detection. Analyze the following claim information and determine whether it is fraudulent or legitimate.\n"
                f"Claim Information:\n{json.dumps(claim_info)}\n\n"
                "Please provide a thorough analysis, including specific indicators or patterns that influenced your decision. Additionally, assign a probability score reflecting your confidence in the prediction.\n\n"
                "Response Format:\n"
                "Prediction: (fraud or legitimate)\n"
                "Reasoning: (detailed explanation of the rationale behind your prediction)\n"
                "Probability Score: (a numerical value between 0 and 1, with 1 being absolute certainty of fraud)"
            )


            # Initialize Bedrock client
            bedrock_client = boto3.client(
                'bedrock-runtime',
                region_name="ap-south-1", aws_access_key_id='AKIA4MTWOD7MS5ENRZHE', aws_secret_access_key='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'
            )

            # Prepare the request to invoke the model
            model_id = "meta.llama3-8b-instruct-v1:0"
            native_request = {
                "prompt": prompt_content,
                "max_gen_len": 512,
                "temperature": 0.5,
            }
            request_body = json.dumps(native_request)

            # Call the Bedrock model
            try:
                response = bedrock_client.invoke_model(modelId=model_id, body=request_body)
                model_response = json.loads(response['body'].read())
                response_data = model_response.get("generation", "")
                
                # print("Raw response data:", response_data)  # Debugging line

                # Use regular expressions to find the relevant sections
                prediction_match = re.search(r'Prediction:\s*(.*)', response_data)
                reasoning_match = re.search(r'Reasoning:\s*(.*?)(?=Probability Score:)', response_data, re.DOTALL)
                probability_score_match = re.search(r'Probability Score:\s*(.*)', response_data)

                # Extract values if matches are found
                prediction = prediction_match.group(1).strip() if prediction_match else "Cannot be determined"
                reasoning = reasoning_match.group(1).strip() if reasoning_match else "Cannot be determined"
                probability_score = probability_score_match.group(1).strip() if probability_score_match else "Cannot be determined"

                print(f"Prediction: {prediction}")
                print(f"Reasoning: {reasoning}")
                print(f"Probability Score: {probability_score}")

                if prediction.lower() == "fraud" or "fr" in prediction.lower():
                    subject = 'Alert: Potential Fraud Detected in Claim Submission'
                    message = (
                        f'Hello,\n\n'
                        f'We have detected potential fraud in a claim submission.\n'
                        'Please find the details below:\n\n'
                        f'Claim ID: {claim.id}\n'
                        f'Full Name: {full_name}\n'
                        f'Contact Number: {contact_number}\n'
                        f'Email Address: {email_address}\n'
                        f'Incident Date: {incident_date}\n'
                        f'Claim Type: {claim_type}\n'
                        f'Claim Amount: {claim_amount}\n'
                        f'Incident Description: {incident_description}\n'
                        f'Policy Number: {policy_number}\n'
                        f'Issuer Name: {issuer_name}\n'
                        f'Payment Method: {payment_method}\n'
                        f'Bank Account Number: {bank_acc_number}\n\n'
                        '\n'
                        f'Prediction: {prediction}\n'
                        f'Probability Score: {probability_score}\n\n'
                        '\n\n'
                        f'Please review the claim details and take appropriate action.\n\n'
                        f'Thank you,\n'
                        f'Your Insurance Fraud Detection Team'
                    )
                    email_from = settings.EMAIL_HOST_USER
                    recipient_list = ["vaibhav.vanage@gmail.com"]
                    print("Sending email alert...")
                    try:
                        send_mail(subject, message, email_from, recipient_list)
                        print("Email alert sent successfully")
                    except Exception as e:
                        print(f"ERROR sending email alert: {e}")
                    
                    print("Fraud detected")
                else:
                    subject = 'Alert: Potential Fraud Detected in Claim Submission'
                    message = (
                        f'Hello,\n\n'
                        f'We have detected new claim submission.\n'
                        'Please find the details on your dashboard\n\n'
                    )
                    email_from = settings.EMAIL_HOST_USER
                    recipient_list = ["vaibhav.vanage@gmail.com"]
                    print("Sending email alert...")
                    try:
                        send_mail(subject, message, email_from, recipient_list)
                        print("Email alert sent successfully")
                    except Exception as e:
                        print(f"ERROR sending email alert: {e}")

                claim.prediction = prediction
                claim.reasoning = reasoning
                claim.probability = probability_score
                claim.save()


            except Exception as e:
                print(f"ERROR invoking Bedrock model: {e}")
                return JsonResponse({"error": "Failed to analyze claim"}, status=500)

            return JsonResponse({"message": "Claim created successfully", "claim_id": claim.id}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    elif request.method == 'GET':
        try:
            # Fetch all claims from the database
            claims = Claim.objects.all()
            claims_data = [
                {
                    'id': claim.id,
                    'full_name': claim.full_name,
                    'contact_number': claim.contact_number,
                    'email_address': claim.email_address,
                    'incident_date': claim.incident_date,
                    'claim_type': claim.claim_type,
                    'claim_amount': claim.claim_amount,
                    'incident_description': claim.incident_description,
                    'policy_number': claim.policy_number,
                    'issuer_name': claim.issuer_name,
                    'payment_method': claim.payment_method,
                    'bank_acc_number': claim.bank_acc_number,
                    'supporting_document_url': claim.supporting_document_url,
                    'incident_photo_url': claim.incident_photo_url,
                    'prediction': claim.prediction,
                    'reasoning': claim.reasoning,
                    'probability': claim.probability,
                    'created_at': claim.created_at,
                } for claim in claims
            ]
            return JsonResponse({"claims": claims_data}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Only POST and GET methods are allowed"}, status=405)



@csrf_exempt
def update_claim_prediction(request, claim_id):
    if request.method == 'PATCH':
        try:
            # Fetch the claim by ID
            claim = Claim.objects.get(id=claim_id)

            # Update the prediction
            claim.prediction = "legitimate"
            claim.reasoning = "Prediction updated to legitimate by an admin."
            claim.probability = "1.0"  # Assuming maximum confidence for legitimate claims
            claim.save()

            return JsonResponse({"message": "Claim prediction updated successfully"}, status=200)

        except Claim.DoesNotExist:
            return JsonResponse({"error": "Claim not found"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Only PATCH method is allowed"}, status=405)

# def upload_to_s3(file, folder_name="claims-files"):
#     """
#     Uploads the file to S3 and returns the URL of the uploaded file.
#     The files are uploaded into a specified folder inside the S3 bucket.
    
#     :param file: The file object to be uploaded.
#     :param folder_name: The folder name inside the S3 bucket where the file will be stored.
#     :return: The URL of the uploaded file.
#     """
#     # Construct the full file path, including the folder inside the S3 bucket
#     file_path = f"{folder_name}/{file.name}"
    
#     # Use default storage to save the file in S3
#     file_name = default_storage.save(file_path, file)
    
#     # Generate and return the file URL
#     file_url = default_storage.url(file_name)
    
#     return file_url


# @csrf_exempt
# def find_criminal_history(request):
#     if request.method == 'POST':
#         try:
#             # Parse the JSON request body
#             data = json.loads(request.body)
            
#             full_name = data.get('full_name')
#             year = data.get('year')
#             case_status = "Both"
#             state = data.get('state')
#             district = data.get('district')
#             court_complex = data.get('court_complex')

#             # Check if values are correctly retrieved
#             if None in [full_name, year, state, district, court_complex]:
#                 return JsonResponse({'error': 'Missing required fields'}, status=400)

#             # Proceed with further logic here
#             get_session_tokens()
#             get_captcha()
#             print(full_name, year, case_status, state, district, court_complex)
#             print("calling submit_party_name")
#             response = submit_party_name(full_name, year, case_status, state, district, court_complex)
#             print("submit_party_name response")
#             print(response)
            

#             # 1. Extract total number of cases
#             party_data = response['party_data']
#             total_cases_match = re.search(r'Total number of cases\s*:\s*(\d+)', party_data)
#             total_cases = int(total_cases_match.group(1)) if total_cases_match else 0

#             # 2. Parse the HTML and find the case details
#             soup = BeautifulSoup(party_data, 'html.parser')

#             # Extract all table rows
#             rows = soup.select('table tbody tr')

#             # Dictionary to hold the case types and their frequencies
#             case_type_frequency = defaultdict(int)

#             # 3. Iterate through each row to find the cases where full_name is the Petitioner
#             for row in rows:
#                 columns = row.find_all('td')
#                 if len(columns) > 2:
#                     # Case number details in the second column (e.g., "S.C.C./341/2024")
#                     case_type_info = columns[1].get_text(strip=True)
#                     # print("case_type_info", case_type_info)
                    
#                     # Extract only the case type (e.g., "S.C.C.")
#                     case_type = case_type_info.split('/')[0]
#                     print("case_type", case_type)
                    
#                     # Petitioner vs Respondent in the third column
#                     petitioner_vs_respondent = columns[2].get_text(strip=True)
                    
#                     # Check if full_name appears before 'Vs' in the petitioner_vs_respondent string
#                     if re.search(rf'^{full_name}.*Vs', petitioner_vs_respondent, re.IGNORECASE):
#                         # Increment the case type frequency
#                         case_type_frequency[case_type] += 1

#             # 4. Prepare the final JSON structure
#             output = {
#                 "total_number_of_cases": total_cases,
#                 "case_type": dict(case_type_frequency)
#             }
#             print("********************************")
#             print(output)
#             print("********************************")



#             return JsonResponse(response, status=200)
#         #     return JsonResponse({'message': 'Data received successfully'}, status=200)

#         except json.JSONDecodeError:
#             return JsonResponse({'error': 'Invalid JSON data'}, status=400)


@csrf_exempt
def find_criminal_history(request):
    if request.method == 'POST':
        try:
            # Parse the JSON request body
            data = json.loads(request.body)
            
            full_name = data.get('full_name')
            year = data.get('year')
            case_status = "Both"
            state = data.get('state')
            district = data.get('district')
            court_complex = data.get('court_complex')

            # Check if values are correctly retrieved
            if None in [full_name, year, state, district, court_complex]:
                return JsonResponse({'error': 'Missing required fields'}, status=400)

            # Function to retry request flow if needed
            def retry_request_flow():
                get_session_tokens()
                get_captcha()
                print(full_name, year, case_status, state, district, court_complex)
                print("calling submit_party_name")
                response = submit_party_name(full_name, year, case_status, state, district, court_complex)
                return response

            # Initial request flow
            response = retry_request_flow()

            # Check if there's an error message in the response
            if 'errormsg' in response:
                print("Error message found in response, retrying...")
                response = retry_request_flow()

            # At this point, response may be an HTML string. Parse it properly
            if isinstance(response, str):
                # Parse the HTML string using BeautifulSoup
                soup = BeautifulSoup(response, 'html.parser')
                
                # Look for the relevant div with case details
                party_data_div = soup.find('div', id='party_data')
                if not party_data_div:
                    return JsonResponse({'error': 'Failed to retrieve party data'}, status=400)
                
                party_data = str(party_data_div)

            else:
                # If response is not a string, check for 'party_data' in JSON-like response
                party_data = response.get('party_data')
                if not party_data:
                    return JsonResponse({'error': 'No party data found in response'}, status=400)

            # Extract total number of cases
            total_cases_match = re.search(r'Total number of cases\s*:\s*(\d+)', party_data)
            total_cases = int(total_cases_match.group(1)) if total_cases_match else 0

            # Parse the HTML and find the case details
            soup = BeautifulSoup(party_data, 'html.parser')

            # Extract all table rows
            rows = soup.select('table tbody tr')

            # Dictionary to hold the case types and their frequencies
            case_type_frequency = defaultdict(int)

            # Iterate through each row to find the cases where full_name is the Petitioner
            for row in rows:
                columns = row.find_all('td')
                if len(columns) > 2:
                    # Case number details in the second column (e.g., "S.C.C./341/2024")
                    case_type_info = columns[1].get_text(strip=True)
                    
                    # Extract only the case type (e.g., "S.C.C.")
                    case_type = case_type_info.split('/')[0]
                    # print("case_type", case_type)
                    # Petitioner vs Respondent in the third column
                    petitioner_vs_respondent = columns[2].get_text(strip=True)
                    print("petitioner_vs_respondent", petitioner_vs_respondent)
                    
                    # Split by 'Vs' to separate petitioner and respondent sides
                    if "Vs" in petitioner_vs_respondent:
                        petitioner, respondent = petitioner_vs_respondent.split('Vs', 1)

                        # Check if full_name exists in the petitioner part (case-insensitive)
                        if re.search(rf'\b{full_name}\b', petitioner, re.IGNORECASE):
                            # Increment the case type frequency
                            case_type_frequency[case_type] += 1
                            print("case_type_frequency", case_type_frequency)

            # Prepare the final JSON structure
            output = {
                "total_number_of_cases": total_cases,
                "case_type": dict(case_type_frequency)
            }
            print("********************************")
            print(output)
            print("********************************")

            return JsonResponse(output, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Only POST method is allowed'}, status=405)


import os
import json
import re
import requests
import pytesseract
from pdf2image import convert_from_path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.conf import settings
from django.core.files.base import ContentFile
import fitz

# Function to extract text from PDF using OCR
def extract_text_from_pdf_using_ocr(pdf_path):
    # Open the PDF
    pdf_document = fitz.open(pdf_path)
    full_text = ""

    # Loop through each page in the PDF
    for page_num in range(len(pdf_document)):
        # Load each page
        page = pdf_document.load_page(page_num)
        
        # Convert the page to a high-resolution image
        pix = page.get_pixmap(dpi=300)  # You can adjust the dpi value if necessary
        
        # Convert pixmap to an image (PIL Image)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        
        # Use Tesseract OCR to extract text from the image
        text = pytesseract.image_to_string(img)
        
        # Append extracted text to the full_text
        full_text += text + "\n"

    pdf_document.close()
    return full_text

# Function to call the bedrock model using the requests library
def call_bedrock_model(extracted_text, api_key, pdf_name):
    # Initialize Bedrock client using boto3
    bedrock_client = boto3.client(
        "bedrock",
        region_name="us-east-1",  # or your region
        aws_access_key_id="YOUR_AWS_ACCESS_KEY_ID",  # replace with your AWS access key
        aws_secret_access_key="YOUR_AWS_SECRET_ACCESS_KEY",  # replace with your AWS secret access key
    )

    # Extract the CNR number from the PDF file name
    cnr_number = os.path.splitext(pdf_name)[0]

    # Prepare the prompt for the Bedrock model
    prompt = f"""
    I have extracted the following text from a legal document:

    {extracted_text}

    Please analyze the text and provide the following information in JSON format:
    1. Petitioner name
    2. Petitioner Advocate
    3. State (Dropdown selection)
    4. District (Dropdown selection)
    5. Court Complex (Dropdown selection)
    6. Claim Amount extract
    7. Age of Petitioner (if mentioned, else NA)
    8. Occupation of Petitioner (if mentioned, else NA)
    9. Dependents of Petitioner (if mentioned, else NA)
    10. Summarize the entire document into 2-3 lines.
    11. Analyze and detect whether this case is a potential fraud or not.
    12. Provide a point-wise *reasoning* for your fraud analysis.
    13. Add a fraud flag indicating if it is a fraudulent case (True/False).
    """

    # Payload for Bedrock LLaMA 3B
    payload = {
        "input": prompt,
        "modelId": "llama-3b",  # Specify the Bedrock model ID
        "maxTokens": 512,
        "temperature": 0,
        "topP": 1,
    }

    # Call the Bedrock model using boto3
    try:
        response = bedrock_client.invoke_model(
            modelId="llama-3b",  # LLaMA model identifier
            body=json.dumps(payload),
            contentType="application/json",
        )
        
        # Parse the response from Bedrock
        response_body = json.loads(response['body'].read())
        return response_body

    except Exception as e:
        raise Exception(f"Error invoking the Bedrock model: {e}")

# API view to handle PDF upload and processing
@csrf_exempt
def process_pdf(request):
    if request.method == 'POST' and request.FILES.get('pdf'):
        pdf_file = request.FILES['pdf']
        api_key = 'pa4NKguX3s6FmHy6EINUN'  # Replace with your actual secret key
        
        # Save the uploaded PDF to a temporary location
        file_name = default_storage.save(pdf_file.name, ContentFile(pdf_file.read()))
        file_path = os.path.join(settings.MEDIA_ROOT, file_name)
        
        try:
            # Extract text from the PDF using OCR
            extracted_text = extract_text_from_pdf_using_ocr(file_path)
            print("Extracted text from PDF:", extracted_text)

            # Call the bedrock model and get the response
            bedrock_response = call_bedrock_model(extracted_text, api_key, pdf_file.name)

            if 'choices' in bedrock_response and len(bedrock_response['choices']) > 0:
                generated_text = bedrock_response['choices'][0]['message']['content']
                print("Generated text from bedrock model:", generated_text)

            else:
                return JsonResponse({"error": "No valid response from the bedrock model."}, status=500)

            # Clean and parse the JSON response
            cleaned_text = re.search(r"\{.*\}", generated_text, re.DOTALL)

            if cleaned_text:
                try:
                    parsed_data = json.loads(cleaned_text.group())
                    print("Parsed data:", parsed_data)

                    # Find Petitioner name in CaseDetails DB
                    petitioner_name = parsed_data.get("Petitioner name")
                    case_details = CaseDetails.objects.filter(petitioner__icontains=petitioner_name)

                    # Find Advocate name in CaseDetails DB
                    advocate_name = parsed_data.get("Petitioner Advocate")
                    advocate_case_details = CaseDetails.objects.filter(petitioner_advocate__icontains=advocate_name)

                    # Find Petitioner name and Advocate name in CaseDetails DB
                    # petitioner_name = parsed_data.get("Petitioner name")
                    # advocate_name = parsed_data.get("Petitioner Advocate")

                    # Find cases where both Petitioner and Advocate are common
                    common_case_details = CaseDetails.objects.filter(
                        petitioner__icontains=petitioner_name,
                        petitioner_advocate__icontains=advocate_name
                    )

                    # Structure the response
                    response_data = {
                        "parsed_data": {
                            "Petitioner name": parsed_data.get("Petitioner name"),
                            "Petitioner Advocate": parsed_data.get("Petitioner Advocate"),
                            "State": parsed_data.get("State"),
                            "District": parsed_data.get("District"),
                            "Court Complex": parsed_data.get("Court Complex"),
                            "Claim Amount extract": parsed_data.get("Claim Amount extract"),
                            "Age of Petitioner": parsed_data.get("Age of Petitioner"),
                            "Occupation of Petitioner": parsed_data.get("Occupation of Petitioner"),
                            "Dependents of Petitioner": parsed_data.get("Dependents of Petitioner"),
                            "Summary": parsed_data.get("Summary"),
                        },
                        "classification_data": {
                            "Fraud Analysis": parsed_data.get("Fraud Analysis"),
                            "Reasoning": parsed_data.get("Reasoning"),
                            "Fraud Flag": parsed_data.get("Fraud Flag"),
                        }
                    }

                    # Append case details if any are found
                    if case_details.exists():
                        response_data["petitioner_case_details"] = [
                            {
                                "case_number": case.case_number,
                                "case_year": case.case_year,
                                "petitioner": case.petitioner,
                                "respondent": case.respondent,
                                "unique_case_number": case.unique_case_number,
                                "cnr": case.cnr,
                                "state": case.state,
                                "district": case.district,
                                "court_complex": case.court_complex,
                                "case_type": case.case_type,
                                "filing_date": case.filing_date,
                                "regi_number": case.regi_number,
                                "first_hearing_date": case.first_hearing_date,
                                "decision_date": case.decision_date,
                                "hearing_count": case.hearing_count,
                                "nature_of_disposal": case.nature_of_disposal,
                                "court_number_and_judge": case.court_number_and_judge,
                                "petitioner_advocate": case.petitioner_advocate,
                                "respondent_advocate": case.respondent_advocate,
                                "under_act": case.under_act,
                                "under_section": case.under_section,
                                "incident_details": case.incident_details,
                                "claim_amount": case.claim_amount,
                                "settlement_amount": case.settlement_amount,
                                "interest_rate": case.interest_rate,
                                "payment_mode": case.payment_mode,
                                "judge_name": case.judge_name,
                                "summary": case.summary_of_pdf,
                            }
                            for case in case_details
                        ]
                    else:
                        response_data["petitioner_case_details"] = []  # Return an empty list if no cases found


                    # Add case details for Advocate
                    if advocate_case_details.exists():
                        response_data["advocate_case_details"] = [
                            {
                                "case_number": case.case_number,
                                "case_year": case.case_year,
                                "petitioner": case.petitioner,
                                "respondent": case.respondent,
                                "unique_case_number": case.unique_case_number,
                                "cnr": case.cnr,
                                "state": case.state,
                                "district": case.district,
                                "court_complex": case.court_complex,
                                "case_type": case.case_type,
                                "filing_date": case.filing_date,
                                "regi_number": case.regi_number,
                                "first_hearing_date": case.first_hearing_date,
                                "decision_date": case.decision_date,
                                "hearing_count": case.hearing_count,
                                "nature_of_disposal": case.nature_of_disposal,
                                "court_number_and_judge": case.court_number_and_judge,
                                "petitioner_advocate": case.petitioner_advocate,
                                "respondent_advocate": case.respondent_advocate,
                                "under_act": case.under_act,
                                "under_section": case.under_section,
                                "incident_details": case.incident_details,
                                "claim_amount": case.claim_amount,
                                "settlement_amount": case.settlement_amount,
                                "interest_rate": case.interest_rate,
                                "payment_mode": case.payment_mode,
                                "judge_name": case.judge_name,
                                "summary": case.summary_of_pdf,
                            }
                            for case in advocate_case_details
                        ]
                    else:
                        response_data["advocate_case_details"] = []


                    # Add common case details
                    if common_case_details.exists():
                        response_data["common_case_details"] = [
                            {
                                "case_number": case.case_number,
                                "case_year": case.case_year,
                                "petitioner": case.petitioner,
                                "respondent": case.respondent,
                                "unique_case_number": case.unique_case_number,
                                "cnr": case.cnr,
                                "state": case.state,
                                "district": case.district,
                                "court_complex": case.court_complex,
                                "case_type": case.case_type,
                                "filing_date": case.filing_date,
                                "regi_number": case.regi_number,
                                "first_hearing_date": case.first_hearing_date,
                                "decision_date": case.decision_date,
                                "hearing_count": case.hearing_count,
                                "nature_of_disposal": case.nature_of_disposal,
                                "court_number_and_judge": case.court_number_and_judge,
                                "petitioner_advocate": case.petitioner_advocate,
                                "respondent_advocate": case.respondent_advocate,
                                "under_act": case.under_act,
                                "under_section": case.under_section,
                                "incident_details": case.incident_details,
                                "claim_amount": case.claim_amount,
                                "settlement_amount": case.settlement_amount,
                                "interest_rate": case.interest_rate,
                                "payment_mode": case.payment_mode,
                                "judge_name": case.judge_name,
                                "summary": case.summary_of_pdf,
                            }
                            for case in common_case_details
                        ]
                    else:
                        response_data["common_case_details"] = [] 

                    return JsonResponse(response_data, status=200)

                except json.JSONDecodeError as e:
                    return JsonResponse({"error": f"JSON parsing error: {str(e)}"}, status=500)

            else:
                return JsonResponse({"error": "No valid JSON found in the response."}, status=500)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

        finally:
            # Clean up the temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
    else:
        return JsonResponse({"error": "Invalid request. Please upload a PDF file."}, status=400)
    


# test_response = {
#     "parsed_data": {
#         "Petitioner name": "Abbas Mahiboob Shaikh",
#         "Petitioner Advocate": "Shri. D. A. Shaikh",
#         "State": "Maharashtra",
#         "District": "Pune",
#         "Court Complex": "Motor Accident Claims Tribunal",
#         "Claim Amount extract": "NA",
#         "Age of Petitioner": "54",
#         "Occupation of Petitioner": "Service",
#         "Dependents of Petitioner": "NA",
#         "Summary": "This is an application to condone a delay of 845 days in restoring a claim application dismissed in 2017. The applicant claims he was advised bed rest and unaware of the dismissal until 2019. The court rejected the application due to lack of evidence supporting the delay."
#     },
#     "classification_data": {
#         "Fraud Analysis": "Potential Fraud",
#         "Reasoning": [
#             "The applicant claims to have been on bed rest for an extended period (2017-2019) without providing any medical documentation.",
#             "The applicant claims to have been unaware of the dismissal of his claim application for two years, which seems implausible.",
#             "The court found the applicant's explanation for the delay unconvincing and lacking in evidence.",
#             "The significant delay (845 days) raises suspicion about the genuineness of the claim."
#         ],
#         "Fraud Flag": True
#     },
#     "petitioner_case_details": [
#         {
#             "case_number": "C002",
#             "case_year": "2020",
#             "petitioner": "Abbas Mahiboob Shaikh",
#             "respondent": "GHI Motor Co.",
#             "unique_case_number": "UC-002",
#             "cnr": "CNR-002-2020",
#             "state": "Maharashtra",
#             "district": "Pune",
#             "court_complex": "Motor Accident Claims Tribunal",
#             "case_type": "Motor Accident Claim",
#             "filing_date": "2020-05-10",
#             "regi_number": "REG-1000",
#             "first_hearing_date": "2020-06-15",
#             "decision_date": "2021-02-05",
#             "hearing_count": "3",
#             "nature_of_disposal": "Pending",
#             "court_number_and_judge": "Court No. 3, Judge S. P. Verma",
#             "petitioner_advocate": "Shri. D. A. Shaikh",
#             "respondent_advocate": "Ms. C. D. Joshi",
#             "under_act": "Motor Vehicles Act",
#             "under_section": "Section 166",
#             "incident_details": "Injury sustained in a collision with a commercial vehicle.",
#             "claim_amount": "300000",
#             "settlement_amount": "NA",
#             "interest_rate": "5%",
#             "payment_mode": "Bank Transfer",
#             "judge_name": "Judge S. P. Verma",
#             "summary": "Awaiting hearing."
#         },
#         {
#             "case_number": "C002",
#             "case_year": "2020",
#             "petitioner": "Abbas Mahiboob Shaikh",
#             "respondent": "GHI Motor Co.",
#             "unique_case_number": "UC-002",
#             "cnr": "CNR-002-2020",
#             "state": "Maharashtra",
#             "district": "Pune",
#             "court_complex": "Motor Accident Claims Tribunal",
#             "case_type": "Motor Accident Claim",
#             "filing_date": "2020-05-10",
#             "regi_number": "REG-1000",
#             "first_hearing_date": "2020-06-15",
#             "decision_date": "2021-02-05",
#             "hearing_count": "3",
#             "nature_of_disposal": "Pending",
#             "court_number_and_judge": "Court No. 3, Judge S. P. Verma",
#             "petitioner_advocate": "Shri. D. A. Shaikh",
#             "respondent_advocate": "Ms. C. D. Joshi",
#             "under_act": "Motor Vehicles Act",
#             "under_section": "Section 166",
#             "incident_details": "Injury sustained in a collision with a commercial vehicle.",
#             "claim_amount": "300000",
#             "settlement_amount": "NA",
#             "interest_rate": "5%",
#             "payment_mode": "Bank Transfer",
#             "judge_name": "Judge S. P. Verma",
#             "summary": "Awaiting hearing."
#         }
#     ],
#     "advocate_case_details": [
#         {
#             "case_number": "C002",
#             "case_year": "2020",
#             "petitioner": "Abbas Mahiboob Shaikh",
#             "respondent": "GHI Motor Co.",
#             "unique_case_number": "UC-002",
#             "cnr": "CNR-002-2020",
#             "state": "Maharashtra",
#             "district": "Pune",
#             "court_complex": "Motor Accident Claims Tribunal",
#             "case_type": "Motor Accident Claim",
#             "filing_date": "2020-05-10",
#             "regi_number": "REG-1000",
#             "first_hearing_date": "2020-06-15",
#             "decision_date": "2021-02-05",
#             "hearing_count": "3",
#             "nature_of_disposal": "Pending",
#             "court_number_and_judge": "Court No. 3, Judge S. P. Verma",
#             "petitioner_advocate": "Shri. D. A. Shaikh",
#             "respondent_advocate": "Ms. C. D. Joshi",
#             "under_act": "Motor Vehicles Act",
#             "under_section": "Section 166",
#             "incident_details": "Injury sustained in a collision with a commercial vehicle.",
#             "claim_amount": "300000",
#             "settlement_amount": "NA",
#             "interest_rate": "5%",
#             "payment_mode": "Bank Transfer",
#             "judge_name": "Judge S. P. Verma",
#             "summary": "Awaiting hearing."
#         },
#         {
#             "case_number": "C002",
#             "case_year": "2020",
#             "petitioner": "Abbas Mahiboob Shaikh",
#             "respondent": "GHI Motor Co.",
#             "unique_case_number": "UC-002",
#             "cnr": "CNR-002-2020",
#             "state": "Maharashtra",
#             "district": "Pune",
#             "court_complex": "Motor Accident Claims Tribunal",
#             "case_type": "Motor Accident Claim",
#             "filing_date": "2020-05-10",
#             "regi_number": "REG-1000",
#             "first_hearing_date": "2020-06-15",
#             "decision_date": "2021-02-05",
#             "hearing_count": "3",
#             "nature_of_disposal": "Pending",
#             "court_number_and_judge": "Court No. 3, Judge S. P. Verma",
#             "petitioner_advocate": "Shri. D. A. Shaikh",
#             "respondent_advocate": "Ms. C. D. Joshi",
#             "under_act": "Motor Vehicles Act",
#             "under_section": "Section 166",
#             "incident_details": "Injury sustained in a collision with a commercial vehicle.",
#             "claim_amount": "300000",
#             "settlement_amount": "NA",
#             "interest_rate": "5%",
#             "payment_mode": "Bank Transfer",
#             "judge_name": "Judge S. P. Verma",
#             "summary": "Awaiting hearing."
#         }
#     ],
#     "common_case_details": [
#         {
#             "case_number": "C001",
#             "case_year": "2019",
#             "petitioner": "Abbas Mahiboob Shaikh",
#             "respondent": "DEF Transport",
#             "unique_case_number": "UC-001",
#             "cnr": "CNR-001-2019",
#             "state": "Maharashtra",
#             "district": "Pune",
#             "court_complex": "Motor Accident Claims Tribunal",
#             "case_type": "Motor Accident Claim",
#             "filing_date": "2019-03-15",
#             "regi_number": "REG-999",
#             "first_hearing_date": "2019-04-20",
#             "decision_date": "2020-01-10",
#             "hearing_count": "5",
#             "nature_of_disposal": "Settled",
#             "court_number_and_judge": "Court No. 2, Judge R. K. Sharma",
#             "petitioner_advocate": "Shri. D. A. Shaikh",
#             "respondent_advocate": "Mr. A. B. Joshi",
#             "under_act": "Motor Vehicles Act",
#             "under_section": "Section 166",
#             "incident_details": "Accident occurred on the Pune-Mumbai highway.",
#             "claim_amount": "500000",
#             "settlement_amount": "450000",
#             "interest_rate": "6%",
#             "payment_mode": "Cheque",
#             "judge_name": "Judge R. K. Sharma",
#             "summary": "Claim settled out of court with mutual consent."
#         },
#         {
#             "case_number": "C002",
#             "case_year": "2020",
#             "petitioner": "Abbas Mahiboob Shaikh",
#             "respondent": "GHI Motor Co.",
#             "unique_case_number": "UC-002",
#             "cnr": "CNR-002-2020",
#             "state": "Maharashtra",
#             "district": "Pune",
#             "court_complex": "Motor Accident Claims Tribunal",
#             "case_type": "Motor Accident Claim",
#             "filing_date": "2020-05-10",
#             "regi_number": "REG-1000",
#             "first_hearing_date": "2020-06-15",
#             "decision_date": "2021-02-05",
#             "hearing_count": "3",
#             "nature_of_disposal": "Pending",
#             "court_number_and_judge": "Court No. 3, Judge S. P. Verma",
#             "petitioner_advocate": "Shri. D. A. Shaikh",
#             "respondent_advocate": "Ms. C. D. Joshi",
#             "under_act": "Motor Vehicles Act",
#             "under_section": "Section 166",
#             "incident_details": "Injury sustained in a collision with a commercial vehicle.",
#             "claim_amount": "300000",
#             "settlement_amount": "NA",
#             "interest_rate": "5%",
#             "payment_mode": "Bank Transfer",
#             "judge_name": "Judge S. P. Verma",
#             "summary": "Awaiting hearing."
#         }
#     ]
# }

# @csrf_exempt
# def test(request):
#     if request.method == 'POST':
#         return JsonResponse(test_response, status=200)