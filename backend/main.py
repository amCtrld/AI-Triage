from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI  # Import the new OpenAI client
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from the frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Initialize Firebase
cred = credentials.Certificate("../serviceAccountKey.json")  # Replace with your Firebase credentials
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize OpenAI
client = OpenAI(api_key="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")  # Replace with your OpenAI API key

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Hello from the backend!"}

# Register patient endpoint
@app.post("/register-patient")
async def register_patient(patient_data: dict):
    doc_ref = db.collection("patients").document()
    doc_ref.set(patient_data)
    return {"patient_id": doc_ref.id}

# Get patients endpoint
@app.get("/get-patients")
async def get_patients():
    patients_ref = db.collection("patients")
    docs = patients_ref.stream()
    patients = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return patients

# Chat endpoint
@app.post("/chat")
async def chat_with_patient(chat_data: dict):
    messages = chat_data.get("messages", [])
    
    # Add a system message to guide the conversation
    system_message = {
        "role": "system",
        "content": "You are a medical assistant. Ask the patient about their symptoms and determine the urgency level (emergency, urgent, non-urgent). Keep your responses concise."
    }
    messages.insert(0, system_message)

    # Call the OpenAI API
    response = client.chat.completions.create(
        model="gpt-4",  # Use GPT-4 or GPT-3.5-turbo
        messages=messages,
        max_tokens=150,
    )

    # Extract the assistant's reply
    assistant_reply = response.choices[0].message.content
    return {"reply": assistant_reply}

# Handle OPTIONS requests for /chat
@app.options("/chat")
async def options_chat():
    return {"message": "OK"}