# ml_model.py
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import os

# Set random seed for reproducibility
np.random.seed(42)

# List of symptoms we'll track
SYMPTOMS = ['fever', 'pain', 'cough', 'shortness_of_breath', 
            'nausea', 'dizziness', 'rash']

def generate_synthetic_data(n_samples=2000):
    """
    Generate synthetic patient data for training the triage model.
    
    Parameters:
    n_samples (int): Number of synthetic patients to generate
    
    Returns:
    pandas.DataFrame: DataFrame containing synthetic patient data
    """
    print(f"Generating {n_samples} synthetic patient records...")
    
    # Create empty dataframe
    data = pd.DataFrame()
    
    # Generate demographics
    data['age'] = np.random.randint(18, 90, n_samples)
    data['gender'] = np.random.choice(['Male', 'Female'], n_samples)
    
    # Generate symptoms (0=None, 1=Mild, 2=Moderate, 3=Severe)
    for symptom in SYMPTOMS:
        data[symptom] = np.random.choice([0, 1, 2, 3], n_samples, 
                                         p=[0.7, 0.1, 0.1, 0.1])
    
    # Generate vital signs
    # Normal body temperature is around 98.6°F (37°C)
    data['temperature'] = np.random.normal(98.6, 1.5, n_samples)
    # Make some temperatures correlate with fever
    mask = data['fever'] >= 2  # Moderate or severe fever
    data.loc[mask, 'temperature'] = np.random.normal(101.5, 1.8, mask.sum())
    
    # Normal resting heart rate is 60-100 bpm
    data['heart_rate'] = np.random.normal(75, 15, n_samples)
    # Increase heart rate for patients with severe symptoms
    severe_symptoms = (data[SYMPTOMS] == 3).sum(axis=1) >= 1
    data.loc[severe_symptoms, 'heart_rate'] = np.random.normal(95, 20, severe_symptoms.sum())
    
    # Normal blood pressure around 120/80
    data['systolic_bp'] = np.random.normal(120, 20, n_samples)
    data['diastolic_bp'] = np.random.normal(80, 10, n_samples)
    
    # Normal O2 saturation is 95-100%
    data['oxygen_saturation'] = np.random.normal(97, 3, n_samples)
    # Lower oxygen for patients with breathing issues
    mask = data['shortness_of_breath'] >= 2
    data.loc[mask, 'oxygen_saturation'] = np.random.normal(92, 5, mask.sum())
    
    # Generate duration of symptoms
    data['duration_days'] = np.random.randint(1, 14, n_samples)
    
    # Ensure values are in realistic ranges
    data['temperature'] = np.clip(data['temperature'], 95, 106)
    data['heart_rate'] = np.clip(data['heart_rate'], 40, 180)
    data['systolic_bp'] = np.clip(data['systolic_bp'], 70, 200)
    data['diastolic_bp'] = np.clip(data['diastolic_bp'], 40, 120)
    data['oxygen_saturation'] = np.clip(data['oxygen_saturation'], 70, 100)
    
    print("Synthetic data generation complete.")
    return data

