"""Setup script to initialize knowledge base with documents"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.knowledge_retrieval import knowledge_retrieval
from utils.document_processor import document_processor
from config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_sample_documents():
    """Create sample MSME documents if knowledge base is empty"""
    kb_dir = settings.KNOWLEDGE_BASE_DIR
    
    if not os.path.exists(kb_dir):
        os.makedirs(kb_dir)
        logger.info(f"Created knowledge base directory: {kb_dir}")
    
    # Sample document content
    sample_docs = {
        "mudra_loans.txt": """MUDRA Loans - Pradhan Mantri MUDRA Yojana

The Pradhan Mantri MUDRA Yojana (PMMY) provides loans up to ₹10 lakhs to micro enterprises.

Categories:
1. Shishu: Loans up to ₹50,000
   - For starting new businesses
   - No collateral required
   - Interest rates: 8-12% per annum

2. Kishore: Loans from ₹50,000 to ₹5 lakhs
   - For established businesses looking to expand
   - Minimal documentation
   - Interest rates: 9-13% per annum

3. Tarun: Loans from ₹5 lakhs to ₹10 lakhs
   - For well-established businesses
   - May require business plan
   - Interest rates: 10-14% per annum

Eligibility:
- Indian citizen
- Age: 18 years or above
- Business should be in manufacturing, trading, or service sector
- No existing loan defaults

How to Apply:
1. Visit any bank, NBFC, or MFI
2. Fill application form
3. Submit required documents (Aadhaar, PAN, business proof)
4. Bank will assess and approve

Benefits:
- No collateral for loans up to ₹10 lakhs
- Quick processing
- Lower interest rates
- Flexible repayment terms

For more information, visit: www.mudra.org.in or call 1800-180-1111
""",
        "gst_registration.txt": """GST Registration Guide for MSMEs

Goods and Services Tax (GST) is a comprehensive indirect tax on manufacture, sale, and consumption of goods and services.

When is GST Registration Mandatory?
- Turnover exceeds ₹40 lakhs (₹20 lakhs for services in special category states)
- Inter-state supply of goods/services
- E-commerce operators
- Casual taxable persons

Documents Required:
1. PAN card of business/proprietor
2. Aadhaar card
3. Business address proof (rent agreement, electricity bill)
4. Bank account details and cancelled cheque
5. Photographs (passport size)
6. Business registration certificate (if applicable)

Registration Process:
1. Visit www.gst.gov.in
2. Click on 'Register Now' under 'Taxpayers'
3. Fill Part A with basic details
4. Verify mobile and email with OTP
5. Fill Part B with complete business details
6. Upload required documents
7. Submit application
8. Receive ARN (Application Reference Number)
9. Get GSTIN within 3-7 working days

GST Return Filing:
- GSTR-1: Outward supplies (11th of next month)
- GSTR-3B: Monthly summary (20th of next month)
- GSTR-9: Annual return (December 31st)

Composition Scheme:
- Available for businesses with turnover up to ₹1.5 Crore
- Pay tax at flat rate of 1-6% (depending on business type)
- Quarterly return filing
- Cannot issue tax invoices
- Cannot claim input tax credit

Penalties for Non-Registration:
- 100% of tax due or ₹10,000 (whichever is higher)
- Cannot collect GST from customers
- Cannot claim input tax credit

Benefits of GST Registration:
- Legal recognition
- Can collect GST from customers
- Claim input tax credit
- Easier interstate business
- Participate in government tenders

Helpline: 1800-103-4786
""",
        "udyam_registration.txt": """Udyam Registration for MSMEs

Udyam Registration is the official registration process for Micro, Small, and Medium Enterprises (MSMEs) in India.

Classification of MSMEs:

1. Micro Enterprise:
   - Investment: Up to ₹1 Crore
   - Turnover: Up to ₹5 Crore

2. Small Enterprise:
   - Investment: Up to ₹10 Crore
   - Turnover: Up to ₹50 Crore

3. Medium Enterprise:
   - Investment: Up to ₹50 Crore
   - Turnover: Up to ₹250 Crore

Note: Both investment and turnover criteria must be satisfied.

Benefits of Udyam Registration:
- Access to government schemes and subsidies
- Priority sector lending from banks
- Protection against delayed payments
- Concession in electricity bills
- Exemption from certain direct taxes
- Preference in government procurement
- Collateral-free loans under CGTMSE
- Lower interest rates on loans
- ISO certification reimbursement
- Patent registration subsidy

Registration Process:
1. Visit: https://udyamregistration.gov.in
2. Click on 'For New Entrepreneurs who are not Registered yet as MSME'
3. Enter Aadhaar number
4. Verify with OTP
5. Fill business details:
   - Name and type of enterprise
   - PAN number (auto-filled from Aadhaar)
   - Address
   - Bank details
   - Business activity
   - Investment and turnover details
6. Submit the form
7. Receive Udyam Registration Certificate immediately

Documents Required:
- Aadhaar card (mandatory)
- PAN card (linked to Aadhaar)
- Business details (investment and turnover)

