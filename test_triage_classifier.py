from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Load your trained model
tokenizer = AutoTokenizer.from_pretrained("triage_bioclinicalbert")
model = AutoModelForSequenceClassification.from_pretrained("triage_bioclinicalbert")

# Label mapping
labels = {0: 'Emergency', 1: 'Urgent Care', 2: 'Regular Hospital Appointment'}

def predict(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    
    with torch.no_grad():
        outputs = model(**inputs)
        predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
        predicted_class = torch.argmax(predictions, dim=-1).item()
        confidence = predictions[0][predicted_class].item()
    
    return labels[predicted_class], confidence

# Test cases
test_cases = [
    "Severe chest pain and can't breathe",
    "Mild headache for 2 days",
    "Need routine blood work",
    "Sprained ankle yesterday"
]

for case in test_cases:
    prediction, confidence = predict(case)
    print(f"'{case}' -> {prediction} (confidence: {confidence:.3f})")