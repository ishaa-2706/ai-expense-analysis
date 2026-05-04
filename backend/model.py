import pickle

# load trained files
model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

def predict_category(text):
    vec = vectorizer.transform([text])
    prediction = model.predict(vec)[0]
    return prediction