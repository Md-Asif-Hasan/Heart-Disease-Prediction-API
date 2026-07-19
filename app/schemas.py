from pydantic import BaseModel, Field

class HeartDiseaseFeatures(BaseModel):
    age: float = Field(..., description="Age of the patient")
    sex: float = Field(..., description="Sex (1 = male; 0 = female)")
    cp: float = Field(..., description="Chest pain type (0-3)")
    trestbps: float = Field(..., description="Resting blood pressure")
    chol: float = Field(..., description="Serum cholestoral in mg/dl")
    fbs: float = Field(..., description="Fasting blood sugar > 120 mg/dl (1 = true; 0 = false)")
    restecg: float = Field(..., description="Resting electrocardiographic results (0-2)")
    thalach: float = Field(..., description="Maximum heart rate achieved")
    exang: float = Field(..., description="Exercise induced angina (1 = yes; 0 = no)")
    oldpeak: float = Field(..., description="ST depression induced by exercise relative to rest")
    slope: float = Field(..., description="The slope of the peak exercise ST segment (0-2)")
    ca: float = Field(..., description="Number of major vessels (0-4) colored by flourosopy")
    thal: float = Field(..., description="Thal (0-3, normally 3 = normal; 6 = fixed defect; 7 = reversable defect)")

class PredictionResponse(BaseModel):
    heart_disease: bool
