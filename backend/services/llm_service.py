from typing import Optional
from transformers import pipeline
import torch
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        logger.info("Initializing LLM Service...")
        try:
            self.qa_pipeline = pipeline(
                "question-answering",
                model="deepset/roberta-base-squad2",
                device=-1  # Use CPU
            )
            logger.info("Successfully initialized QA pipeline")
        except Exception as e:
            logger.error(f"Error initializing QA pipeline: {str(e)}")
            raise
        
    def get_available_models(self):
        return [
            {"id": "roberta-base", "name": "RoBERTa Base (Free)"}
        ]
    
    async def get_answer(self, question: str, model: str, context: Optional[str] = None):
        try:
            logger.info(f"Received question: {question}")
            logger.info(f"Using model: {model}")
            logger.info(f"Context length: {len(context) if context else 0}")

            if not context:
                logger.warning("No context provided for question answering")
                return "I need some context to answer your question. Please upload a document or image first."

            # Truncate context if too long (model has a max length)
            max_length = 512
            if len(context) > max_length:
                logger.info("Context too long, truncating...")
                context = context[:max_length]

            # Get answer from model
            result = self.qa_pipeline(question=question, context=context)
            logger.info(f"Model response: {result}")

            if not result or not result.get('answer'):
                logger.warning("No answer found in model response")
                return "I couldn't find a specific answer to your question in the provided context."

            return result['answer']

        except Exception as e:
            logger.error(f"Error getting answer: {str(e)}")
            return f"Error processing your question: {str(e)}" 