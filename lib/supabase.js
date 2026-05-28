import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ekiaspquipgkzzjeegwv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraWFzcHF1aXBna3p6amVlZ3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzE2MDAsImV4cCI6MjA2MzgwNzYwMH0.placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);
