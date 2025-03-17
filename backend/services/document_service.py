from fastapi import UploadFile
import PyPDF2
from docx import Document
import io
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentService:
    async def process_document(self, file: UploadFile) -> str:
        try:
            logger.info(f"Processing document: {file.filename}, content_type: {file.content_type}")
            
            # Read file content
            content = await file.read()
            logger.info(f"File size: {len(content)} bytes")

            if file.content_type == "application/pdf":
                logger.info("Processing PDF file")
                # Process PDF
                pdf_file = io.BytesIO(content)
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                
                # Extract text from all pages
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                
                logger.info(f"Extracted {len(text)} characters from PDF")
                return text
            elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                logger.info("Processing DOCX file")
                # Process DOCX
                doc_file = io.BytesIO(content)
                doc = Document(doc_file)
                text = ""
                for paragraph in doc.paragraphs:
                    text += paragraph.text + "\n"
                logger.info("Successfully processed DOCX file")
                return text
            elif file.content_type == "text/plain":
                logger.info("Processing TXT file")
                # Process TXT
                return content.decode("utf-8")
            else:
                logger.error(f"Unsupported file type: {file.content_type}")
                raise ValueError(f"Unsupported file type: {file.content_type}")
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            raise 