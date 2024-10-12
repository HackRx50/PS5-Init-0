import os
import requests
import pyautogui
import time
import logging
import re
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    ElementClickInterceptedException,
    StaleElementReferenceException,
    NoSuchElementException
)
import easyocr


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scrape_court_data.log"),
        logging.StreamHandler()
    ]
)

def log_case_summary(case_details, orders_downloaded, processing_time):
    """Log a summary of the processed case"""
    cnr = case_details.get('cnr_number', 'Unknown CNR')
    filing_number = case_details.get('filing_number', 'Unknown Filing Number')
    
    summary = f"""
    {'='*50}
    Case Processing Summary
    {'='*50}
    CNR Number: {cnr}
    Filing Number: {filing_number}
    Processing Time: {processing_time:.2f} seconds
    Orders Downloaded: {orders_downloaded}
    
    Details found:
    {'-'*30}"""
    
    for key, value in case_details.items():
        if isinstance(value, list):
            summary += f"\n    {key}:"
            for item in value:
                summary += f"\n        - {item}"
        else:
            summary += f"\n    {key}: {value}"
    
    summary += f"\n{'='*50}\n"
    logging.info(summary)


def wait_for_options(select_element):
    options = Select(select_element).options
    return len(options) > 1

def close_modal_if_present(driver, wait):
    try:
        modal_close_button = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(@onclick, 'closeModel')]")
        ))
        modal_close_button.click()
        logging.info("Modal closed successfully.")
        time.sleep(1)
    except TimeoutException:
        logging.info("No modal present or unable to close.")

def rename_latest_downloaded_file(download_dir, cnr_number):
    try:
        # Get all PDF files sorted by last modified time (most recent first)
        files = sorted(
            [f for f in os.listdir(download_dir) if f.endswith(".pdf")],
            key=lambda x: os.path.getmtime(os.path.join(download_dir, x)),
            reverse=True
        )
        
        if files:
            latest_file = os.path.join(download_dir, files[0])
            new_file_path = os.path.join(download_dir, f"{cnr_number}.pdf")
            
            
            os.rename(latest_file, new_file_path)
            logging.info(f"File renamed to {new_file_path}")
        else:
            logging.warning("No PDF file found to rename.")
    except Exception as e:
        logging.error(f"Error renaming file: {str(e)}")

def extract_text_by_xpath(driver, xpath, default=""):
    try:
        element = driver.find_element(By.XPATH, xpath)
        return element.text.strip()
    except NoSuchElementException:
        return default

def scrape_case_details(driver):
    case_details = {}
    
    try:
        # Extract all the details
        case_details["case_type"] = extract_text_by_xpath(driver, "//td[contains(text(), 'Case Type')]/following-sibling::td")
        case_details["filing_number"] = extract_text_by_xpath(driver, "//td[label[contains(text(), 'Filing Number')]]/following-sibling::td")
        case_details["filing_date"] = extract_text_by_xpath(driver, "//td[label[contains(text(), 'Filing Date')]]/following-sibling::td")
        case_details["registration_number"] = extract_text_by_xpath(driver, "//td[label[contains(text(), 'Registration Number')]]/following-sibling::td/label")
        case_details["registration_date"] = extract_text_by_xpath(driver, "//td[label[contains(text(), 'Registration Date')]]/following-sibling::td/label")
        case_details["cnr_number"] = extract_text_by_xpath(driver, "//span[contains(@class, 'fw-bold text-uppercase fs-5 me-2 text-danger')]")
        
        # Extract case status details
        case_details["first_hearing_date"] = extract_text_by_xpath(driver, "//td[label[text()='First Hearing Date']]/following-sibling::td")
        case_details["next_hearing_date"] = extract_text_by_xpath(driver, "//td[label[contains(text(), 'Next Hearing Date')]]/following-sibling::td")
        case_details["case_stage"] = extract_text_by_xpath(driver, "//td[label[contains(text(), 'Case Stage')]]/following-sibling::td/label")
        case_details["court_and_judge"] = extract_text_by_xpath(driver, "//td[label[contains(text(), 'Court Number and Judge')]]/following-sibling::td/label")
        
        # Extract petitioner and advocate details
        petitioner_elements = driver.find_elements(By.XPATH, "//table[contains(@class, 'Petitioner_Advocate_table')]//td")
        case_details["petitioners"] = [elem.text.strip() for elem in petitioner_elements]
        
        # Extract respondent and advocate details
        respondent_elements = driver.find_elements(By.XPATH, "//table[contains(@class, 'Respondent_Advocate_table')]//td")
        case_details["respondents"] = [elem.text.strip() for elem in respondent_elements]
        
        # Extract acts and sections
        acts_elements = driver.find_elements(By.XPATH, "//table[contains(@class, 'acts_table')]//tr[position()>1]")
        acts_sections = []
        for act_elem in acts_elements:
            act = extract_text_by_xpath(act_elem, "./td[1]")
            section = extract_text_by_xpath(act_elem, "./td[2]")
            acts_sections.append({"act": act, "section": section})
        case_details["acts_sections"] = acts_sections
        
        return case_details
    except Exception as e:
        logging.error(f"Error scraping case details: {str(e)}")
        return case_details

