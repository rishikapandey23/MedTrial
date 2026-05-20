import io
import PyPDF2
import pdfplumber

def extract_text_from_pdf(file_bytes: bytes) -> str:
    extracted_text = ""
    # Try pdfplumber first for precise structural text extraction
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
    except Exception as e:
        # Fallback to PyPDF2 standard stream reader
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        except Exception as fallback_err:
            raise Exception(f"Failed to parse PDF file: {str(e)} | Fallback error: {str(fallback_err)}")
            
    return extracted_text.strip()
