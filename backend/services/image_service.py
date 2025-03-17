from fastapi import UploadFile
import pytesseract
from PIL import Image
import io

class ImageService:
    async def process_image(self, file: UploadFile):
        content = await file.read()
        image = Image.open(io.BytesIO(content))
        
        # Convert image to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Perform OCR
        text = pytesseract.image_to_string(image)
        return text 