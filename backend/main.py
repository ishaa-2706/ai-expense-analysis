from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from model import predict_category

app = FastAPI()

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    results = []

    for _, row in df.iterrows():
        description = row["Description"]
        amount = row["Amount"]

        predicted_category = predict_category(description)

        results.append({
            "description": description,
            "amount": amount,
            "predicted_category": predicted_category
        })

    return {"data": results}