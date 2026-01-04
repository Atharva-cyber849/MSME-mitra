
# MSME Business Support Chatbot

An intelligent chatbot for Micro, Small, and Medium Enterprises (MSMEs) powered by ML/AI to provide instant support for:
- Government schemes & subsidies
- Loan information (MUDRA, PMEGP, etc.)
- GST & compliance guidance
- Udyam registration
- Licensing & permits

## Architecture

The application consists of:
- **Frontend**: React + TypeScript + Vite + shadcn/ui
- **Backend**: Python FastAPI with ML/AI pipeline
  - Intent Classification (DistilBERT)
  - Knowledge Retrieval (RAG with ChromaDB)
  - Language Detection (8 Indian languages)
  - Response Generation

## Quick Start

### Frontend Setup

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run at: http://localhost:5173

### Backend Setup

```sh
# Navigate to backend
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Download ML models (~500MB)
python scripts/download_models.py

# Initialize knowledge base
python scripts/setup_knowledge_base.py

# Start backend server
python main.py
```

The backend API will run at: http://localhost:8000

**API Documentation**: http://localhost:8000/docs

### Running Both Together

Terminal 1 (Backend):
```sh
cd backend
python main.py
```

Terminal 2 (Frontend):
```sh
npm run dev
```

Then visit http://localhost:5173/chat

## Project Structure

```
msme-mitra/
├── backend/                 # Python ML/AI backend
│   ├── models/             # ML models (intent, retrieval, etc.)
│   ├── utils/              # Utilities (document processing)
│   ├── scripts/            # Setup scripts
│   ├── knowledge_base/     # MSME documents (PDFs, TXT)
│   ├── main.py            # FastAPI application
│   └── config.py          # Configuration
├── src/                    # React frontend
│   ├── components/        # UI components
│   ├── pages/            # Page components
│   ├── lib/              # Utilities & API client
│   └── App.tsx           # Main app
└── public/               # Static assets
```

## Features

### ML/AI Pipeline

1. **Language Detection**: Automatically detects user's language (English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada)
2. **Text Preprocessing**: Cleans and normalizes user input
3. **Intent Classification**: Uses DistilBERT to classify user intent with 85%+ accuracy
4. **Knowledge Retrieval**: RAG system retrieves relevant information from vector database
5. **Response Generation**: Combines templates and retrieved knowledge for accurate responses
6. **Confidence Scoring**: Falls back to helpline for low-confidence queries

### Frontend Features

- Modern, animated chat interface
- Quick action buttons for common queries
- Language selector
- Confidence score display
- Offline fallback mode
- Responsive design

## How can I edit this code?



If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
