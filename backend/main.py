from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
from services.llm_service import LLMService
from services.document_service import DocumentService
from services.image_service import ImageService
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Multi-Model Search API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
llm_service = LLMService()
document_service = DocumentService()
image_service = ImageService()

class QuestionRequest(BaseModel):
    question: str
    llm_model: str
    context: Optional[str] = None

@app.post("/api/ask")
async def ask_question(request: QuestionRequest):
    try:
        logger.info(f"Received question: {request.question}")
        logger.info(f"Using model: {request.llm_model}")
        answer = await llm_service.get_answer(
            question=request.question,
            model=request.llm_model,
            context=request.context
        )
        return {"answer": answer}
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload/document")
async def upload_document(file: UploadFile = File(...)):
    try:
        logger.info(f"Received document upload: {file.filename}, content_type: {file.content_type}")
        content = await document_service.process_document(file)
        logger.info("Document processed successfully")
        return {"content": content}
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        logger.info(f"Received image upload: {file.filename}, content_type: {file.content_type}")
        text = await image_service.process_image(file)
        logger.info("Image processed successfully")
        return {"text": text}
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models")
async def get_available_models():
    try:
        models = llm_service.get_available_models()
        logger.info(f"Available models: {models}")
        return {"models": models}
    except Exception as e:
        logger.error(f"Error getting models: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 