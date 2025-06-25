# Razorpay client initialization
import os

import razorpay
from dotenv import load_dotenv

load_dotenv()

RAZOR_KEY_ID = os.getenv("RAZOR_KEY_ID", "")
RAZOR_KEY_SECRET = os.getenv("RAZOR_KEY_SECRET", "")

razorpay_client = razorpay.Client(auth=(RAZOR_KEY_ID, RAZOR_KEY_SECRET))
