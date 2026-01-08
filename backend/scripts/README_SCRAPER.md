# Web Scraper for MSME Knowledge Base

A Python-based web scraper designed to extract information from government websites and populate the MSME chatbot's knowledge base.

## Features

✅ **Respectful Scraping**
- Checks robots.txt before scraping
- Implements rate limiting (2 seconds between requests)
- Proper User-Agent identification

✅ **Smart Content Extraction**
- Removes navigation, footers, and irrelevant content
- Extracts main content areas
- Cleans and normalizes text
- Extracts metadata (title, description)
- Captures related links

✅ **Multiple Output Formats**
- JSON (structured data with metadata)
- TXT (ready for knowledge base integration)

✅ **Error Handling**
- Graceful failure handling
- Detailed logging
- Session management

## Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r scripts/requirements_scraper.txt
```

Or install individually:
```bash
pip install beautifulsoup4 requests lxml
```

### 2. Verify Installation

```bash
python scripts/web_scraper.py
```

## Usage

### Option 1: Scrape Predefined MSME Portals

Run the script interactively:
```bash
python scripts/web_scraper.py
# Choose option 1
```

This will scrape:
- Udyam Registration Portal
- MUDRA Loan Information
- GST Tutorial Portal
- MSME Schemes
- GeM Portal

### Option 2: Scrape Custom URLs

```bash
python scripts/web_scraper.py
# Choose option 2
# Enter URLs one by one
# Press Enter on empty line when done
```

### Option 3: Test Single URL

```bash
python scripts/web_scraper.py
# Choose option 3
# Enter URL to test
```

### Programmatic Usage

```python
from scripts.web_scraper import MSMEWebScraper, scrape_custom_urls

# Initialize scraper
scraper = MSMEWebScraper(output_dir="knowledge_base")

# Scrape single URL
result = scraper.extract_text_from_url("https://msme.gov.in/")

# Scrape multiple URLs
urls = [
    "https://udyamregistration.gov.in/",
    "https://www.mudra.org.in/"
]
scraper.scrape_urls(urls, category="msme_general")

# Or use convenience function
scrape_custom_urls(urls, category="my_category")
```

## Output Format

### JSON Output
```json
[
  {
    "url": "https://example.gov.in/page",
    "title": "Page Title",
    "description": "Meta description",
    "content": "Extracted and cleaned text content...",
    "links": [
      {"text": "Link Text", "url": "https://..."}
    ],
    "scraped_at": "2026-01-08T10:30:00",
    "word_count": 1250
  }
]
```

### TXT Output
```
# CATEGORY - Scraped Knowledge Base
# Last Updated: 2026-01-08 10:30:00

================================================================================
SOURCE: https://example.gov.in/page
TITLE: Page Title
================================================================================

Description: Meta description of the page

Main content text extracted and cleaned...

Related Links:
- Link 1: https://...
- Link 2: https://...
```

## Configuration

Edit the `web_scraper.py` file to customize:

```python
# Rate limiting (seconds between requests)
self.delay = 2  # Increase for slower scraping

# User agent
self.headers = {
    'User-Agent': 'MSME-Knowledge-Bot/1.0'
}
```

## Recommended Websites to Scrape

See `KNOWLEDGE_BASE_SOURCES.md` for comprehensive list of 34+ government websites.

### Priority Websites

1. **Udyam Registration**: https://udyamregistration.gov.in/
2. **MUDRA Loans**: https://www.mudra.org.in/
3. **GST Portal**: https://tutorial.gst.gov.in/
4. **MSME Ministry**: https://msme.gov.in/
5. **GeM Portal**: https://gem.gov.in/
6. **PMEGP**: https://www.kviconline.gov.in/pmegpeportal/

## Best Practices

### 1. Respect robots.txt
Always check and respect robots.txt rules:
```python
scraper.check_robots_txt(url)
```

### 2. Rate Limiting
Don't overload servers. Default is 2 seconds between requests.

### 3. Schedule Regular Updates
```bash
# Weekly scraping using cron (Linux/Mac)
0 2 * * 0 cd /path/to/backend && python scripts/web_scraper.py

# Windows Task Scheduler
# Create task to run weekly
```

### 4. Review Scraped Content
Always review scraped content before adding to knowledge base:
- Check for formatting issues
- Verify accuracy
- Remove irrelevant sections

### 5. Legal Compliance
- Only scrape public government websites
- Respect copyright and terms of service
- Use for educational/research purposes
- Provide proper attribution

## Troubleshooting

### Import Error: beautifulsoup4
```bash
pip install beautifulsoup4 lxml
```

### Connection Timeout
- Increase timeout: `requests.get(url, timeout=60)`
- Check internet connection
- Some websites may block automated access

### Empty Content Extracted
- Website may use JavaScript rendering
- Consider using Selenium for dynamic content:
```bash
pip install selenium webdriver-manager
```

### Rate Limiting/Blocking
- Increase delay between requests
- Use rotating user agents
- Consider using proxies for large-scale scraping

## Advanced Features

### Add PDF Support

```python
import PyPDF2
from io import BytesIO

def extract_pdf(url):
    response = requests.get(url)
    pdf = PyPDF2.PdfReader(BytesIO(response.content))
    text = ''
    for page in pdf.pages:
        text += page.extract_text()
    return text
```

### Add JavaScript Rendering

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

chrome_options = Options()
chrome_options.add_argument("--headless")
driver = webdriver.Chrome(options=chrome_options)
driver.get(url)
html = driver.page_source
driver.quit()
```

### Extract Tables

```python
tables = soup.find_all('table')
for table in tables:
    df = pd.read_html(str(table))[0]
    # Process dataframe
```

## Integration with Knowledge Base

After scraping, integrate with the chatbot:

### 1. Review Generated Files
```bash
ls knowledge_base/*_scraped.txt
```

### 2. Update ChromaDB
```python
python scripts/setup_knowledge_base.py
```

### 3. Test Retrieval
```python
from models.knowledge_retrieval import knowledge_retrieval

results = knowledge_retrieval.retrieve(
    query="What is Udyam registration?",
    intent="Udyam registration",
    top_k=3
)
```

## Maintenance

### Weekly Tasks
- Scrape high-priority websites
- Review new content
- Update knowledge base

### Monthly Tasks
- Comprehensive scraping of all sources
- Verify link validity
- Clean duplicate content

### Quarterly Tasks
- Full knowledge base refresh
- Update scraping patterns if websites changed
- Performance optimization

## Security Considerations

1. **Never scrape**:
   - Login-protected pages
   - Payment pages
   - Personal information

2. **API First**:
   - Check if website provides API
   - APIs are more reliable than scraping

3. **Caching**:
   - Cache scraped content
   - Avoid re-scraping unchanged pages

## License

This scraper is designed for educational and research purposes only. Always comply with website terms of service and applicable laws.

## Support

For issues or questions:
1. Check logs for error messages
2. Verify internet connectivity
3. Test with single URL first
4. Review website's robots.txt

---

**Note**: Web scraping should be done responsibly and ethically. Always respect website terms of service and implement appropriate rate limiting.
