import os

import requests
from dotenv import load_dotenv

load_dotenv()

CLERK_API_URL = os.getenv("CLERK_API_URL", "")
CLERK_API_KEY = os.getenv("CLERK_API_KEY", "")
CLERK_JWT_KEY = os.getenv("CLERK_JWT_KEY", "")
CLERK_ISSUER = os.getenv("CLERK_ISSUER", "")


# Clerk API integration
def get_clerk_user(user_id: str):
    response = requests.get(
        f"{CLERK_API_URL}/v1/users/{user_id}",
        headers={"Authorization": f"Bearer {CLERK_API_KEY}"},
    )
    if response.status_code != 200:
        raise Exception(f"Error fetching user: {response.status_code}")
    return response.json()
