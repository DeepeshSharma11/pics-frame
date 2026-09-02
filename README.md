# Pics Frame — Personalized Romantic Keepsake WebApp

A full-stack, interactive digital memory gift web application. Built with Next.js, FastAPI, Cloudinary, Supabase, and powered by Groq AI (`qwen/qwen3.8-27b`) for AI-powered love letter writing, text enhancement, and photo storytelling.

---

## Key Features

- **3-Step Instant Gift Wizard**: Upload 4–5 photos and assemble a custom digital keepsake in seconds.
- **AI Letter Writer & Enhancer**: Powered by Groq Qwen (`qwen/qwen3.8-27b`) to write deeply personal love letters, polish draft notes, and suggest romantic story chapters based on your memories and milestones.
- **Auto-Captions & Story Chapters**: AI-generated chapter titles, captions, and romantic location tags for every photo.
- **Interactive 3D Polaroids & Storybook**: Smooth tilt physics, flip animations, and memory cards.
- **Romantic Audio Synthesizer**: Web Audio API ambient soundtrack generator (Romantic Piano, Warm Lo-Fi, Stardust Music Box).
- **Real-Time Days Counter**: Live counter tracking every day, hour, minute, and second spent together.
- **Cloudinary & Supabase Sync**: Automatic image optimization, compressed storage, and shareable encoded gift links.

---

## Architecture & Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack, TypeScript, Vanilla CSS design tokens)
- **Backend**: FastAPI (Python 3.10+, Pydantic, HTTPX)
- **AI Engine**: Groq Cloud API (`qwen/qwen3.8-27b`)
- **Storage & Media**: Cloudinary, Supabase
- **Deployment**: Docker, Vercel, Render / Railway

---

## Environment Variables

### Backend (`backend/.env`)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=qwen/qwen3.8-27b
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=pics_frame_preset
```

---

## Local Development Setup

### 1. Backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## Deployment Options

### Docker Compose (Full Stack)
```bash
docker compose up --build -d
```

### Frontend on Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Add environment variables and click **Deploy**.

---

## Author & License

- **Engineered by**: [Deepesh Sharma](https://focitech.in) (CTO & Co-Founder, FociTech)
- **License**: MIT
