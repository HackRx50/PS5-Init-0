import pyautogui
import logging
import time
import threading

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

# Function to check cursor position in real-time
def track_cursor_position():
    while True:
        x, y = pyautogui.position()
        logging.info(f"Current cursor position: X={x}, Y={y}")
        time.sleep(0.5)  # Adjust this interval as needed

# Start the cursor tracking in a separate thread
cursor_thread = threading.Thread(target=track_cursor_position, daemon=True)
cursor_thread.start()

# Main operation with pyautogui
try:
    time.sleep(3)  # Initial delay for setup
    pyautogui.click(400, 500)  # Replace with coordinates for the download button
    logging.info("Download button clicked in the PDF viewer.")
    time.sleep(3)  # Allow time for download to initiate

except Exception as e:
    logging.error(f"An error occurred: {e}")
