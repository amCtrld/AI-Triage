# evaluation_metrics.py
import pickle
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import confusion_matrix, classification_report
from sklearn.model_selection import cross_val_score
import random
import matplotlib.pyplot as plt
import seaborn as sns

# Copy the exact same data generation function from train_model.py
def generate_synthetic_data(n_samples=500):
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

# Main evaluation code
print("Evaluating ML Triage Model Performance")
print("======================================")

# Load your trained model
try:
    with open('triage_model.joblib', 'rb') as f:
        model = pickle.load(f)
    print("Successfully loaded model from model.pkl")
except FileNotFoundError:
    print("Error: model.pkl file not found. Make sure you've trained the model first.")
    exit(1)
except Exception as e:
    print(f"Error loading model: {e}")
    exit(1)

# Generate test data
print("\nGenerating test data...")
test_data = generate_synthetic_data(n_samples=500)

# Separate features from labels
X_test = test_data.drop('triage_category', axis=1)
y_test = test_data['triage_category']

print(f"Generated test set with {len(test_data)} samples")
print(f"Class distribution in test set:")
print(y_test.value_counts())

# Make predictions
print("\nMaking predictions...")
y_pred = model.predict(X_test)

# Calculate metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='weighted')
recall = recall_score(y_test, y_pred, average='weighted')
f1 = f1_score(y_test, y_pred, average='weighted')

# Generate confusion matrix
conf_matrix = confusion_matrix(y_test, y_pred)
class_names = ['low', 'moderate', 'high', 'urgent']  # Your triage categories

# Print results
print(f"\nModel Performance Metrics:")
print(f"Accuracy: {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall: {recall:.4f}")
print(f"F1 Score: {f1:.4f}")

print("\nConfusion Matrix:")
print(conf_matrix)

# Print detailed classification report
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=class_names))

# Calculate per-class metrics
class_precision = {}
class_recall = {}
class_f1 = {}

for i, class_name in enumerate(class_names):
    # Create binary labels for this class
    y_test_binary = [1 if label == class_name else 0 for label in y_test]
    y_pred_binary = [1 if label == class_name else 0 for label in y_pred]
    
    class_precision[class_name] = precision_score(y_test_binary, y_pred_binary)
    class_recall[class_name] = recall_score(y_test_binary, y_pred_binary)
    class_f1[class_name] = f1_score(y_test_binary, y_pred_binary)

print("\nPer-Class Metrics:")
for class_name in class_names:
    print(f"{class_name.capitalize()}:")
    print(f"  Precision: {class_precision[class_name]:.4f}")
    print(f"  Recall: {class_recall[class_name]:.4f}")
    print(f"  F1 Score: {class_f1[class_name]:.4f}")

# Generate visualizations
print("\nGenerating visualizations...")

# 1. Bar Chart of Overall Metrics
metrics = {
    'Accuracy': accuracy,
    'Precision': precision,
    'Recall': recall,
    'F1 Score': f1
}

plt.figure(figsize=(10, 6))
plt.bar(metrics.keys(), metrics.values(), color=['#4285F4', '#EA4335', '#FBBC05', '#34A853'])
plt.ylim(0, 1.0)
plt.title('Overall Model Performance Metrics', fontsize=15)
plt.ylabel('Score', fontsize=12)
plt.grid(axis='y', linestyle='--', alpha=0.7)

# Add value labels on top of bars
for i, (key, value) in enumerate(metrics.items()):
    plt.text(i, value + 0.02, f'{value:.4f}', ha='center', fontsize=11)

plt.savefig('overall_metrics.png', dpi=300, bbox_inches='tight')
print("Saved overall metrics chart to 'overall_metrics.png'")

# 2. Per-Class Metrics Comparison
categories = ['Low', 'Moderate', 'High', 'Urgent']
precision_values = [class_precision[c.lower()] for c in categories]
recall_values = [class_recall[c.lower()] for c in categories]
f1_values = [class_f1[c.lower()] for c in categories]

x = np.arange(len(categories))
width = 0.25

fig, ax = plt.subplots(figsize=(12, 7))
rects1 = ax.bar(x - width, precision_values, width, label='Precision', color='#4285F4')
rects2 = ax.bar(x, recall_values, width, label='Recall', color='#EA4335')
rects3 = ax.bar(x + width, f1_values, width, label='F1 Score', color='#34A853')

ax.set_ylim(0, 1.0)
ax.set_ylabel('Score', fontsize=12)
ax.set_title('Performance Metrics by Triage Category', fontsize=15)
ax.set_xticks(x)
ax.set_xticklabels(categories, fontsize=11)
ax.legend(fontsize=11)
ax.grid(axis='y', linestyle='--', alpha=0.7)

# Add value labels
def add_labels(rects):
    for rect in rects:
        height = rect.get_height()
        ax.annotate(f'{height:.2f}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9)

add_labels(rects1)
add_labels(rects2)
add_labels(rects3)

plt.savefig('per_class_metrics.png', dpi=300, bbox_inches='tight')
print("Saved per-class metrics chart to 'per_class_metrics.png'")

# 3. Confusion Matrix Heatmap
plt.figure(figsize=(10, 8))
sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues',
            xticklabels=categories, yticklabels=categories)
plt.xlabel('Predicted Label', fontsize=12)
plt.ylabel('True Label', fontsize=12)
plt.title('Confusion Matrix', fontsize=15)
plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
print("Saved confusion matrix to 'confusion_matrix.png'")

print("\nEvaluation complete! You can use these metrics in your report.")