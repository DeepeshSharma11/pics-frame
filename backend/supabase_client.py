import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://lulqemjkvsvnbdmqkhoh.supabase.co")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

def get_supabase_admin() -> Client:
    """Returns a Supabase client with admin/service role privileges."""
    if not SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE_KEY == "your_supabase_service_role_key_here":
        raise ValueError("SUPABASE_SERVICE_ROLE_KEY is not configured in backend/.env")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
