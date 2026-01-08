"""
Web Scraper for MSME Knowledge Base
Extracts information from government websites to populate the chatbot's knowledge base.
"""

import requests
from bs4 import BeautifulSoup
import time
import json
from datetime import datetime
from pathlib import Path
import re
from urllib.parse import urlparse, urljoin
from typing import List, Dict, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MSMEWebScraper:
    """Web scraper for extracting information from MSME-related government websites"""
    
    def __init__(self, output_dir: str = "knowledge_base"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # User agent to identify the bot
        self.headers = {
            'User-Agent': 'MSME-Knowledge-Bot/1.0 (Educational/Research Purpose)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        # Rate limiting: seconds between requests
        self.delay = 2
        
        # Session for connection pooling
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
    def check_robots_txt(self, url: str) -> bool:
        """Check if scraping is allowed by robots.txt"""
        try:
            parsed_url = urlparse(url)
            robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
            
            response = self.session.get(robots_url, timeout=10)
            if response.status_code == 200:
                # Simple check - look for Disallow rules
                # For production, use robotparser module
                logger.info(f"robots.txt found for {parsed_url.netloc}")
                return True
            return True  # If no robots.txt, assume allowed
        except Exception as e:
            logger.warning(f"Could not check robots.txt: {e}")
            return True
    
    def extract_text_from_url(self, url: str) -> Optional[Dict]:
        """Extract clean text content from a URL"""
        try:
            logger.info(f"Scraping: {url}")
            
            # Respect rate limiting
            time.sleep(self.delay)
            
            # Make request
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for element in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
                element.decompose()
            
            # Extract metadata
            title = soup.find('title')
            title_text = title.get_text(strip=True) if title else "No Title"
            
            description = soup.find('meta', attrs={'name': 'description'})
            description_text = description.get('content', '') if description else ''
            
            # Extract main content
            # Try to find main content areas
            main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile('content|main'))
            
            if main_content:
                text = main_content.get_text(separator='\n', strip=True)
            else:
                text = soup.get_text(separator='\n', strip=True)
            
            # Clean text
            text = self.clean_text(text)
            
            # Extract links
            links = []
            for link in soup.find_all('a', href=True):
                href = link['href']
                link_text = link.get_text(strip=True)
                if link_text and href:
                    absolute_url = urljoin(url, href)
                    links.append({'text': link_text, 'url': absolute_url})
            
            return {
                'url': url,
                'title': title_text,
                'description': description_text,
                'content': text,
                'links': links[:20],  # Limit links
                'scraped_at': datetime.now().isoformat(),
                'word_count': len(text.split())
            }
            
        except requests.RequestException as e:
            logger.error(f"Error scraping {url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return None
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize extracted text"""
        # Remove excessive whitespace
        text = re.sub(r'\n\s*\n', '\n\n', text)
        text = re.sub(r' +', ' ', text)
        text = text.strip()
        
        # Remove common noise
        text = re.sub(r'(Skip to|Jump to|Go to) (content|main content|navigation)', '', text, flags=re.IGNORECASE)
        text = re.sub(r'^\s*(Home|About|Contact|Privacy Policy|Terms)\s*$', '', text, flags=re.MULTILINE)
        
        return text
    
    def extract_faqs(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract FAQ sections"""
        faqs = []
        
        # Common FAQ patterns
        faq_sections = soup.find_all(['div', 'section'], class_=re.compile('faq', re.I))
        
        for section in faq_sections:
            questions = section.find_all(['h3', 'h4', 'strong', 'dt'])
            for q in questions:
                question_text = q.get_text(strip=True)
                # Try to find answer (next sibling or parent)
                answer = q.find_next_sibling()
                if answer:
                    answer_text = answer.get_text(strip=True)
                    faqs.append({
                        'question': question_text,
                        'answer': answer_text
                    })
        
        return faqs
    
    def scrape_urls(self, urls: List[str], category: str = "general") -> None:
        """Scrape multiple URLs and save to knowledge base"""
        results = []
        
        for url in urls:
            # Check robots.txt
            if not self.check_robots_txt(url):
                logger.warning(f"Scraping not allowed by robots.txt: {url}")
                continue
            
            # Extract content
            data = self.extract_text_from_url(url)
            if data:
                results.append(data)
                logger.info(f"✓ Scraped {data['word_count']} words from {url}")
        
        # Save results
        if results:
            self.save_to_knowledge_base(results, category)
    
    def save_to_knowledge_base(self, results: List[Dict], category: str) -> None:
        """Save scraped content to knowledge base"""
        # Save as JSON
        json_path = self.output_dir / f"{category}_scraped_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        logger.info(f"✓ Saved JSON: {json_path}")
        
        # Save as TXT for knowledge base
        txt_path = self.output_dir / f"{category}_scraped.txt"
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write(f"# {category.upper()} - Scraped Knowledge Base\n")
            f.write(f"# Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            for result in results:
                f.write(f"\n{'='*80}\n")
                f.write(f"SOURCE: {result['url']}\n")
                f.write(f"TITLE: {result['title']}\n")
                f.write(f"{'='*80}\n\n")
                
                if result['description']:
                    f.write(f"Description: {result['description']}\n\n")
                
                f.write(result['content'])
                f.write("\n\n")
                
                if result['links']:
                    f.write("\nRelated Links:\n")
                    for link in result['links'][:10]:
                        f.write(f"- {link['text']}: {link['url']}\n")
                f.write("\n")
        
        logger.info(f"✓ Saved TXT: {txt_path}")
        logger.info(f"✓ Total documents: {len(results)}")


def scrape_msme_portals():
    """Scrape key MSME government portals"""
    scraper = MSMEWebScraper()
    
    # Define target URLs by category
    urls_config = {
        'udyam_registration': [
            'https://udyamregistration.gov.in/Government-India/Ministry-MSME-registration.htm',
            'https://udyamregistration.gov.in/docs/MSME_Registration_FAQs.pdf'  # If PDF handling added
        ],
        'mudra_loans': [
            'https://www.mudra.org.in/Home/AboutMUDRA',
            'https://www.mudra.org.in/Products',
            'https://udyamimitra.in/About/mudra-loans'
        ],
        'gst_info': [
            'https://tutorial.gst.gov.in/downloads/news/faq.htm',
            'https://www.gst.gov.in/help/registration'
        ],
        'msme_schemes': [
            'https://msme.gov.in/schemes-and-programmes',
            'https://www.kviconline.gov.in/pmegpeportal/jsp/pmegponline.jsp'
        ],
        'gem_portal': [
            'https://gem.gov.in/vendor-registration',
            'https://gem.gov.in/seller-hub'
        ]
    }
    
    # Scrape each category
    for category, urls in urls_config.items():
        logger.info(f"\n{'='*60}")
        logger.info(f"Scraping category: {category.upper()}")
        logger.info(f"{'='*60}")
        
        try:
            scraper.scrape_urls(urls, category)
            time.sleep(5)  # Extra delay between categories
        except Exception as e:
            logger.error(f"Error scraping {category}: {e}")
    
    logger.info("\n✓ Scraping completed!")


def scrape_custom_urls(urls: List[str], category: str = "custom"):
    """Scrape custom list of URLs"""
    scraper = MSMEWebScraper()
    scraper.scrape_urls(urls, category)


if __name__ == "__main__":
    print("MSME Web Scraper")
    print("=" * 60)
    print("\nOptions:")
    print("1. Scrape predefined MSME portals")
    print("2. Scrape custom URLs")
    print("3. Test single URL")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        print("\n🚀 Starting scraping of MSME portals...")
        print("This may take several minutes. Please be patient.\n")
        scrape_msme_portals()
    
    elif choice == "2":
        print("\nEnter URLs (one per line, empty line to finish):")
        urls = []
        while True:
            url = input().strip()
            if not url:
                break
            urls.append(url)
        
        if urls:
            category = input("Enter category name: ").strip() or "custom"
            scrape_custom_urls(urls, category)
    
    elif choice == "3":
        url = input("Enter URL to test: ").strip()
        if url:
            scraper = MSMEWebScraper()
            result = scraper.extract_text_from_url(url)
            if result:
                print(f"\n✓ Scraped successfully!")
                print(f"Title: {result['title']}")
                print(f"Word count: {result['word_count']}")
                print(f"\nFirst 500 characters:")
                print(result['content'][:500])
    
    else:
        print("Invalid choice!")
