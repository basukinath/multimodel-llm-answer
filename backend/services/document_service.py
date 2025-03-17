from fastapi import UploadFile
import PyPDF2
from docx import Document
import io
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentService:
    async def process_document(self, file: UploadFile):
        try:
            logger.info(f"Received file: {file.filename}, content_type: {file.content_type}")
            content = await file.read()
            file_extension = file.filename.split('.')[-1].lower()
            logger.info(f"Processing file with extension: {file_extension}")
            
            if file_extension == 'pdf':
                return self._process_pdf(content)
            elif file_extension == 'docx':
                return self._process_docx(content)
            elif file_extension == 'txt':
                return self._process_txt(content)
            else:
                logger.error(f"Unsupported file type: {file_extension}")
                raise ValueError(f"Unsupported file type: {file_extension}")
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            raise
    
    def _process_pdf(self, content: bytes) -> str:
        try:
            pdf_file = io.BytesIO(content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            logger.info("Successfully processed PDF file")
            return text
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            raise
    
    def _process_docx(self, content: bytes) -> str:
        try:
            doc_file = io.BytesIO(content)
            doc = Document(doc_file)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            logger.info("Successfully processed DOCX file")
            return text
        except Exception as e:
            logger.error(f"Error processing DOCX: {str(e)}")
            raise
    
    def _process_txt(self, content: bytes) -> str:
        try:
            text = content.decode('utf-8')
            logger.info("Successfully processed TXT file")
            return text
        except Exception as e:
            logger.error(f"Error processing TXT: {str(e)}")
            raise 