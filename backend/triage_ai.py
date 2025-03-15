# triage_ai.py
import json
from openai import OpenAI
import joblib
import pandas as pd
from ml_model import predict_triage

# Initialize OpenAI client
client = OpenAI(api_key="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")  # Replace with your actual API key

def extract_symptoms_from_conversation(conversation):
    """
    Use OpenAI to extract structured symptom data from conversation.
    
    Parameters:
    conversation (str): The conversation between patient and assistant
    
    Returns:
    dict: Structured patient data
    """
    prompt = f"""
    Based on the following conversation between a patient and a medical assistant,
    extract the following information:
    
    1. Patient age (numeric value)
    2. Patient gender (Male or Female)
    3. Symptoms and their severity (0=None, 1=Mild, 2=Moderate, 3=Severe):
       - fever
       - pain
       - cough
       - shortness_of_breath
       - nausea
       - dizziness
       - rash
    4. Duration of symptoms (in days)
    5. Any mentioned vital signs:
       - temperature (in Fahrenheit)
       - heart_rate (beats per minute)
       - systolic_bp (mmHg)
       - diastolic_bp (mmHg)
       - oxygen_saturation (percentage)
    
    If a piece of information is not mentioned, use a reasonable default value.
    
    Conversation:
    {conversation}
    
    Return the information in JSON format with the exact keys listed above.
    """
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a medical data extraction assistant. Extract structured data from patient conversations."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1  # Low temperature for more deterministic outputs
    )
    
    # Parse the JSON response
    try:
        extracted_text = response.choices[0].message.content
        # Find JSON content (in case there's additional text)
        start_idx = extracted_text.find('{')
        end_idx = extracted_text.rfind('}') + 1
        json_str = extracted_text[start_idx:end_idx]
        
        extracted_data = json.loads(json_str)
        
        # Ensure all required fields are present
        required_fields = [
            'age', 'gender', 'fever', 'pain', 'cough', 'shortness_of_breath',
            'nausea', 'dizziness', 'rash', 'duration_days'
        ]
        
        for field in required_fields:
            if field not in extracted_data:
                if field in ['age', 'duration_days']:
                    extracted_data[field] = 0
                else:
                    extracted_data[field] = 0  # Default symptom severity
        
        # Set default values for vital signs if not present
        vital_signs = {
            'temperature': 98.6,
            'heart_rate': 75,
            'systolic_bp': 120,
            'diastolic_bp': 80,
            'oxygen_saturation': 97
        }
        
        for sign, default_value in vital_signs.items():
            if sign not in extracted_data:
                extracted_data[sign] = default_value
        
        return extracted_data
    except Exception as e:
        print(f"Error extracting data: {e}")
        # Return default values if extraction fails
        return {
            "age": 35,
            "gender": "Unknown",
            "fever": 0,
            "pain": 0,
            "cough": 0,
            "shortness_of_breath": 0,
            "nausea": 0,
            "dizziness": 0,
            "rash": 0,
            "temperature": 98.6,
            "heart_rate": 75,
            "systolic_bp": 120,
            "diastolic_bp": 80,
            "oxygen_saturation": 97,
            "duration_days": 1
        }

