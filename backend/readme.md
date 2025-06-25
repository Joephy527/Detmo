# To install

python -m venv .venv

<!-- source .venv/Scripts/activate  -->

source .venv/bin/activate
pip install -r requirements.txt

# To run

uvicorn main:app --host 0.0.0.0 --port 8000
