import PyPDF2
import sys

pdf_path = 'knowledge_base/msme_schemes.pdf'
txt_path = 'knowledge_base/msme_schemes.txt'

try:
    # Open and read PDF
    with open(pdf_path, 'rb') as pdf_file:
        reader = PyPDF2.PdfReader(pdf_file)
        text = ''
        
        # Extract text from all pages
        for page in reader.pages:
            text += page.extract_text() + '\n\n'
        
        # Write to text file
        with open(txt_path, 'w', encoding='utf-8') as txt_file:
            txt_file.write(text)
        
        print(f'✓ Successfully extracted {len(reader.pages)} pages from PDF')
        print(f'✓ Created: {txt_path}')
        print(f'✓ Total characters: {len(text):,}')
        
except Exception as e:
    print(f'✗ Error: {e}')
    sys.exit(1)
