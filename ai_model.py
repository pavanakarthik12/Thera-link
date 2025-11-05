import os
import google.generativeai as genai
from dotenv import load_dotenv
import joblib
from sklearn.linear_model import LogisticRegression
import numpy as np
import pandas as pd

# Load environment variables
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def generate_ai_feedback(adherence_percent, risk_label):
    """
    Generate motivational feedback using Gemini API based on adherence and risk.
    """
    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"You are a health coach. Patient adherence = {adherence_percent}%, risk = {risk_label}. Write one motivational message."
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        # Return a default message if API fails
        return "Keep up the good work! Consistency is key to your health journey."

def create_and_save_risk_model():
    """
    Create a simple logistic regression model for risk prediction and save it.
    """
    # Generate synthetic training data
    np.random.seed(42)
    n_samples = 1000
    
    # Generate synthetic data
    adherence = np.random.uniform(0, 100, n_samples)
    missed_doses = np.random.poisson(2, n_samples)
    
    # Create risk labels (simplified logic)
    risk = []
    for a, m in zip(adherence, missed_doses):
        if a >= 80 and m <= 1:
            risk.append("Low")
        elif a >= 60 and m <= 3:
            risk.append("Medium")
        else:
            risk.append("High")
    
    # Prepare features
    X = np.column_stack((adherence, missed_doses))
    y = np.array(risk)
    
    # Train model
    model = LogisticRegression()
    model.fit(X, y)
    
    # Save model
    joblib.dump(model, 'risk_model.pkl')
    return model

def predict_risk(adherence_percent, missed_doses):
    """
    Predict risk label using the trained model.
    """
    try:
        # Load the model
        model = joblib.load('risk_model.pkl')
        
        # Prepare features
        X = np.array([[adherence_percent, missed_doses]])
        
        # Predict
        risk_label = model.predict(X)[0]
        return risk_label
    except FileNotFoundError:
        # If model doesn't exist, create it
        model = create_and_save_risk_model()
        X = np.array([[adherence_percent, missed_doses]])
        risk_label = model.predict(X)[0]
        return risk_label
    except Exception:
        # Default prediction if something goes wrong
        if adherence_percent >= 80:
            return "Low"
        elif adherence_percent >= 60:
            return "Medium"
        else:
            return "High"