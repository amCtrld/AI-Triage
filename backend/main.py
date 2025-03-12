from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore
from openai import OpenAI  # Import the new OpenAI client

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
cred = credentials.Certificate("../serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize OpenAI
client = OpenAI(api_key="")  # Replace with your OpenAI API key

@app.get("/")
def read_root():
    return {"message": "Hello from the backend!"}

@app.post("/register-patient")
async def register_patient(patient_data: dict):
    doc_ref = db.collection("patients").document()
    doc_ref.set(patient_data)
    return {"patient_id": doc_ref.id}

@app.get("/get-patients")
async def get_patients():
    patients_ref = db.collection("patients")
    docs = patients_ref.stream()
    patients = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    return patients

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

@app.post("/check-symptoms")
async def check_symptoms(symptom_data: dict):
    symptoms = symptom_data.get("symptoms", "").lower()
    urgency_level = "non-urgent"  # Default urgency level

    # Basic symptom categorization
    if "chest pain" in symptoms:
        urgency_level = "emergency"
    elif "fever" in symptoms or "cough" in symptoms:
        urgency_level = "urgent"

    return {"urgency": urgency_level}