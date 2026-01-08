
# MSME Business Support Chatbot 🤖

An intelligent AI-powered chatbot for Micro, Small, and Medium Enterprises (MSMEs) in India providing instant support for:
- 💰 **Government schemes & subsidies** (MUDRA, PMEGP, Stand-Up India, etc.)
- 📊 **Loan information** with detailed eligibility & application process
- 📝 **GST registration & compliance** guidance
- 🏢 **Udyam registration** step-by-step assistance
- 📋 **Business licenses & permits** requirements
- 👥 **Employee management** and labor compliance
- 💻 **Digital marketing** strategies for MSMEs
- 📈 **Tax compliance** and filing procedures

## ✨ Latest Features (January 2026)

### 🚀 AI-Powered Response Generation (NEW!)
- **Groq API Integration**: Lightning-fast responses using Llama 3.3 70B model
- **14,400 requests/day** free tier (vs Gemini's 20/day)
- **Comprehensive answers**: Detailed step-by-step procedures with all documentation
- **Multi-language support**: Responses in English, Hindi, and 6+ Indian languages
- **Context-aware**: Tailored responses based on business profile

### 📚 Expanded Knowledge Base
- **13 comprehensive guides** (15-60 KB each)
- **546 indexed chunks** for precise retrieval
- **Topics covered**: MUDRA loans, GST, Udyam, government schemes, licenses, employee management, digital marketing, tax compliance, and more
- **Optimized chunking**: 1500 chars with 300 overlap for better context

### 🎙️ Voice Input & Output
- **Speech-to-Text**: Ask questions using your voice
- **Text-to-Speech**: Listen to bot responses
- Hands-free interaction for better accessibility

### 💡 Smart AI-Generated Suggestions
- **Contextual follow-up questions**: AI analyzes conversation to suggest next questions
- **3 relevant suggestions** after each response
- One-click question selection

### 🔗 Rich Media Responses
- Official government portal links
- Action buttons (EMI calculator, guides)
- Helpline and contact information cards
- Embedded resources and quick links

### 📊 Analytics Dashboard
- Real-time usage statistics
- Popular query tracking
- User satisfaction metrics
- Language distribution insights
- Performance monitoring

### 🗂️ Conversation Memory
- Session-based chat history
- Context-aware multi-turn conversations
- 24-hour session persistence
- Seamless conversation flow

**See [FEATURE_GUIDE.md](./FEATURE_GUIDE.md) for detailed usage instructions**

## 🏗️ Architecture

### Frontend Stack
- **React 18** + **TypeScript** + **Vite**
- **shadcn/ui** components with **Tailwind CSS**
- **Framer Motion** for animations
- **React Router** for navigation
- **Lucide Icons** for beautiful UI

### Backend Stack
- **Python 3.13** + **FastAPI**
- **Groq API** (Llama 3.3 70B) for AI responses
- **ChromaDB** for vector database
- **Sentence Transformers** for embeddings
- **DistilBERT** for intent classification
- **Multi-language detection** (8 Indian languages)

### ML/AI Pipeline
1. **Language Detection**: Auto-detects user language
2. **Text Preprocessing**: Cleans and normalizes input
3. **Intent Classification**: DistilBERT with 90%+ accuracy
4. **Knowledge Retrieval**: RAG with semantic search
5. **Response Generation**: Groq-powered comprehensive answers
6. **Session Management**: Context preservation
7. **Analytics Tracking**: Usage insights

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.9+ 
- **Git**

### Frontend Setup

```bash
# Clone repository
git clone <YOUR_GIT_URL>
cd msme-mitra

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:5173**

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download ML models (~500MB, one-time)
python scripts/download_models.py

# Setup environment variables
cp .env.example .env
# Edit .env and add your Groq API key

# Initialize knowledge base (546 chunks)
python scripts/setup_knowledge_base.py

# Start backend server
python main.py
```

Backend API runs at: **http://localhost:8000**  
API Docs: **http://localhost:8000/docs**

### Get Your Free Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up (free - no credit card required)
3. Create an API key
4. Copy key (starts with `gsk_...`)
5. Add to `backend/.env`:
   ```env
   GROQ_API_KEY=gsk_your_key_here
   ```

**Free Tier**: 14,400 requests/day | Lightning fast ⚡

See [GROQ_SETUP.md](./GROQ_SETUP.md) for detailed setup.

### Running Both Together

**Terminal 1** (Backend):
```bash
cd backend
python main.py
```

**Terminal 2** (Frontend):
```bash
npm run dev
```

Then visit: **http://localhost:8080/chat** 🎉

## 📁 Project Structure

```
msme-mitra/
├── backend/                      # Python FastAPI backend
│   ├── models/                   # ML models
│   │   ├── intent_classifier.py  # DistilBERT intent classification
│   │   ├── knowledge_retrieval.py# RAG with ChromaDB
│   │   ├── language_detector.py  # 8-language detection
│   │   ├── response_generator.py # Groq-powered responses
│   │   └── text_preprocessor.py  # Text cleaning
│   ├── utils/                    # Utilities
│   │   ├── conversation_manager.py# Session management
│   │   ├── analytics.py          # Usage tracking
│   │   └── document_processor.py # Document chunking
│   ├── scripts/                  # Setup scripts
│   │   ├── download_models.py    # Download ML models
│   │   ├── setup_knowledge_base.py# Index documents
│   │   └── expand_files_comprehensive.py# Knowledge expansion
│   ├── knowledge_base/           # 13 comprehensive guides (546 chunks)
│   │   ├── mudra_loans.txt       # 12.7 KB
│   │   ├── gst_registration.txt  # 22.2 KB
│   │   ├── udyam_registration.txt# 26.0 KB
│   │   ├── government_schemes.txt# 23.1 KB
│   │   ├── business_registration.txt# 20.8 KB
│   │   ├── licenses_permits.txt  # 17.9 KB
│   │   ├── tax_compliance.txt    # 17.2 KB
│   │   ├── employee_management.txt# 22.3 KB
│   │   ├── digital_marketing.txt # 25.3 KB
│   │   └── ... (+ 4 more files)
│   ├── chroma_db/                # Vector database
│   ├── conversations/            # Chat history
│   ├── feedback/                 # User feedback logs
│   ├── main.py                   # FastAPI app
│   ├── config.py                 # Configuration
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Environment variables
├── src/                          # React frontend
│   ├── components/               # UI components
│   │   ├── chat/                 # Chat interface
│   │   ├── home/                 # Landing page
│   │   ├── layout/               # Layout components
│   │   └── ui/                   # shadcn/ui components
│   ├── pages/                    # Page components
│   │   ├── Chat.tsx              # Main chat page
│   │   ├── Analytics.tsx         # Analytics dashboard
│   │   ├── Index.tsx             # Home page
│   │   └── ... (+ more pages)
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities
│   │   ├── api.ts                # API client
│   │   └── utils.ts              # Helper functions
│   └── App.tsx                   # Main app
├── public/                       # Static assets
├── README.md                     # This file
└── package.json                  # Node dependencies
```

## 🎯 Features Overview

### For Users
- ✅ **Instant Answers**: Get immediate responses to MSME queries
- ✅ **Voice Interaction**: Speak your questions, hear responses
- ✅ **Multi-Language**: Support for 8 Indian languages
- ✅ **Comprehensive Info**: Detailed guides with step-by-step instructions
- ✅ **Smart Suggestions**: AI-generated follow-up questions
- ✅ **Rich Media**: Links, buttons, and formatted responses
- ✅ **Session Memory**: Continuous conversation context

### For Developers
- ✅ **Modern Stack**: React + FastAPI + Groq
- ✅ **RAG Pipeline**: Semantic search with 546 document chunks
- ✅ **Intent Classification**: 90%+ accuracy with DistilBERT
- ✅ **Vector Database**: ChromaDB for fast retrieval
- ✅ **Analytics**: Built-in usage tracking
- ✅ **Extensible**: Easy to add new knowledge or features
- ✅ **Well Documented**: Comprehensive guides and comments

## 🔧 Configuration

### Backend Configuration (`backend/.env`)

```env
# API Settings
API_HOST=0.0.0.0
API_PORT=8000

# Groq API (Get free key: console.groq.com)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL_NAME=llama-3.3-70b-versatile
USE_GROQ=True
GROQ_MAX_TOKENS=2048

# RAG Settings (Optimized)
CHUNK_SIZE=1500
CHUNK_OVERLAP=300
TOP_K_RETRIEVAL=8
RETRIEVAL_CONFIDENCE_THRESHOLD=0.25

# Vector Database
CHROMA_PERSIST_DIRECTORY=./chroma_db
CHROMA_COLLECTION_NAME=msme_knowledge_base
```

### Available Groq Models

| Model | Speed | Context | Best For |
|-------|-------|---------|----------|
| `llama-3.3-70b-versatile` | Fast | 8K | General (Default) |
| `llama-3.1-8b-instant` | Fastest | 8K | Quick responses |
| `mixtral-8x7b-32768` | Medium | 32K | Long contexts |
| `gemma2-9b-it` | Fast | 8K | Lightweight |

## 📚 Knowledge Base

### Current Topics (546 Chunks)
1. **MUDRA Loans** - Complete guide to Shishu, Kishore, Tarun loans
2. **GST Registration** - Step-by-step registration process, compliance
3. **Udyam Registration** - MSME registration procedure
4. **Government Schemes** - PMEGP, Stand-Up India, CGTMSE, GeM Portal
5. **Business Registration** - Proprietorship, Partnership, LLP, Pvt Ltd
6. **Licenses & Permits** - All required licenses by sector
7. **Tax Compliance** - ITR filing, TDS, GST optimization
8. **Employee Management** - PF, ESIC, labor laws, compliance
9. **Digital Marketing** - SEO, social media, e-commerce platforms

### Adding New Knowledge

1. Add `.txt` file to `backend/knowledge_base/`
2. Run re-indexing:
```bash
cd backend
python scripts/setup_knowledge_base.py
# Enter 'yes' when prompted to re-index
```

## 🧪 Testing

### Test the Chatbot

Visit http://localhost:5173/chat and try:

- "How do I register for GST?"
- "What is MUDRA loan eligibility?"
- "Tell me about Udyam registration"
- "What are the tax compliance requirements?"
- "How to hire employees legally?"

### API Testing

Visit http://localhost:8000/docs for interactive API documentation.

## 🎨 Customization

### Change Theme Colors

Edit `src/index.css`:
```css
:root {
  --primary: 262.1 83.3% 57.8%;  /* Purple */
  --secondary: 220 14.3% 95.9%;  /* Light gray */
  /* ... more colors */
}
```

### Add New Intent

1. Edit `backend/config.py` - Add to `INTENT_LABELS`
2. Add response template in `backend/models/response_generator.py`
3. Restart backend

### Modify Knowledge Base

Edit files in `backend/knowledge_base/` and re-index.

## 📊 Analytics

Access analytics at: http://localhost:8080/analytics

**Metrics tracked:**
- Total conversations
- Total messages
- Active sessions
- Popular queries
- Language distribution
- Average confidence scores
- Response times

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request


## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Knowledge base errors
```bash
# Re-download models
python scripts/download_models.py

# Re-index knowledge base
python scripts/setup_knowledge_base.py
```

### Frontend build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy 'dist' folder
```

### Backend (Render/Railway/Fly.io)
- Set environment variables
- Use `python main.py` as start command
- Ensure Python 3.9+ runtime


## 🙏 Acknowledgments

- **Groq** for lightning-fast LLM inference
- **ChromaDB** for vector database
- **Hugging Face** for ML models
- **shadcn/ui** for beautiful components
- **Government of India** for MSME resources

## 📧 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/msme-mitra/issues)
- Email: support@example.com

---

**Made with ❤️ for Indian MSMEs**

⭐ Star this repo if you find it helpful!
