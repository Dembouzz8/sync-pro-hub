import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://glvxmnqsuknvzjmcyxoy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdnhtbnFzdWtudnpqbWN5eG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODUzMDAsImV4cCI6MjA5MTI2MTMwMH0.X509MJBefRWtDk1Y4RAhdvaoFdo60XkFSlnGk_qxiC8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
