import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [generalQuestion, setGeneralQuestion] = useState('');
  const [generalAnswer, setGeneralAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/models');
      const data = await response.json();
      setModels(data.models);
      if (data.models.length > 0) {
        setSelectedModel(data.models[0]);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setError('Failed to fetch available models');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log('Selected file:', selectedFile.name, 'Type:', selectedFile.type, 'Size:', selectedFile.size);
      setFile(selectedFile);
      setError('');
    }
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      console.log('Selected image:', selectedImage.name, 'Type:', selectedImage.type, 'Size:', selectedImage.size);
      setImage(selectedImage);
      setError('');
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload/document', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload file');
      }

      const data = await response.json();
      console.log('File uploaded successfully:', data);
      setError('');
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await fetch('http://localhost:8000/api/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload image');
      }

      const data = await response.json();
      console.log('Image uploaded successfully:', data);
      setError('');
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          llm_model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get answer');
      }

      const data = await response.json();
      setAnswer(data.answer);
      setError('');
    } catch (error) {
      console.error('Error getting answer:', error);
      setError(error.message || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const handleAskGeneralQuestion = async () => {
    if (!generalQuestion) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: generalQuestion,
          llm_model: 'gpt2', // Use GPT-2 for general questions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get answer');
      }

      const data = await response.json();
      setGeneralAnswer(data.answer);
      setError('');
    } catch (error) {
      console.error('Error getting answer:', error);
      setError(error.message || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Multi-Model Search</h1>
      </header>
      <main className="App-main">
        <div className="section">
          <h2>General Questions</h2>
          <div className="input-group">
            <input
              type="text"
              value={generalQuestion}
              onChange={(e) => setGeneralQuestion(e.target.value)}
              placeholder="Ask any general question..."
              className="question-input"
            />
            <button 
              onClick={handleAskGeneralQuestion}
              disabled={loading || !generalQuestion}
              className="ask-button"
            >
              Ask
            </button>
          </div>
          {generalAnswer && (
            <div className="answer-box">
              <h3>Answer:</h3>
              <p>{generalAnswer}</p>
            </div>
          )}
        </div>

        <div className="section">
          <h2>Document Upload</h2>
          <div className="upload-section">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt,.doc,.docx"
              className="file-input"
            />
            <button 
              onClick={handleFileUpload}
              disabled={loading || !file}
              className="upload-button"
            >
              Upload Document
            </button>
          </div>
        </div>

        <div className="section">
          <h2>Image Upload</h2>
          <div className="upload-section">
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="file-input"
            />
            <button 
              onClick={handleImageUpload}
              disabled={loading || !image}
              className="upload-button"
            >
              Upload Image
            </button>
          </div>
        </div>

        <div className="section">
          <h2>Ask Questions About Uploaded Content</h2>
          <div className="model-select">
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-dropdown"
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the uploaded content..."
              className="question-input"
            />
            <button 
              onClick={handleAskQuestion}
              disabled={loading || !question}
              className="ask-button"
            >
              Ask
            </button>
          </div>
          {answer && (
            <div className="answer-box">
              <h3>Answer:</h3>
              <p>{answer}</p>
            </div>
          )}
        </div>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
      </main>
    </div>
  );
}

export default App; 