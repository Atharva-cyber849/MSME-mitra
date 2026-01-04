# Quick Setup Guide - MSME Chatbot

## Prerequisites Installation

### 1. Install Python

**Windows**:
1. Download Python 3.9+ from https://www.python.org/downloads/
2. **IMPORTANT**: Check "Add Python to PATH" during installation
3. Verify installation:
   ```bash
   python --version
   ```

**Alternative**: Install via Microsoft Store (search "Python 3.11")

### 2. Install Node.js (Already Installed ✓)

You already have Node.js since the frontend is set up.

---

## Backend Setup (First Time)

Open PowerShell in the project directory:

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies (this will take 5-10 minutes)
pip install -r requirements.txt

# Download ML models (~500MB, takes 5-10 minutes)
python scripts\download_models.py

# Initialize knowledge base (creates sample documents)
python scripts\setup_knowledge_base.py
# Type 'yes' when prompted

# Start the backend server
python main.py
```

The backend will run at: **http://localhost:8000**

Keep this terminal open!

---

## Frontend Setup (New Terminal)

Open a NEW PowerShell window:

```powershell
# Make sure you're in the project root
cd "C:\Users\admin\OneDrive\Desktop\New folder\msme-mitra"

# Start frontend (already configured)
npm run dev
```

The frontend will run at: **http://localhost:5173**

---

## Testing the Chatbot

1. Open browser: http://localhost:5173/chat
2. Try these queries:
   - "Tell me about MUDRA loans"
   - "How to register for GST?"
   - "What is Udyam registration?"
   - "Government schemes for MSMEs"

You should see:
- Intent classification working
- Confidence scores displayed
- Relevant information from knowledge base
- Sources cited

---

## Troubleshooting

### Python not found
- Reinstall Python with "Add to PATH" checked
- Or add Python manually to PATH
- Restart PowerShell after installation

### pip install fails
- Make sure virtual environment is activated (you should see `(venv)` in prompt)
- Try: `python -m pip install --upgrade pip`
- Then retry: `pip install -r requirements.txt`

### Models download fails
- Check internet connection
- Models are large (~500MB), be patient
- If it fails, delete `models_cache/` and retry

### Backend won't start
- Make sure virtual environment is activated
- Check if models are downloaded: `ls models_cache`
- Check if knowledge base is set up: `ls chroma_db`

### Frontend can't connect to backend
- Verify backend is running at http://localhost:8000
- Check `.env` file has `VITE_API_URL=http://localhost:8000`
- Restart frontend: `npm run dev`

---

## Daily Usage (After Initial Setup)

### Start Backend
```powershell
cd backend
.\venv\Scripts\activate
python main.py
```

### Start Frontend (new terminal)
```powershell
npm run dev
```

---

## API Documentation

Once backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

---

## Adding Custom Documents

1. Place PDF/TXT files in `backend/knowledge_base/`
2. Run: `python scripts/setup_knowledge_base.py`
3. Type 'yes' to re-index
4. Restart backend

---

## Project Structure

```
msme-mitra/
├── backend/              # Python ML/AI backend
│   ├── models/          # ML components
│   ├── scripts/         # Setup scripts
│   ├── knowledge_base/  # MSME documents
│   └── main.py         # API server
├── src/                 # React frontend
└── .env                # Configuration
```

---

## Next Steps

1. **Install Python** (if not already installed)
2. **Run backend setup** (one-time, ~15 minutes)
3. **Start both servers**
4. **Test the chatbot**
5. **Add your own MSME documents** (optional)

For detailed documentation, see:
- [Backend README](file:///c:/Users/admin/OneDrive/Desktop/New%20folder/msme-mitra/backend/README.md)
- [Main README](file:///c:/Users/admin/OneDrive/Desktop/New%20folder/msme-mitra/README.md)
- [Implementation Walkthrough](file:///C:/Users/admin/.gemini/antigravity/brain/41f0d170-4ac3-47e5-9c82-f792441a5048/walkthrough.md)
