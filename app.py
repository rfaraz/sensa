from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch

app = FastAPI()

app = FastAPI()

# Allow frontend at localhost:3000 to make requests to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Map numeric labels to human-readable triage levels
id2label = {
    0: "Emergency",
    1: "Urgent Care",
    2: "Regular Hospital Appointment"
}

# Load model + tokenizer from your fine-tuned directory
model_path = "./triage_bioclinicalbert"
model = AutoModelForSequenceClassification.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)

classifier = pipeline("text-classification", model=model, tokenizer=tokenizer)

# Define input structure
class SymptomInput(BaseModel):
    symptoms: str

@app.post("/classify")
async def classify(symptoms: SymptomInput):
    # Run the model on input symptoms
    results = classifier(symptoms.symptoms, return_all_scores=True)[0]

    # Find the top label
    top = max(results, key=lambda x: x["score"])
    label_id = int(top["label"].replace("LABEL_", ""))
    top_label = id2label[label_id]

    # Return scores for all labels as well
    all_scores = {
        id2label[int(res["label"].replace("LABEL_", ""))]: res["score"]
        for res in results
    }

    return {
        "label": top_label,
        "confidence": round(top["score"], 4),
        "all_scores": all_scores
    }
