import requests
import json
from pdf2image import convert_from_path
import pytesseract
import pandas as pd  # Importing pandas for DataFrame handling
import os
from googletrans import Translator

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

    # Define the prompt to extract information with a refined Incident Details description
    prompt = f"""
    Extract the following information from the provided text:

    1. CNR Number: {cnr_number}  # Using the PDF file name as CNR Number.
    2. Incident Details: Extract details on what happened in the incident and why the case was filed. If this is not found, provide any available description of the incident from the text.
    3. Claim Amount: Provide only the claim amount as it appears.
    4. Settlement Amount: Provide only the settlement amount.
    5. Interest Rate: Provide only the interest rate (e.g., '10%').
    6. Payment Mode: Provide only the payment mode (e.g., 'Bank transfer', 'Cheque').
    7. Nature of Disposal: Provide the nature of disposal in a single word or phrase.
    8. Court Info: Provide the name and location of the court.
    9. Judge Info: Provide the judge's name.
    10. Mode of Settlement: Provide the mode of settlement in a single word or phrase.

    Text:
    {extracted_text}
    
    Provide the output in JSON format, ensuring that the details are extracted word-for-word as they appear in the document.
    """

    # Payload for the API request
    payload = {
        "model": "Gemma-2-27B-IT",
        "messages": [
            {
                "role": "user",
                "content": prompt  # Sending the updated prompt here
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

## Main execution
if __name__ == "__main__":
    # Specify the folder containing PDF files
    folder_path = "./"  # Replace with your folder path

    # Your API key
    api_key = 'pa4NKguX3s6FmHy6EINUN'  # Replace with your actual secret key

    # Initialize the Google Translator
    translator = Translator()

    # Iterate over all PDF files in the specified folder
    for pdf_name in os.listdir(folder_path):
        if pdf_name.endswith('.pdf'):
            pdf_path = os.path.join(folder_path, pdf_name)
            print(f"Processing {pdf_name}...")

            # Extract text from the PDF
            extracted_text = extract_text_from_pdf(pdf_path)

            # Translate the extracted text to English if it's not empty
            if extracted_text.strip():  # Check if the extracted text is not empty
                try:
                    translated_text = translator.translate(extracted_text, dest='en').text
                except Exception as e:
                    print(f"Error translating text from {pdf_name}: {e}")
                    continue  # Skip to the next PDF file
            else:
                print("No text extracted from the PDF.")
                continue  # Skip this file and move to the next

            # Call the Gemma model with the translated text
            try:
                gemma_response = call_gemma_model(translated_text, api_key, pdf_name)
                print("Response from Gemma model:")
                
                # Extracting the text from the response
                if 'choices' in gemma_response and len(gemma_response['choices']) > 0:
                    generated_text = gemma_response['choices'][0]['message']['content']
                    print("Extracted Information in JSON format:")
                    print(generated_text)

                    # Convert the generated_text from JSON string to dictionary
                    extracted_info = json.loads(generated_text)
                    # Optionally, save the extracted info to a DataFrame or process further
                    # df = pd.DataFrame([extracted_info])  # Create DataFrame if needed
                    # df.to_csv(f"{pdf_name}_extracted_info.csv", index=False)

            except Exception as e:
                print(f"Error occurred while processing {pdf_name}: {e}")
