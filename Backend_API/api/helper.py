import requests
from bs4 import BeautifulSoup
import json
import re
import io
from PIL import Image

# Import EasyOCR for OCR processing
import easyocr
import numpy as np

reader = easyocr.Reader(['en'])


# Global variables to store session tokens and CAPTCHA text
PHPSESSID = None
JSESSION = None
app_token = None
captcha = None


# Function to get new session tokens
def get_session_tokens():
    global PHPSESSID, JSESSION, app_token, captcha

    # Define the URL
    url = "https://services.ecourts.gov.in/ecourtindia_v6/"

    # Set request headers
    headers = {
        "Sec-Ch-Ua": '"Chromium";v="95", ";Not A Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "close"
    }

    # Make the GET request
    response = requests.get(url, headers=headers)

    # Check for successful response
    if response.status_code == 200:
        # 1. Extract PHPSESSID from cookies
        cookies = response.cookies
        PHPSESSID = cookies.get("PHPSESSID")
        
        print(f"New PHPSESSID: {PHPSESSID}")

        # 2. Handle multiple JSESSION cookies
        jsession_cookies = [cookie for cookie in cookies if cookie.name == "JSESSION"]
        if jsession_cookies:
            # Choose the first JSESSION for simplicity, or handle them based on specific criteria
            JSESSION = jsession_cookies[0].value
            print(f"New JSESSION: {JSESSION}")
        else:
            print("No JSESSION cookie found.")

        # 3. Extract app_token from the relevant part of the HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
         # Find the first <a> tag with the class "nav-link link-dark"
        app_token_link = soup.find('a', class_='nav-link link-dark', href=True)
        
        if app_token_link:
            href_value = app_token_link['href']
            # Find app_token in the href value
            if "app_token=" in href_value:
                app_token = href_value.split("app_token=")[1]
                print(f"New app_token: {app_token}")
        else:
            print("No app_token found.")
    else:
        print(f"Failed to retrieve the page. Status code: {response.status_code}")



def download_captcha_image(captcha_image_url):
    global PHPSESSID, JSESSION, captcha

    # Define the headers
    headers = {
        "Sec-Ch-Ua": '"Chromium";v="95", ";Not A Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "close"
    }

    # Set the cookies with the stored PHPSESSID and JSESSION
    cookies = {
        "PHPSESSID": PHPSESSID,
        "JSESSION": JSESSION
    }

    # Send the GET request to download the CAPTCHA image
    response = requests.get(captcha_image_url, headers=headers, cookies=cookies)

    # Check if the request was successful
    if response.status_code == 200:
        # # Define the file name (you can customize it if needed)
        # file_name = "captcha_image.png"

        # # Write the content to a file
        # with open(file_name, "wb") as file:
        #     file.write(response.content)
        # print(f"CAPTCHA image saved as {file_name}")

        # Perform OCR without saving the image as a file
        img_data = io.BytesIO(response.content)
        img = Image.open(img_data)

        # Convert PIL Image to NumPy array
        img_np = np.array(img)

        # Use EasyOCR to extract the CAPTCHA text
        result = reader.readtext(img_np)
        if result:
            # Join all detected text pieces (if any) into a single string
            captcha_text = ' '.join([text[1] for text in result]).strip()
            # Store the extracted text in the global 'captcha' variable
            captcha = captcha_text
            print(f"Extracted CAPTCHA text: {captcha}")
        else:
            print("No text found in the CAPTCHA image.")
    else:
        print(f"Failed to download CAPTCHA image. Status code: {response.status_code}")


def get_captcha():
    global PHPSESSID, JSESSION, app_token

    # Define the CAPTCHA URL
    captcha_url = "https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/getCaptcha"

    # Set the headers
    headers = {
        "Sec-Ch-Ua": '"Chromium";v="95", ";Not A Brand";v="99"',
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Sec-Ch-Ua-Mobile": "?0",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Origin": "https://services.ecourts.gov.in",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Referer": "https://services.ecourts.gov.in/",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "close"
    }

    # Set the cookies with the stored PHPSESSID and JSESSION
    cookies = {
        "PHPSESSID": PHPSESSID,
        "JSESSION": JSESSION
    }

    # Set the POST data including the app_token
    data = {
        "ajax_req": "true",
        "app_token": app_token
    }

    # Make the POST request to fetch the CAPTCHA
    response = requests.post(captcha_url, headers=headers, cookies=cookies, data=data)

    # Check if the request was successful
    if response.status_code == 200:
        captcha_response = response.json()
        # print("CAPTCHA received:", captcha_response)

        # Update the global app_token with the new value
        app_token = captcha_response['app_token']
        print("Updated app_token:", app_token)

        # Parse the div_captcha to extract the CAPTCHA image src
        print(captcha_response)
        soup = BeautifulSoup(captcha_response['div_captcha'], 'html.parser')
        captcha_image_tag = soup.find('img', id='captcha_image')

        if captcha_image_tag:
            captcha_src = captcha_image_tag['src']
            # Build the full URL for the CAPTCHA image
            captcha_image_url = f"https://services.ecourts.gov.in{captcha_src}"
            print("CAPTCHA Image URL:", captcha_image_url)
            download_captcha_image(captcha_image_url)
        else:
            print("CAPTCHA image not found in response")
    else:
        print(f"Failed to get CAPTCHA. Status code: {response.status_code}")




def submit_party_name(petres_name, rgyearP, case_status, state_code, dist_code, court_complex_code):
    global PHPSESSID, JSESSION, app_token, captcha
    # print("Submitting party name...")
    # print(petres_name, rgyearP, case_status, state_code, dist_code, court_complex_code, app_token, captcha, PHPSESSID, JSESSION)
    # return
    url = "https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/submitPartyName"
    
    # Headers for the POST request
    headers = {
        "Host": "services.ecourts.gov.in",
        "Cookie": f"PHPSESSID={PHPSESSID}; JSESSION={JSESSION}",  # Ensure valid session
        "Sec-Ch-Ua": '"Chromium";v="95", ";Not A Brand";v="99"',
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Sec-Ch-Ua-Mobile": "?0",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Origin": "https://services.ecourts.gov.in",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Referer": "https://services.ecourts.gov.in/",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "close"
    }

    # Data to be sent in the POST request
    data = {
        "petres_name": petres_name,
        "rgyearP": rgyearP,
        "case_status": case_status,
        "fcaptcha_code": captcha,
        "state_code": state_code,
        "dist_code": dist_code,
        "court_complex_code": court_complex_code,
        "app_token": app_token,
        "ajax_req": "true",
        "est_code": "null"
    }

    try:
        # Sending the POST request
        response = requests.post(url, headers=headers, data=data)

        # Check if the request was successful
        if response.status_code == 200:
            if "errormsg" in response.text:
                # print("Error in submitting party name.")
                get_captcha()
            # print("Party name submitted successfully.")
            # print(response.json())
            return response.json()  # Assuming the response is in JSON format
        else:
            return f"Request failed with status code {response.status_code}"
    
    except Exception as e:
        return f"An error occurred: {e}"