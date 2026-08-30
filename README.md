# Pics Frame — Personalized Memory WebApp

An interactive, romantic gift web application built with Next.js, FastAPI, Cloudinary, and Supabase. Users can upload 4–5 photos and instantly generate a 3D keepsake featuring floating polaroids, a storybook album, real-time relationship counter, ambient soundtrack, and a wax-sealed love letter.

---

## Author & Creator

- **Author**: **Deepesh Sharma**
- **Role**: **CTO & Co-Founder**, [FociTech](https://focitech.in)
- **License**: MIT (Copyright &copy; 2026 Deepesh Sharma / FociTech)

---

## Deployment Options

### Option 1: Deploy with Docker & Docker Compose (Full Stack)

1. Ensure Docker and Docker Compose are installed.
2. Clone the repository and configure your environment variables in `.env`.
3. Run:
   ```bash
   docker compose up --build -d
   ```
4. Access the services:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:8000`

---

### Option 2: Deploy Frontend on Vercel

1. Push your repository to GitHub (all `.env` files are automatically protected by `.gitignore`).
2. Log in to [Vercel Dashboard](https://vercel.com).
3. Click **"Add New" &rarr; "Project"** and import the repository.
4. Set the **Root Directory** to `frontend`.
5. Add your Environment Variables securely in Vercel settings:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your_anon_key`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: `your_cloud_name`
   - `BACKEND_INTERNAL_URL`: `https://your-backend-domain.com` (if backend is hosted externally)
6. Click **Deploy**.

---

### Option 3: Deploy Backend on Render / Railway / Fly.io

Use the included [backend/Dockerfile](backend/Dockerfile) to deploy the FastAPI container:
- Build command: `docker build -t pics-frame-backend backend/`
- Set port to `8000`.

---

## Environment Variables Template

### Backend (`backend/.env`)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Cloudinary Configuration
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_frontend_supabase_public_key_here

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=pics_frame_preset
```

---

## Local Development

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

Open [http://localhost:3000](http://localhost:3000) in your browser.