def scrape_and_download_orders(driver, cnr_number):
    try:
        # Check for order table
        order_table = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.XPATH, "//h3[@id='orderheading']/following-sibling::table[contains(@class, 'order_table')]"))
        )
        
        order_rows = order_table.find_elements(By.XPATH, ".//tr[position() > 1]")
        orders_found = False
        
        for row in order_rows:
            try:
                order_link = row.find_element(By.XPATH, ".//a[contains(@onclick, 'displayPdf') and .//font[contains(text(), 'Order on Exhibit')]]")
                
                # Get order details for logging
                order_number = row.find_element(By.XPATH, "./td[1]").text.strip()
                order_date = row.find_element(By.XPATH, "./td[2]").text.strip()
                
                logging.info(f"Found Order on Exhibit - Number: {order_number}, Date: {order_date}")
                
                # Click the order link
                driver.execute_script("arguments[0].click();", order_link)
                logging.info(f"Clicked Order on Exhibit link for order number {order_number}")
                
                # Wait for PDF viewer and download button
                time.sleep(5)
                
                # Click download button (adjust coordinates as needed)
                pyautogui.click(1501, 341)
                logging.info("Clicked download button")
                time.sleep(3)
                
                # click on save
                pyautogui.click(1364, 791)

                # Close PDF viewer
                pyautogui.click(1619, 259)
                logging.info("Closed PDF viewer")
                
                # Rename the downloaded file
                download_dir = r'D:\downloads'  # Adjust this path
                rename_latest_downloaded_file(download_dir, f"{cnr_number}_{order_number}")
                
                orders_found = True
                time.sleep(2)
                
            except NoSuchElementException:
                continue
            except Exception as e:
                logging.error(f"Error processing order: {str(e)}")
                continue
        
        return orders_found
    except TimeoutException:
        logging.info("No order table found for this case")
        return False
    except Exception as e:
        logging.error(f"Error in scrape_and_download_orders: {str(e)}")
        return False

