import requests
import json
from pdf2image import convert_from_path
import pytesseract
import os
import csv
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

# Function to extract text from PDF using OCR
def extract_text_from_pdf(pdf_path):
    images = convert_from_path(pdf_path)
    full_text = ""

    for image in images:
        text = pytesseract.image_to_string(image)
        full_text += text + "\n"

    return full_text

# Function to call the Gemma model using the requests library
def call_gemma_model(extracted_text, api_key, pdf_name):
    url = "https://cloud.olakrutrim.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    # Use the pdf file name (without extension) as the CNR Number
    cnr_number = os.path.splitext(pdf_name)[0]

    # Define the prompt to request data in JSON format
    prompt = f"""
    Extract the following information from the provided text and return the data in JSON format:

    1. CNR Number: {cnr_number}
    2. Incident Details: Extract details on what happened in the incident and why the case was filed. If this is not found, provide any available description of the incident from the text.
    3. Claim Amount: Provide only the claim amount as it appears.
    4. Settlement Amount: Provide only the settlement amount.
    5. Interest Rate: Provide only the interest rate.
    6. Payment Mode: Provide only the payment mode.
    7. Nature of Disposal: Provide the nature of disposal in a single word or phrase.
    8. Court Info: Provide the name and location of the court.
    9. Judge Info: Provide the judge's name.
    10. Mode of Settlement: Provide the mode of settlement in a single word or phrase.
    11. Summarise in a way the entire pdf in 2-3 lines whihc gives a clear and concise summary and detailed description of the entire case here so that we have the general summary which basically helps us to understand the pattern of the judgement 
    Text:
    {extracted_text}
    """

    # Payload for the API request
    payload = {
        "model": "Gemma-2-27B-IT",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "frequency_penalty": 0,
        "logprobs": True,
        "top_logprobs": 2,
        "max_tokens": 512,
        "n": 1,
        "presence_penalty": 0,
        "response_format": {"type": "text"},
        "stop": [],
        "stream": False,
        "temperature": 0,
        "top_p": 1
    }

    # Sending the request to the Gemma model
    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error: {response.status_code}, {response.text}")

# Function to process each PDF file
def process_pdf(pdf_name, folder_path, api_key, csv_file, file_exists):
    pdf_path = os.path.join(folder_path, pdf_name)
    print(f"Processing {pdf_name}...")

    # Extract text from the PDF
    extracted_text = extract_text_from_pdf(pdf_path)

    # Call the Gemma model with the extracted text
    try:
        gemma_response = call_gemma_model(extracted_text, api_key, pdf_name)
        print("Response from Gemma model:")

        # Check if the response contains JSON-formatted content
        if 'choices' in gemma_response and len(gemma_response['choices']) > 0:
            generated_text = gemma_response['choices'][0]['message']['content']
            print("Extracted JSON Information:")
            print(generated_text)  # Print the raw JSON text
        else:
            print("Error: No valid response from the model.")
            return

        # Convert the JSON string to a Python dictionary
        cleaned_text = re.search(r"\{.*\}", generated_text, re.DOTALL)

        if cleaned_text:
            data = json.loads(cleaned_text.group())
            print("Loaded JSON data:\n", data)
        else:
            print("No valid JSON found in the response.")
            return

        # Fill missing fields with 'NA'
        required_fields = [
            "CNR Number", "Incident Details", "Claim Amount", "Settlement Amount",
            "Interest Rate", "Payment Mode", "Nature of Disposal", "Court Info",
            "Judge Info", "Mode of Settlement", "Summary"
        ]
        for field in required_fields:
            if field not in data or not data[field]:
                data[field] = "NA"

        # Append to CSV without writing the header multiple times
        with open(csv_file, mode='a', newline='') as file:
            writer = csv.DictWriter(file, fieldnames=required_fields)

            # If file doesn't exist, write the header first
            if not file_exists[0]:
                writer.writeheader()
                file_exists[0] = True  # Update the flag to prevent writing the header again
            
            # Write the data
            writer.writerow(data)

        print(f"Data successfully appended to {csv_file}")

    except Exception as e:
        print(f"Error occurred while processing {pdf_name}: {e}")

# Main execution
if __name__ == "__main__":
    # Specify the folder containing PDF files
    folder_path = "./ocr/"  # Replace with your folder path

    # Your API key
    api_key = ''  

    # CSV file to append data to
    csv_file = 'multi.csv'
    
    # Check if the CSV file already exists
    file_exists = [os.path.isfile(csv_file)]

    # Create a ThreadPoolExecutor with a maximum of 5 workers
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        
        # Iterate over all PDF files in the specified folder
        for pdf_name in os.listdir(folder_path):
            if pdf_name.endswith('.pdf'):
                # Submit the process_pdf function to the executor
                futures.append(executor.submit(process_pdf, pdf_name, folder_path, api_key, csv_file, file_exists))

        # Wait for all futures to complete
        for future in as_completed(futures):
            future.result()  # This will re-raise any exceptions caught in the worker thread

    print("All files processed.")