def apply_medical_rules(data):
    """
    Apply medical rules to determine triage level and recommendations.
    
    Parameters:
    data (pandas.DataFrame): Patient data
    
    Returns:
    pandas.DataFrame: Patient data with triage levels and recommendations
    """
    print("Applying medical rules to determine triage levels...")
    
    # Create copy to avoid modifying original
    df = data.copy()
    
    # Initialize triage level (1=Not Severe, 5=Very Severe)
    df['triage_level'] = 1
    
    # Rule 1: High fever
    mask = (df['fever'] >= 2) & (df['temperature'] > 101)
    df.loc[mask, 'triage_level'] = np.maximum(df.loc[mask, 'triage_level'], 3)
    
    # Rule 2: Very high fever
    mask = (df['temperature'] > 103)
    df.loc[mask, 'triage_level'] = np.maximum(df.loc[mask, 'triage_level'], 4)
    
    # Rule 3: Severe shortness of breath
    mask = (df['shortness_of_breath'] == 3)
    df.loc[mask, 'triage_level'] = np.maximum(df.loc[mask, 'triage_level'], 4)
    
    # Rule 4: Low oxygen saturation
    mask = (df['oxygen_saturation'] < 92)
    df.loc[mask, 'triage_level'] = np.maximum(df.loc[mask, 'triage_level'], 4)
    
    # Rule 5: Very low oxygen saturation
    mask = (df['oxygen_saturation'] < 88)
    df.loc[mask, 'triage_level'] = 5
    
    # Rule 6: Multiple moderate symptoms
    moderate_symptoms = (df[SYMPTOMS] >= 2).sum(axis=1)
    mask = (moderate_symptoms >= 3)
    df.loc[mask, 'triage_level'] = np.maximum(df.loc[mask, 'triage_level'], 3)
    
    # Rule 7: Multiple severe symptoms
    severe_symptoms = (df[SYMPTOMS] == 3).sum(axis=1)
    mask = (severe_symptoms >= 2)
    df.loc[mask, 'triage_level'] = np.maximum(df.loc[mask, 'triage_level'], 4)
    
    # Rule 8: Age risk factor
    mask = (df['age'] > 65) & (df['triage_level'] >= 3)
    df.loc[mask, 'triage_level'] = np.minimum(df.loc[mask, 'triage_level'] + 1, 5)
    
    # Rule 9: Abnormal vital signs
    mask = ((df['heart_rate'] > 120) | 
            (df['systolic_bp'] > 160) | 
            (df['systolic_bp'] < 90))
    df.loc[mask, 'triage_level'] = np.maximum(df.loc[mask, 'triage_level'], 3)
    
    # Rule 10: Mild symptoms only
    mild_only = ((df[SYMPTOMS] <= 1) & (df[SYMPTOMS] > 0)).all(axis=1)
    mask = mild_only & (df['triage_level'] == 1)
    df.loc[mask, 'triage_level'] = 2
    
    # Map numeric triage level to categories
    triage_map = {
        1: 'Not Severe',
        2: 'Mild',
        3: 'Moderate',
        4: 'Severe',
        5: 'Very Severe'
    }
    df['triage_category'] = df['triage_level'].map(triage_map)
    
    # Generate recommendations based on triage level
    recommendation_map = {
        1: 'Self-Care',
        2: 'Self-Care with Monitoring',
        3: 'Schedule Appointment',
        4: 'Urgent Care',
        5: 'Immediate Emergency Care'
    }
    df['recommendation'] = df['triage_level'].map(recommendation_map)
    
    print("Medical rules applied successfully.")
    return df

def train_triage_model(data, max_depth=5):
    """
    Train a decision tree model to predict triage category.
    
    Parameters:
    data (pandas.DataFrame): Labeled patient data
    max_depth (int): Maximum depth of the decision tree
    
    Returns:
    tuple: (trained model, feature list, X_test, y_test)
    """
    print("Training triage prediction model...")
    
    # Features and target
    features = ['age', 'fever', 'pain', 'cough', 'shortness_of_breath', 
                'nausea', 'dizziness', 'rash', 'temperature', 'heart_rate',
                'systolic_bp', 'diastolic_bp', 'oxygen_saturation', 'duration_days']
    
    X = data[features]
    y_triage = data['triage_category']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y_triage, test_size=0.2, random_state=42)
    
    # Train model
    model = DecisionTreeClassifier(max_depth=max_depth, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    print("\nModel Evaluation:")
    print(classification_report(y_test, y_pred))
    
    return model, features, X_test, y_test

def visualize_model(model, feature_names, X_test, y_test):
    """
    Visualize the decision tree and create a confusion matrix.
    
    Parameters:
    model: Trained decision tree model
    feature_names: List of feature names
    X_test: Test features
    y_test: True labels
    """
    # Create directory for visualizations if it doesn't exist
    os.makedirs('visualizations', exist_ok=True)
    
    # Plot decision tree
    plt.figure(figsize=(20, 10))
    plot_tree(model, feature_names=feature_names, class_names=model.classes_, 
              filled=True, rounded=True, fontsize=10)
    plt.title("Patient Triage Decision Tree")
    plt.savefig('visualizations/decision_tree.png', dpi=300, bbox_inches='tight')
    print("Decision tree visualization saved to 'visualizations/decision_tree.png'")
    
    # Plot confusion matrix
    y_pred = model.predict(X_test)
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=model.classes_, yticklabels=model.classes_)
    plt.xlabel('Predicted')
    plt.ylabel('True')
    plt.title('Confusion Matrix')
    plt.savefig('visualizations/confusion_matrix.png', dpi=300, bbox_inches='tight')
    print("Confusion matrix saved to 'visualizations/confusion_matrix.png'")
    
    # Feature importance
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]
    plt.figure(figsize=(12, 8))
    plt.title('Feature Importance')
    plt.bar(range(X_test.shape[1]), importances[indices], align='center')
    plt.xticks(range(X_test.shape[1]), [feature_names[i] for i in indices], rotation=90)
    plt.tight_layout()
    plt.savefig('visualizations/feature_importance.png', dpi=300)
    print("Feature importance plot saved to 'visualizations/feature_importance.png'")

