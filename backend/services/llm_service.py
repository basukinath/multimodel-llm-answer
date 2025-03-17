from typing import Optional
from transformers import pipeline
import torch

class LLMService:
    def __init__(self):
        # Initialize the question-answering pipeline with a free model
        self.qa_pipeline = pipeline(
            "question-answering",
            model="deepset/roberta-base-squad2",
            device=-1  # Use CPU
        )
        
    def get_available_models(self):
        return [
            {"id": "roberta-base", "name": "RoBERTa Base (Free)"}
        ]
    
    async def get_answer(self, question: str, model: str, context: Optional[str] = None):
        if not context:
            return "Please provide some context (upload a document or image) before asking a question."
        
        try:
            # Use the question-answering pipeline
            result = self.qa_pipeline(
                question=question,
                context=context
            )
            return result["answer"]
        except Exception as e:
            return f"Error processing your question: {str(e)}" 