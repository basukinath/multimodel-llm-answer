# Multi-Model Search

A modern web application that allows users to search and get answers from multiple language models (LLMs) using various document types and images as context.

## Features

- Support for multiple LLM models (OpenAI GPT-3.5, GPT-4, and RoBERTa)
- Document processing (PDF, DOCX, TXT)
- Image processing with OCR
- Modern Material-UI based interface
- Drag-and-drop file upload
- Real-time question answering

## Prerequisites

- Python 3.8+
- Node.js 14+
- Tesseract OCR (for image processing)
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd multimodel-search
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install Tesseract OCR:
- Windows: Download and install from https://github.com/UB-Mannheim/tesseract/wiki
- Linux: `sudo apt-get install tesseract-ocr`
- macOS: `brew install tesseract`

4. Install frontend dependencies:
```bash
cd frontend
npm install
```

5. Create a `.env` file in the root directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Upload a document (PDF, DOCX, TXT) or image (PNG, JPG) using the drag-and-drop interface
2. Select your preferred LLM model from the dropdown
3. Enter your question in the text field
4. Click "Ask Question" to get the answer

## API Endpoints

- `GET /api/models` - Get available LLM models
- `POST /api/ask` - Ask a question with context
- `POST /api/upload/document` - Upload and process a document
- `POST /api/upload/image` - Upload and process an image

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 