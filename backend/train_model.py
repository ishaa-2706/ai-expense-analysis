import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle

# load data
df = pd.read_csv("expenses.csv")

# clean text
df["Description"] = df["Description"].astype(str).str.lower()

X_text = df["Description"]
y = df["Category"]

# vectorize
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(X_text)

# better model
model = LogisticRegression(max_iter=500)

model.fit(X, y)

# save
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("Model trained successfully")