Important Points:
- Registration is completely FREE
- No fee at any stage
- Instant certificate generation
- Valid across India
- Can be updated anytime
- Investment and turnover data auto-fetched from IT returns and GSTIN

Updating Registration:
- Login with Aadhaar
- Update required information
- Submit changes

For Support:
- Email: champions@gov.in
- Helpline: 1800-180-6763

Common Issues:
- Aadhaar not linked to PAN: Link at IT portal first
- Wrong mobile number: Update in Aadhaar
- Technical issues: Clear browser cache or try different browser
""",
        "government_schemes.txt": """Government Schemes for MSMEs

1. PM Vishwakarma Scheme
Target: Traditional artisans and craftspeople
Benefits:
- Skill training
- Toolkit incentive: ₹15,000
- Loan up to ₹3 lakhs at 5% interest
- Digital marketing support
Eligibility: Artisans in 18 traditional trades
Website: pmvishwakarma.gov.in

2. PMEGP (Prime Minister's Employment Generation Programme)
Target: New entrepreneurs
Benefits:
- Subsidy: 15-35% of project cost
- Maximum loan: ₹25 lakhs (manufacturing), ₹10 lakhs (service)
- Margin money subsidy
Eligibility: Age 18+, minimum 8th pass
Website: kviconline.gov.in

3. Stand-Up India
Target: SC/ST and Women entrepreneurs
Benefits:
- Loans: ₹10 lakhs to ₹1 Crore
- Greenfield enterprises
- Handholding support
Eligibility: At least one SC/ST and one woman entrepreneur per bank branch
Website: standupmitra.in

4. CGTMSE (Credit Guarantee Fund Trust for Micro and Small Enterprises)
Target: MSMEs seeking collateral-free loans
Benefits:
- Guarantee coverage up to ₹5 Crore
- No collateral required
- Lower interest rates
Eligibility: Registered MSMEs
Website: cgtmse.in

5. Technology Upgradation Schemes
- CLCSS: Credit Linked Capital Subsidy (15% subsidy)
- Technology and Quality Upgradation Support
- Lean Manufacturing Competitiveness Scheme

6. Market Development Assistance
- International trade fair participation
- Export promotion
- Buyer-seller meets

7. ZED Certification
- Zero Defect Zero Effect certification
- 80% subsidy for micro enterprises
- Quality improvement support

8. MSME Samadhaan
- Delayed payment resolution
- Online filing of disputes
- Fast-track settlement

How to Apply:
1. Register on Udyam portal
2. Visit respective scheme website
3. Fill application with required documents
4. Submit to designated authority
5. Track application status online

Contact:
MSME Helpline: 1800-11-6446
Email: helpdesk-udyam@gov.in
"""
    }
    
    # Write sample documents
    for filename, content in sample_docs.items():
        filepath = os.path.join(kb_dir, filename)
        if not os.path.exists(filepath):
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            logger.info(f"Created sample document: {filename}")


def setup_knowledge_base():
    """Initialize knowledge base with documents"""
    logger.info("Starting knowledge base setup...")
    
    # Create sample documents if needed
    create_sample_documents()
    
    # Load models
    logger.info("Loading knowledge retrieval models...")
    knowledge_retrieval.load_models()
    
    # Check if collection already has documents
    stats = knowledge_retrieval.get_collection_stats()
    if stats.get('total_documents', 0) > 0:
        logger.info(f"Knowledge base already has {stats['total_documents']} documents")
        user_input = input("Do you want to re-index? This will clear existing data. (yes/no): ")
        if user_input.lower() != 'yes':
            logger.info("Skipping re-indexing")
            return
        
        # Clear collection (recreate it)
        knowledge_retrieval.chroma_client.delete_collection(settings.CHROMA_COLLECTION_NAME)
        knowledge_retrieval.collection = knowledge_retrieval.chroma_client.create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
            metadata={"description": "MSME knowledge base"}
        )
        logger.info("Cleared existing collection")
    
    # Intent mapping for documents
    intent_mapping = {
        "mudra": "Loans & Subsidies",
        "loan": "Loans & Subsidies",
        "gst": "GST & Compliance",
        "tax": "GST & Compliance",
        "udyam": "Udyam Registration",
        "registration": "Udyam Registration",
        "scheme": "Government Schemes",
        "license": "Licensing & Permits",
        "permit": "Licensing & Permits"
    }
    
    # Process all documents in knowledge base directory
    logger.info(f"Processing documents from {settings.KNOWLEDGE_BASE_DIR}...")
    chunks, metadatas, ids = document_processor.process_directory(
        settings.KNOWLEDGE_BASE_DIR,
        intent_mapping
    )
    
    if not chunks:
        logger.warning("No documents found to process!")
        return
    
    # Add to knowledge base
    logger.info(f"Adding {len(chunks)} chunks to knowledge base...")
    knowledge_retrieval.add_documents(
        documents=chunks,
        metadatas=metadatas,
        ids=ids
    )
    
    # Verify
    final_stats = knowledge_retrieval.get_collection_stats()
    logger.info(f"Knowledge base setup complete! Total documents: {final_stats['total_documents']}")


if __name__ == "__main__":
    setup_knowledge_base()
