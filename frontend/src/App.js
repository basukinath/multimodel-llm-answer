import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  CircularProgress,
  Grid,
  Alert,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [context, setContext] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${API_URL}/models`);
      setModels(response.data.models);
      if (response.data.models.length > 0) {
        setSelectedModel(response.data.models[0].id);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setError('Failed to fetch available models');
    }
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      let response;
      if (file.type.startsWith('image/')) {
        console.log('Uploading image...');
        response = await axios.post(`${API_URL}/upload/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Image upload response:', response.data);
        setFileContent(response.data.text);
      } else {
        console.log('Uploading document...');
        response = await axios.post(`${API_URL}/upload/document`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Document upload response:', response.data);
        setFileContent(response.data.content);
      }
      setContext(response.data.text || response.data.content);
    } catch (error) {
      console.error('Error uploading file:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.detail || 'Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question || !selectedModel) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/ask`, {
        question,
        llm_model: selectedModel,
        context: context || undefined,
      });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error('Error asking question:', error);
      if (error.response?.data?.error?.code === 'insufficient_quota') {
        setError('API quota exceeded. Please check your OpenAI account billing details or contact support.');
      } else {
        setError(error.response?.data?.detail || 'Failed to get answer');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Multi-Model Search
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Document or Image
            </Typography>
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              }}
            >
              <input {...getInputProps()} />
              <Typography>
                {isDragActive
                  ? 'Drop the file here'
                  : 'Drag and drop a file here, or click to select'}
              </Typography>
            </Box>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            {fileContent && (
              <Typography variant="body2" sx={{ mt: 2, color: 'success.main' }}>
                File uploaded successfully!
              </Typography>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ask a Question
            </Typography>
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Model</InputLabel>
                <Select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  label="Select Model"
                >
                  {models.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !question || !selectedModel}
              >
                {loading ? <CircularProgress size={24} /> : 'Ask Question'}
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Answer
            </Typography>
            {answer ? (
              <Typography>{answer}</Typography>
            ) : (
              <Typography color="text.secondary">
                Ask a question to see the answer here
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App; 