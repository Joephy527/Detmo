# To install

python -m venv .venv

<!-- source .venv/Scripts/activate  -->

source .venv/bin/activate
pip install -r requirements.txt

ngrok authtoken <YOUR_AUTH_TOKEN> <!-- get the auth token after signing up for ngrok -->
ngrok http 8000

# To run

uvicorn main:app --host 0.0.0.0 --port 8000