def explain_triage_decision(patient_data, triage_level, recommendation):
    """
    Use OpenAI to explain the triage decision in natural language.
    
    Parameters:
    patient_data (dict): Patient features
    triage_level (str): Predicted triage level
    recommendation (str): Recommended action
    
    Returns:
    str: Natural language explanation
    """
    # Create a list of symptoms the patient has
    symptom_descriptions = []
    symptom_names = {
        'fever': 'fever', 
        'pain': 'pain', 
        'cough': 'cough', 
        'shortness_of_breath': 'shortness of breath', 
        'nausea': 'nausea', 
        'dizziness': 'dizziness', 
        'rash': 'rash'
    }
    
    severity_levels = {0: "none", 1: "mild", 2: "moderate", 3: "severe"}
    
    for symptom, name in symptom_names.items():
        if symptom in patient_data and patient_data[symptom] > 0:
            severity = severity_levels.get(patient_data[symptom], "unknown")
            symptom_descriptions.append(f"{severity} {name}")
    
    symptoms_text = ", ".join(symptom_descriptions) if symptom_descriptions else "no significant symptoms"
    
    # Format vital signs if available
    vitals_text = ""
    if 'temperature' in patient_data:
        vitals_text += f"temperature of {patient_data['temperature']}°F, "
    if 'heart_rate' in patient_data:
        vitals_text += f"heart rate of {patient_data['heart_rate']} bpm, "
    if 'oxygen_saturation' in patient_data:
        vitals_text += f"oxygen saturation of {patient_data['oxygen_saturation']}%, "
    
    vitals_text = vitals_text.rstrip(", ")
    
    prompt = f"""
    A patient with the following characteristics:
    - Age: {patient_data.get('age', 'Unknown')}
    - Gender: {patient_data.get('gender', 'Unknown')}
    - Symptoms: {symptoms_text}
    - Duration: {patient_data.get('duration_days', 'Unknown')} days
    - Vital signs: {vitals_text}
    
    Has been assessed as: {triage_level}
    
    The recommendation is: {recommendation}
    
    Please explain this assessment in simple, compassionate language. Include:
    1. Why this level of care was recommended based on their specific symptoms and vital signs
    2. What the patient should do next (specific steps)
    3. Warning signs that would require immediate attention
    4. Reassurance and support
    
    Keep your explanation under 250 words and use a friendly, caring tone.
    """
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a compassionate medical assistant explaining triage decisions to patients."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content

def process_patient_conversation(conversation):
    """
    Process a patient conversation to extract symptoms, predict triage level,
    and generate an explanation.
    
    Parameters:
    conversation (str): The conversation between patient and assistant
    
    Returns:
    dict: Triage results including category, recommendation, and explanation
    """
    # Load the trained model
    try:
        model = joblib.load('triage_model.joblib')
    except:
        raise Exception("Model file not found. Please run ml_model.py first to train and save the model.")
    
    # Extract structured data from conversation
    patient_data = extract_symptoms_from_conversation(conversation)
    
    # Make prediction
    triage_category, recommendation = predict_triage(model, patient_data)
    
    # Generate explanation
    explanation = explain_triage_decision(patient_data, triage_category, recommendation)
    
    # Return results
    return {
        "triage_category": triage_category,
        "recommendation": recommendation,
        "explanation": explanation,
        "extracted_data": patient_data
    }

# Example usage
if __name__ == "__main__":
    # Example conversation
    example_conversation = """
    Patient: Hi, I've been feeling really unwell for the past 3 days.
    Doctor: I'm sorry to hear that. Can you tell me more about your symptoms?
    Patient: I have a fever and a bad cough. The cough is keeping me up at night.
    Doctor: I see. How high is your fever?
    Patient: It's around 101°F. I've been taking Tylenol but it keeps coming back.
    Doctor: And how would you describe your cough? Is it dry or are you coughing up anything?
    Patient: It's a dry cough, and it's pretty bad. Sometimes it's hard to catch my breath after coughing.
    Doctor: Are you experiencing any shortness of breath when you're not coughing?
    Patient: No, just after a coughing fit.
    Doctor: Any other symptoms like pain, nausea, dizziness, or rash?
    Patient: I have some body aches, but no nausea or dizziness. No rash either.
    Doctor: Thank you. May I ask your age?
    Patient: I'm 42.
    Doctor: And have you checked your oxygen levels or heart rate?
    Patient: My heart rate was a bit high at 95, but I haven't checked my oxygen.
    """
    
    # Process the conversation
    results = process_patient_conversation(example_conversation)
    
    # Print results
    print("\nExtracted Patient Data:")
    for key, value in results["extracted_data"].items():
        print(f"{key}: {value}")
    
    print(f"\nTriage Category: {results['triage_category']}")
    print(f"Recommendation: {results['recommendation']}")
    print(f"\nExplanation:\n{results['explanation']}")