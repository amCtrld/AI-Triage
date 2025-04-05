import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
import random
import joblib
import pickle
import os

# Function to generate synthetic data
def generate_synthetic_data(n_samples=1000):
    data = []
    
    for _ in range(n_samples):
        # Generate random symptom severities (0-3 scale)
        fever = random.randint(0, 3)
        pain = random.randint(0, 3)
        cough = random.randint(0, 3)
        shortness_of_breath = random.randint(0, 3)
        nausea = random.randint(0, 3)
        dizziness = random.randint(0, 3)
        rash = random.randint(0, 3)
        
        # Generate random vital signs
        temperature = round(random.uniform(96.0, 104.0), 1) if random.random() > 0.3 else -1
        heart_rate = random.randint(40, 180) if random.random() > 0.3 else -1
        systolic_bp = random.randint(80, 200) if random.random() > 0.3 else -1
        diastolic_bp = random.randint(40, 120) if random.random() > 0.3 else -1
        oxygen_saturation = random.randint(80, 100) if random.random() > 0.3 else -1
        
        # Generate random patient demographics
        age = random.randint(1, 95)
        gender = random.choice(['male', 'female', 'other'])
        duration_days = random.randint(1, 30)
        
        # Calculate severity score based on symptoms and vitals
        severity_score = 0
        severity_score += fever * 2  # Fever is weighted more heavily
        severity_score += pain
        severity_score += cough
        severity_score += shortness_of_breath * 3  # Breathing issues are critical
        severity_score += nausea
        severity_score += dizziness
        severity_score += rash
        
        # Adjust for vital signs if available
        if temperature != -1 and temperature > 101.5:
            severity_score += 3
        if heart_rate != -1 and (heart_rate < 50 or heart_rate > 120):
            severity_score += 2
        if systolic_bp != -1 and (systolic_bp < 90 or systolic_bp > 180):
            severity_score += 3
        if oxygen_saturation != -1 and oxygen_saturation < 92:
            severity_score += 4
            
        # Age factor - very young and very old are higher risk
        if age < 5 or age > 70:
            severity_score += 2
            
        # Duration factor
        if duration_days > 7:
            severity_score += 1
            
        # Determine triage category based on severity score
        if severity_score >= 15:
            triage_category = "urgent"
        elif severity_score >= 10:
            triage_category = "high"
        elif severity_score >= 5:
            triage_category = "moderate"
        else:
            triage_category = "low"
            
        # Create data entry
        entry = {
            'fever': fever,
            'pain': pain,
            'cough': cough,
            'shortness_of_breath': shortness_of_breath,
            'nausea': nausea,
            'dizziness': dizziness,
            'rash': rash,
            'temperature': temperature,
            'heart_rate': heart_rate,
            'systolic_bp': systolic_bp,
            'diastolic_bp': diastolic_bp,
            'oxygen_saturation': oxygen_saturation,
            'age': age,
            'gender_male': 1 if gender == 'male' else 0,
            'gender_female': 1 if gender == 'female' else 0,
            'gender_other': 1 if gender == 'other' else 0,
            'duration_days': duration_days,
            'triage_category': triage_category
        }
        
        data.append(entry)
    
    return pd.DataFrame(data)

def train_and_save_model():
    print("Generating synthetic training data...")
    train_data = generate_synthetic_data(n_samples=2000)
    print(f"Generated {len(train_data)} training samples")
    
    # Prepare features and target
    X = train_data.drop('triage_category', axis=1)
    y = train_data['triage_category']
    
    print("Class distribution in training data:")
    print(y.value_counts())
    
    # Train decision tree model
    print("\nTraining decision tree model...")
    model = DecisionTreeClassifier(max_depth=10, random_state=42)
    model.fit(X, y)
    
    # Save model in both formats
    print("Saving model as model.pkl...")
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    print("Saving model as new_triage_model.joblib...")
    joblib.dump(model, 'new_triage_model.joblib')
    
    # Backup the original file if it exists
    if os.path.exists('triage_model.joblib'):
        print("Backing up original triage_model.joblib to triage_model.joblib.bak...")
        os.rename('triage_model.joblib', 'triage_model.joblib.bak')
    
    # Rename the new model to the original name
    print("Renaming new_triage_model.joblib to triage_model.joblib...")
    os.rename('new_triage_model.joblib', 'triage_model.joblib')
    
    print("Model training and saving complete!")
    return model

if __name__ == "__main__":
    train_and_save_model()

