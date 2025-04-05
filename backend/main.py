from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI  # Import the new OpenAI client
import firebase_admin
from firebase_admin import credentials, firestore

# Add these new imports for ML functionality
import joblib
from triage_ai import process_patient_conversation, extract_symptoms_from_conversation, explain_triage_decision
from ml_model import predict_triage

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Allow requests from the frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Initialize Firebase
cred = credentials.Certificate("../serviceAccountKey.json")  # Replace with your Firebase credentials
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize OpenAI
client = OpenAI(api_key="sk-proj-xxxx")  # Replace with your actual API key
# Load the ML model when the app starts
try:
    triage_model = joblib.load('triage_model.joblib')
    print("Triage model loaded successfully")
except Exception as e:
    print(f"Error loading triage model: {e}")
    print("Please run 'python ml_model.py' to generate the model first")
    triage_model = None

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

# NEW ENDPOINTS FOR ML TRIAGE

# ML-powered triage based on conversation
@app.post("/ml-triage")
async def ml_triage(chat_data: dict):
    """
    Process a conversation and return ML-powered triage results.
    """
    if triage_model is None:
        return {"error": "Triage model not loaded. Please train the model first."}
    
    # Get the conversation history
    messages = chat_data.get("messages", [])
    
    # Convert messages to a single string for processing
    conversation = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
    
    # Process the conversation
    try:
        # Use the triage_ai module to process the conversation
        # This will extract symptoms, make a prediction, and generate an explanation
        results = process_patient_conversation(conversation)
        
        # Store the triage results in Firebase
        if "extracted_data" in results:
            patient_data = results["extracted_data"]
            patient_data["triage_category"] = results["triage_category"]
            patient_data["recommendation"] = results["recommendation"]
            
            # Register the patient with triage results
            doc_ref = db.collection("patients").document()
            doc_ref.set(patient_data)
            results["patient_id"] = doc_ref.id
        
        return results
    except Exception as e:
        print(f"Error processing triage: {e}")
        return {"error": str(e)}

# Direct symptom input for triage
@app.post("/direct-triage")
async def direct_triage(patient_data: dict):
    """
    Process direct symptom input and return triage results.
    """
    if triage_model is None:
        return {"error": "Triage model not loaded. Please train the model first."}
    
    try:
        # Make prediction using the ML model
        triage_category, recommendation = predict_triage(triage_model, patient_data)
        
        # Generate explanation using OpenAI
        explanation = explain_triage_decision(patient_data, triage_category, recommendation)
        
        # Store the patient data and triage results
        patient_data["triage_category"] = triage_category
        patient_data["recommendation"] = recommendation
        
        # Register the patient with triage results
        doc_ref = db.collection("patients").document()
        doc_ref.set(patient_data)
        
        return {
            "patient_id": doc_ref.id,
            "triage_category": triage_category,
            "recommendation": recommendation,
            "explanation": explanation
        }
    except Exception as e:
        print(f"Error processing direct triage: {e}")
        return {"error": str(e)}

# Enhanced chat endpoint that includes ML triage
@app.post("/chat-with-triage")
async def chat_with_triage(chat_data: dict):
    """
    Chat with the patient and provide ML-powered triage when appropriate.
    """
    messages = chat_data.get("messages", [])
    
    # Add a system message to guide the conversation
    system_message = {
        "role": "system",
        "content": """
        You are a medical assistant. Ask the patient about their symptoms in a conversational way.
        Collect information about:
        1. Their main symptoms and severity
        2. How long they've had the symptoms
        3. Any relevant vital signs they know
        4. Their age and any relevant medical history
        
        Be empathetic and thorough but concise. After collecting sufficient information,
        let them know you'll assess their condition.
        """
    }
    
    # Check if this is the first message or if we need to add the system message
    if not any(msg.get("role") == "system" for msg in messages):
        messages.insert(0, system_message)
    
    # Call the OpenAI API for the conversation
    response = client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        max_tokens=150,
    )
    
    # Extract the assistant's reply
    assistant_reply = response.choices[0].message.content
    
    # Check if we have enough information for triage
    # We'll do this if we have at least 4 messages (2 from user, 2 from assistant)
    user_messages = [msg for msg in messages if msg.get("role") == "user"]
    
    result = {"reply": assistant_reply}
    
    if len(user_messages) >= 2 and triage_model is not None:
        try:
            # Convert messages to a single string for processing
            conversation = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
            
            # Process for triage if we have enough information
            triage_results = process_patient_conversation(conversation)
            
            # Add triage results to the response
            result["triage_results"] = {
                "category": triage_results["triage_category"],
                "recommendation": triage_results["recommendation"],
                "explanation": triage_results["explanation"]
            }
            
            # Store the patient data and triage results
            if "extracted_data" in triage_results:
                patient_data = triage_results["extracted_data"]
                patient_data["triage_category"] = triage_results["triage_category"]
                patient_data["recommendation"] = triage_results["recommendation"]
                
                # Register the patient with triage results
                doc_ref = db.collection("patients").document()
                doc_ref.set(patient_data)
                result["patient_id"] = doc_ref.id
        except Exception as e:
            print(f"Error processing triage during chat: {e}")
            # Continue with just the chat response if triage fails
    
    return result