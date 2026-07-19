from fastapi import FastAPI, HTTPException
import joblib
import pandas as pd
import os
from .schemas import HeartDiseaseFeatures, PredictionResponse

app = FastAPI(title="Heart Disease Prediction API", version="1.0.0")

# Load the model on startup
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model", "heart_model.joblib")
model = None

@app.on_event("startup")
def load_model():
    global model
    try:
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.get("/health")
def health_check():
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
    return {"status": "ok"}

@app.get("/info")
def get_info():
    return {
        "model_type": "RandomForestClassifier",
        "features": list(HeartDiseaseFeatures.__fields__.keys())
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(features: HeartDiseaseFeatures):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
    
    # Convert features to DataFrame
    input_data = pd.DataFrame([features.dict()])
    
    # Predict
    prediction = model.predict(input_data)[0]
    
    # prediction is likely int or numpy int, convert to boolean for true/false
    has_disease = bool(prediction == 1)
    
    return {"heart_disease": has_disease}
