import time
import os
import pandas as pd
import requests
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.action_chains import ActionChains
import easyocr
from selenium.webdriver.chrome.options import Options
import re

# Initialize ChromeOptions
chrome_options = Options()
# chrome_options.add_argument("--headless")  # Run Chrome in headless mode (optional)
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
# chrome_options.add_argument("--start-fullscreen")

# Initialize Selenium WebDriver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

# Access the target website
driver.get("https://judgments.ecourts.gov.in/pdfsearch/")

# Select "High Court" from dropdown
WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'fcourt_type')))
select = Select(driver.find_element(By.ID, 'fcourt_type'))
select.select_by_visible_text('High Court')

# Captcha handling with retries
def solve_captcha(max_retries=5):
    for attempt in range(max_retries):
        # Capture and save captcha image
        element = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "captcha_image")))
        screenshot = element.screenshot_as_png

        with open("hc_screenshot.png", "wb") as file:
            file.write(screenshot)

        # Use OCR to read the captcha
        reader = easyocr.Reader(['en'])
        result = reader.readtext("hc_screenshot.png")

        text = " ".join([detection[1] for detection in result])
        print(f"Attempt {attempt + 1} - Captcha detected: {text}")

        # Updated regex to match "x" for multiplication as well
        expression_match = re.search(r'(\d+)\s*([+*/x-])\s*(\d+)', text)

        if expression_match:
            num1 = int(expression_match.group(1))
            operator = expression_match.group(2)
            num2 = int(expression_match.group(3))

            # Compute the result based on the operator
            if operator == '+' or operator == 'x':  # Treat 'x' as multiplication
                result = num1 + num2 if operator == '+' else num1 * num2
            elif operator == '-':
                result = num1 - num2
            elif operator == '*':
                result = num1 * num2
            elif operator == '/':
                result = num1 // num2  # Integer division

            # Input the computed result into the captcha field
            captcha_field = driver.find_element(By.ID, 'captcha')
            captcha_field.clear()
            captcha_field.send_keys(str(result))
        else:
            print("No arithmetic expression detected. Retrying...")
            refresh_captcha()
            continue

        search_button = driver.find_element(By.ID, 'main_search')
        search_button.click()
        time.sleep(3)

        # Check if captcha was successful
        if "Invalid Captcha..!!!" in driver.page_source or "Captcha should be numeric..!" in driver.page_source:
            print(f"Attempt {attempt + 1} - Invalid captcha. Retrying...")
            refresh_captcha()
        else:
            print("Captcha entered successfully.")
            break

# Refresh captcha function
def refresh_captcha():
    close_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, 'btn-close')))
    close_button.click()
    refresh_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, '//*[@id="captcha_div"]/div[1]/a')))
    refresh_button.click()

# Solve captcha initially
solve_captcha()

# Select court and other necessary actions
court = WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, '/html/body/div[2]/nav/div/div/ul/li[1]')))
court.click()

# Wait for the dropdown to be available and select court
select_court = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '/html/body/nav/div/div[2]/div/select[1]')))
Select(select_court).select_by_visible_text('High Court')

# Wait for the input field to be visible
input_field = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '/html/body/nav/div/div[2]/div/input')))
input_field.clear()
input_field.send_keys("Motor Accident Claim Petition")

# Click search button to proceed
search = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, '/html/body/div[2]/nav/div/div/div/div/button[1]')))
search.click()

# Process page content and download PDFs
details = []

while True:
    # Check for session timeout and handle captcha again
    if 'Session timeout..!!!' in driver.page_source:
        solve_captcha()

    for i in range(9):
        element_id = 'link_' + str(i)
        if element_id in driver.page_source:
            element = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, element_id)))
            driver.execute_script("arguments[0].scrollIntoView();", element)
            actions = ActionChains(driver)
            actions.move_to_element(element).perform()

            # Extract table data
            WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "report_body")))
            result_elements = driver.find_element(By.ID, 'report_body').find_elements(By.TAG_NAME, 'tr')

            for result_element in result_elements:
                # Extract case details text
                case_details_text = result_element.find_element(By.CLASS_NAME, 'caseDetailsTD').text
                case_details_list = case_details_text.split(" | ")

                # Extract court information from the specific span element
                court_name = result_element.find_element(By.XPATH, ".//span[contains(text(), 'Court')]").text.split(" : ")[1].strip()

                # Extract other details
                result_details_dict = {key_val.split(' : ')[0]: key_val.split(' : ')[1] for key_val in case_details_list if ' : ' in key_val}

                # Add court name to the dictionary
                result_details_dict['Court'] = court_name

                # Append to the details list
                details.append(result_details_dict)


            # Save data to CSV
            df = pd.DataFrame(details)
            df.to_csv("high_court_data.csv", index=False)

            df_merged = df.groupby(df.columns.tolist()).size().reset_index().rename(columns={0: 'Count'})
            df_merged.to_csv("merged_high_court_data.csv", index=False)

            # Download PDF from the new window
            element.click()

            parent_window = driver.current_window_handle
            windows = driver.window_handles
            for window in windows:
                if window != parent_window:
                    driver.switch_to.window(window)
                    pdf_url = driver.current_url
                    response = requests.get(pdf_url)

                    # Save PDF file
                    with open(f"downloaded_{window}.pdf", "wb") as file:
                        file.write(response.content)

                    df_merged['Downloaded'] = df_merged['Count'] > 0
                    df_merged.to_csv("merged_high_court_data.csv", index=False)

                    driver.close()
            driver.switch_to.window(parent_window)

        else:
            print("All PDFs for this state downloaded!")
            break

    # Handle pagination
    next_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, 'example_pdf_next')))
    if "disabled" in next_button.get_attribute("class"):
        print("No more pages")
        break
    else:
        next_button.click()
        driver.execute_script("window.scrollTo(0, 0);")

# Close the driver after process completion
driver.quit()