def save_model(model, filename='triage_model.joblib'):
    """
    Save the trained model to a file.
    
    Parameters:
    model: Trained model
    filename (str): Filename to save the model
    """
    joblib.dump(model, filename)
    print(f"Model saved to {filename}")

def predict_triage(model, patient_data):
    """
    Make a prediction for a single patient.
    
    Parameters:
    model: Trained model
    patient_data (dict): Patient features
    
    Returns:
    tuple: (triage_category, recommendation)
    """
    # Features must be in the same order as during training
    features = ['age', 'fever', 'pain', 'cough', 'shortness_of_breath', 
                'nausea', 'dizziness', 'rash', 'temperature', 'heart_rate',
                'systolic_bp', 'diastolic_bp', 'oxygen_saturation', 'duration_days']
    
    # Convert patient data to DataFrame with one row
    patient_df = pd.DataFrame([patient_data])
    
    # Ensure all required features are present
    for feature in features:
        if feature not in patient_df.columns:
            patient_df[feature] = 0  # Default value if missing
    
    # Make prediction
    triage_category = model.predict(patient_df[features])[0]
    
    # Map triage category to recommendation
    recommendation_map = {
        'Not Severe': 'Self-Care',
        'Mild': 'Self-Care with Monitoring',
        'Moderate': 'Schedule Appointment',
        'Severe': 'Urgent Care',
        'Very Severe': 'Immediate Emergency Care'
    }
    recommendation = recommendation_map.get(triage_category, 'Seek Medical Advice')
    
    return triage_category, recommendation

def main():
    """
    Main function to generate data, train model, and save it.
    """
    # Generate synthetic data
    data = generate_synthetic_data(n_samples=3000)
    
    # Apply medical rules to create labels
    labeled_data = apply_medical_rules(data)
    
    # Print distribution of triage categories
    print("\nDistribution of triage categories:")
    print(labeled_data['triage_category'].value_counts())
    
    # Train model
    model, features, X_test, y_test = train_triage_model(labeled_data)
    
    # Visualize model
    visualize_model(model, features, X_test, y_test)
    
    # Save model
    save_model(model)
    
    # Example prediction
    example_patient = {
        'age': 45,
        'fever': 2,  # Moderate fever
        'pain': 1,   # Mild pain
        'cough': 2,  # Moderate cough
        'shortness_of_breath': 0,  # No shortness of breath
        'nausea': 0,  # No nausea
        'dizziness': 0,  # No dizziness
        'rash': 0,  # No rash
        'temperature': 101.2,
        'heart_rate': 88,
        'systolic_bp': 130,
        'diastolic_bp': 85,
        'oxygen_saturation': 96,
        'duration_days': 3
    }
    
    triage_category, recommendation = predict_triage(model, example_patient)
    print(f"\nExample Prediction:")
    print(f"Patient with moderate fever, mild pain, and moderate cough")
    print(f"Triage Category: {triage_category}")
    print(f"Recommendation: {recommendation}")

if __name__ == "__main__":
    main()