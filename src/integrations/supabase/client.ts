import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qpfjtvqwjebmkxexvruf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwZmp0dnF3amVibWt4ZXh2cnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MDI5ODAsImV4cCI6MjA3NjQ3ODk4MH0.YpaQ726EwcTxMgWP5F0umCKCjlE-cbHhmxlkLx_ynjk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
