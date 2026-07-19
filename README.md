# Heart Disease Prediction API

This project contains a machine learning model to predict the presence of heart disease, served using a FastAPI application and packaged in a Docker container.

## Project Structure

- `app/`: Contains the FastAPI code (`main.py` and `schemas.py`).
- `model/`: Contains the training script (`train.py`) and the trained model (`heart_model.joblib`).
- `Dockerfile` and `docker-compose.yml`: For containerization.
- `requirements.txt`: Python dependencies.

## Local Setup

### 1. Train the model
Before running the API, make sure the model is trained. Ensure `heart.csv` is in the project root folder.
```bash
python model/train.py
```
This will generate `model/heart_model.joblib`.

### 2. Run with Docker Compose
```bash
docker-compose build
docker-compose up
```
The API will be available at `http://localhost:8000`.

### 3. Test Endpoints
Access the automatic interactive API documentation (Swagger UI) at:
`http://localhost:8000/docs`

## Deploy to Render

1. Create a new GitHub repository and push this project code.
2. Go to your [Render Dashboard](https://dashboard.render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Render should automatically detect the `Dockerfile`.
   - **Language/Environment:** Docker
   - **Branch:** main
   - **Build context:** Root
5. Click **Create Web Service**.
6. Once deployed, test your live API endpoints.
