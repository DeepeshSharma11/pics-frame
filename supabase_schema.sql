-- ==============================================================================
-- Pics Frame — Database Schema & Policies (Supabase / PostgreSQL)
-- Engineered by Deepesh Sharma (CTO & Co-Founder, FociTech)
-- ==============================================================================

-- 1. Create galleries table
CREATE TABLE IF NOT EXISTS public.galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE,
    recipient_name TEXT NOT NULL DEFAULT 'My Love',
    sender_name TEXT NOT NULL DEFAULT 'Yours Always',
    anniversary_date TEXT NOT NULL DEFAULT '2023-02-14',
    title TEXT NOT NULL DEFAULT 'Our Eternal Journey',
    letter TEXT NOT NULL DEFAULT 'From the very first moment we met, every memory with you has been my favorite chapter.',
    music_theme TEXT DEFAULT 'romantic_piano',
    photos JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index on slug and created_at for fast queries
CREATE INDEX IF NOT EXISTS idx_galleries_slug ON public.galleries(slug);
CREATE INDEX IF NOT EXISTS idx_galleries_created_at ON public.galleries(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

-- 4. Public Read Policy (Anyone with the link can view the gift)
DROP POLICY IF EXISTS "Allow public read access" ON public.galleries;
CREATE POLICY "Allow public read access"
    ON public.galleries
    FOR SELECT
    USING (true);

-- 5. Public Insert Policy (Anyone can create a new gift)
DROP POLICY IF EXISTS "Allow public insert" ON public.galleries;
CREATE POLICY "Allow public insert"
    ON public.galleries
    FOR INSERT
    WITH CHECK (true);

-- 6. Public Update Policy
DROP POLICY IF EXISTS "Allow public update" ON public.galleries;
CREATE POLICY "Allow public update"
    ON public.galleries
    FOR UPDATE
    USING (true);

-- 7. Insert Default Demo Data
INSERT INTO public.galleries (
    slug,
    recipient_name,
    sender_name,
    anniversary_date,
    title,
    letter,
    music_theme,
    photos
) VALUES (
    'demo',
    'My Love',
    'Yours Always',
    '2023-02-14',
    'Our Eternal Journey',
    'From the very first moment we met to every quiet laugh we share, every memory with you is my favorite chapter. Thank you for making every day magical.',
    'romantic_piano',
    '[
        {
            "id": "1",
            "url": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
            "caption": "Where our story began - our first magical walk",
            "date": "Chapter 1",
            "location": "Sunset Boulevard",
            "rotation": -3
        },
        {
            "id": "2",
            "url": "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&auto=format&fit=crop&q=80",
            "caption": "Your laugh that made my whole world stop",
            "date": "Chapter 2",
            "location": "Coffee & Rainy Days",
            "rotation": 4
        },
        {
            "id": "3",
            "url": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80",
            "caption": "Holding hands beneath a thousand city lights",
            "date": "Chapter 3",
            "location": "City Skyline",
            "rotation": -2
        },
        {
            "id": "4",
            "url": "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&auto=format&fit=crop&q=80",
            "caption": "Golden hour smiles & sweet whispers",
            "date": "Chapter 4",
            "location": "Beachside Vista",
            "rotation": 3
        },
        {
            "id": "5",
            "url": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop&q=80",
            "caption": "To forever and all our unwritten adventures",
            "date": "Chapter 5",
            "location": "Into Tomorrow",
            "rotation": -4
        }
    ]'::JSONB
) ON CONFLICT (slug) DO NOTHING;
