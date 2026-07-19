import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

# Paths
DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "heart.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "heart_model.joblib")

def train_model():
    print(f"Loading data from {DATA_PATH}...")
    try:
        df = pd.read_csv(DATA_PATH)
    except FileNotFoundError:
        print(f"Error: Could not find dataset at {DATA_PATH}")
        return

    # Split features and target
    X = df.drop(columns=["target"])
    y = df["target"]

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train Random Forest Classifier
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model accuracy on test set: {acc:.4f}")

    # Save the model
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
