import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://udggvxiffggzeyhifuit.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZ2d2eGlmZmdnemV5aGlmdWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODg4ODgsImV4cCI6MjA4OTY2NDg4OH0.73NUkiITD9uD0EmOaOmADvVpgCEgK8c-Qm292MhQAK0git";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
