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
            # Initialize both QA and text generation pipelines
            self.qa_pipeline = pipeline(
                "question-answering",
                model="deepset/roberta-base-squad2",
                device=-1  # Use CPU
            )
            self.text_generation = pipeline(
                "text-generation",
                model="gpt2",  # Using GPT-2 for general questions
                device=-1
            )
            logger.info("Successfully initialized LLM pipelines")
        except Exception as e:
            logger.error(f"Error initializing LLM pipelines: {str(e)}")
            raise
        
    def get_available_models(self):
        return ["roberta-base-squad2", "gpt2"]
    
    async def get_answer(self, question: str, model: str, context: str = None) -> str:
        try:
            logger.info(f"Received question: {question}")
            logger.info(f"Using model: {model}")

            if model == "gpt2":
                # For general questions, use text generation
                prompt = f"Question: {question}\nAnswer:"
                result = self.text_generation(
                    prompt,
                    max_length=200,
                    num_return_sequences=1,
                    temperature=0.7,
                    do_sample=True
                )
                answer = result[0]['generated_text'].split("Answer:")[-1].strip()
                logger.info(f"Generated answer: {answer}")
                return answer
            else:
                # For document-based questions, use QA pipeline
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