def scrape_court_data():
    # Setup WebDriver
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 20)
    
    # Initialize tracking variables
    all_case_details = []
    total_orders_downloaded = 0
    total_cases_processed = 0
    failed_cases = 0
    start_time_total = time.time()
    
    try:
        # Navigate to the website
        url = "https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/index&app_token=7340b58f909d005b11cabd404eacf388a38aef413c9df3aa7e09478f4b0174a"
        driver.get(url)
        logging.info("Navigated to the court data URL.")
        
        # Select Maharashtra state
        logging.info("Selecting Maharashtra state...")
        state_select = wait.until(EC.presence_of_element_located((By.ID, "sess_state_code")))
        Select(state_select).select_by_value("1")
        time.sleep(3)
        
        # Select Pune district
        logging.info("Selecting Pune district...")
        district_select = wait.until(EC.element_to_be_clickable((By.ID, "sess_dist_code")))
        WebDriverWait(driver, 10).until(lambda x: wait_for_options(district_select))
        Select(district_select).select_by_value("25")
        time.sleep(3)
        
        # Select court complex
        logging.info("Selecting court complex...")
        court_complex_select = wait.until(EC.element_to_be_clickable((By.ID, "court_complex_code")))
        WebDriverWait(driver, 10).until(lambda x: wait_for_options(court_complex_select))
        Select(court_complex_select).select_by_value("1010303@1,2,3,22,23@N")
        time.sleep(3)
        
        # Close modal if present
        close_modal_if_present(driver, wait)
        
        # Click Case Type tab
        logging.info("Selecting case type...")
        case_type_tab = wait.until(EC.element_to_be_clickable((By.ID, "casetype-tabMenu")))
        case_type_tab.click()
        time.sleep(2)
        
        # Select MACP case type
        case_type_select = wait.until(EC.presence_of_element_located((By.ID, "case_type_2")))
        Select(case_type_select).select_by_visible_text("M.A.C.P. - Motor Accident Claim Petition")
        
        # Enter year
        logging.info("Entering search year...")
        year_input = wait.until(EC.presence_of_element_located((By.ID, "search_year")))
        year_input.clear()
        year_input.send_keys("2023")
        
        # CAPTCHA handling

        element = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "captcha_image")))
        screenshot = element.screenshot_as_png

        with open("ecourts_captcha.png", "wb") as file:
            file.write(screenshot)

        # Use OCR to read the captcha
        reader = easyocr.Reader(['en'])
        result = reader.readtext("ecourts_captcha.png")
        text = " ".join([detection[1] for detection in result])
        print(f"Captcha detected: {text}")

        captcha_field = driver.find_element(By.ID, 'ct_captcha_code')
        captcha_field.clear()
        captcha_field.send_keys(str(text))


        # logging.info("\nWaiting for CAPTCHA entry...")
        # input("Enter the CAPTCHA in the browser and press Enter here when ready: ")
        
        # Click Go button
        logging.info("Clicking Go button...")
        go_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@onclick='submitCaseType();']")))
        go_button.click()
        time.sleep(5)
        
        # Collect View links
        logging.info("Collecting case links...")
        view_links = wait.until(EC.presence_of_all_elements_located(
            (By.XPATH, "//a[contains(@onclick, 'viewHistory')]")
        ))
        total_cases = len(view_links)
        
        logging.info(f"""
        {'='*50}
        Starting Court Data Scraping
        {'='*50}
        Total cases to process: {total_cases}
        Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        {'='*50}
        """)
        
        for idx, link in enumerate(view_links, 1):
            case_start_time = time.time()
            orders_downloaded = 0
            
            try:
                logging.info(f"Processing case {idx} of {total_cases}")
                driver.execute_script("arguments[0].click();", link)
                time.sleep(5)
                
                case_details = scrape_case_details(driver)
                cnr_number = case_details.get("cnr_number", "Unknown")
                logging.info(f"Scraped details for case with CNR: {cnr_number}")
                
                if case_details.get("cnr_number"):
                    if scrape_and_download_orders(driver, case_details["cnr_number"]):
                        orders_downloaded = 1
                        total_orders_downloaded += 1
                        logging.info(f"Successfully downloaded order for CNR: {cnr_number}")
                
                all_case_details.append(case_details)
                total_cases_processed += 1
                
                # Calculate processing time for this case
                case_processing_time = time.time() - case_start_time
                
                # Log case summary
                log_case_summary(case_details, orders_downloaded, case_processing_time)
                
                # Go back to results page
                back_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Back']")))
                back_button.click()
                time.sleep(3)
                
            except Exception as e:
                failed_cases += 1
                logging.error(f"""
                {'!'*50}
                Error processing case {idx}
                Error message: {str(e)}
                {'!'*50}
                """)
                try:
                    # Attempt to go back to the main page
                    driver.execute_script("window.history.go(-1)")
                    time.sleep(3)
                except:
                    logging.error("Failed to navigate back after error")
                continue
            
            # Log progress after each case
            elapsed_time = time.time() - start_time_total
            avg_time_per_case = elapsed_time / idx
            estimated_time_remaining = avg_time_per_case * (total_cases - idx)
            
            logging.info(f"""
            {'*'*50}
            Progress Update
            {'*'*50}
            Cases processed: {idx}/{total_cases} ({idx/total_cases*100:.2f}%)
            Successful cases: {total_cases_processed}
            Failed cases: {failed_cases}
            Total orders downloaded: {total_orders_downloaded}
            Elapsed time: {elapsed_time/60:.2f} minutes
            Estimated time remaining: {estimated_time_remaining/60:.2f} minutes
            {'*'*50}
            """)
        
        # Save all case details to JSON file
        json_filename = f'case_details_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        logging.info(f"Saving all case details to {json_filename}")
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(all_case_details, f, indent=2, ensure_ascii=False)
        
        # Final summary
        total_time = time.time() - start_time_total
        logging.info(f"""
        {'='*50}
        Final Scraping Summary
        {'='*50}
        Total cases processed: {total_cases_processed}/{total_cases}
        Successful cases: {total_cases_processed - failed_cases}
        Failed cases: {failed_cases}
        Total orders downloaded: {total_orders_downloaded}
        Total time taken: {total_time/60:.2f} minutes
        Average time per case: {total_time/total_cases:.2f} seconds
        JSON output file: {json_filename}
        {'='*50}
        """)
        
    except Exception as e:
        logging.error(f"""
        {'!'*50}
        A critical error occurred
        Error message: {str(e)}
        {'!'*50}
        """)
    finally:
        logging.info("Closing browser...")
        driver.quit()

if __name__ == "__main__":
    scrape_court_data()