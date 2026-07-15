import requests
import cv2
import base64
import numpy as np
import time

# Create a blank image with a face-like structure just to test, or just grab a real face if we had one.
# Wait, let's just grab a random image from somewhere or take a snapshot from webcam if on mac.
# But I am in a headless environment. I will download a face image.
import urllib.request
urllib.request.urlretrieve("https://raw.githubusercontent.com/opencv/opencv/master/samples/data/lena.jpg", "lena.jpg")

with open("lena.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

payload = {
    "image": f"data:image/jpeg;base64,{b64}",
    "api_type": "basic"
}

# The user is running backend locally or I can just import the function
from app.services.cv.mediapipe_engine import process_demo_frame
res = process_demo_frame(**payload)
print("Result:")
for k, v in res.items():
    if k != 'bbox' and k != 'enrollment_signature':
        print(f"{k}: {v}")
