from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

app = Flask(__name__)

# TODO: Fetch dataset, initialize vectorizer and LSA here

# Fetch the dataset
newsgroups = fetch_20newsgroups(subset='all')
documents = newsgroups.data  # List of documents

# Initialize TF-IDF vectorizer (removing English stop words)
vectorizer = TfidfVectorizer(stop_words='english')
term_doc_matrix = vectorizer.fit_transform(documents)  # Term-document matrix

# Apply TruncatedSVD for LSA (reducing dimensions)
svd = TruncatedSVD(n_components=100)  # You can adjust the number of components
lsa_matrix = svd.fit_transform(term_doc_matrix)  # Reduced matrix (LSA result)

def search_engine(query):
    """
    Function to search for top 5 similar documents given a query
    Input: query (str)
    Output: documents (list), similarities (list), indices (list)
    """
    query_tfidf = vectorizer.transform([query])
    query_lsa = svd.transform(query_tfidf)

    # Calculate cosine similarities
    similarities = cosine_similarity(query_lsa, lsa_matrix).flatten()

    # Get top 5 most similar documents
    top_indices = np.argsort(similarities)[-5:][::-1]
    
    # Prepare the documents, similarities, and indices for JSON response
    top_similarities = similarities[top_indices].tolist()  # Convert to list
    top_documents = [documents[i] for i in top_indices]  # Already in list form
    top_indices = top_indices.tolist()  # Convert indices to list

    return top_documents, top_similarities, top_indices


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.form['query']
    documents, similarities, indices = search_engine(query)
    return jsonify({'documents': documents, 'similarities': similarities, 'indices': indices}) 

if __name__ == '__main__':
    app.run(debug=True)
