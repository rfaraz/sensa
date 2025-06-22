# train_triage_classifier.py
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import load_dataset, Dataset
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, f1_score

# 1. Load your data
df = pd.read_csv("Merged_Triage_Dataset.csv")

# Data validation
print(f"Dataset shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"Unique triage levels: {df['triage_level'].unique()}")

# Check for missing values
if df[['symptom_description', 'triage_level']].isnull().any().any():
    print("Warning: Missing values detected!")
    df = df.dropna(subset=['symptom_description', 'triage_level'])

# 2. Map labels to integers
label_mapping = {'Emergency': 0, 'Urgent Care': 1, 'Regular Hospital Appointment': 2}
df['label'] = df['triage_level'].map(label_mapping)

# Verify label mapping
print(f"Label distribution: {df['label'].value_counts()}")

# 3. Convert to Hugging Face Dataset
dataset = Dataset.from_pandas(df[['symptom_description', 'label']])
dataset = dataset.train_test_split(test_size=0.2)

# 4. Load model + tokenizer with safetensors
model_name = "emilyalsentzer/Bio_ClinicalBERT"

try:
    # Try with safetensors first
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name, 
        num_labels=3,
        use_safetensors=True
    )
    print("Successfully loaded model with safetensors")
except Exception as e:
    print(f"Safetensors failed: {e}")
    print("Trying alternative approach...")
    
    # Alternative: try a different model that might have safetensors
    alternative_model = "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext"
    try:
        tokenizer = AutoTokenizer.from_pretrained(alternative_model)
        model = AutoModelForSequenceClassification.from_pretrained(
            alternative_model, 
            num_labels=3,
            use_safetensors=True
        )
        print(f"Successfully loaded alternative model: {alternative_model}")
    except Exception as e2:
        print(f"Alternative model also failed: {e2}")
        # Last resort: try without safetensors but with trust_remote_code
        print("Trying original model without safetensors...")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(
            model_name, 
            num_labels=3,
            trust_remote_code=True  # This might help bypass some restrictions
        )

# Fix tokenizer padding token if needed
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

# 5. Tokenize inputs
def tokenize(example):
    return tokenizer(example["symptom_description"], truncation=True, padding="max_length", max_length=512)

tokenized = dataset.map(tokenize, batched=True)
# Remove original text column to avoid conflicts
tokenized = tokenized.remove_columns(['symptom_description'])

# 6. Define metrics
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {
        "accuracy": accuracy_score(labels, preds),
        "f1": f1_score(labels, preds, average='weighted')
    }

# 7. Training configuration
training_args = TrainingArguments(
    output_dir="./triage_model",
    eval_strategy="epoch",
    save_strategy="no",  # Changed from "epoch" to "no"
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=4,
    weight_decay=0.01,
    logging_dir="./logs",
    save_total_limit=1,
    load_best_model_at_end=False,  # Changed to False
    metric_for_best_model="f1",
    logging_steps=50,
)

# 8. Start training
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized["train"],
    eval_dataset=tokenized["test"],
    tokenizer=tokenizer,
    compute_metrics=compute_metrics,
)

print("Starting training...")
trainer.train()

# 9. Save the fine-tuned model
trainer.save_model("triage_bioclinicalbert")
tokenizer.save_pretrained("triage_bioclinicalbert")

print("Training completed and model saved!")
