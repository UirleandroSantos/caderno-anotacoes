import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jitvjqjamovdkkdsjzxs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppdHZqcWphbW92ZGtrZHNqenhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDQ4MDAsImV4cCI6MjA5MTA4MDgwMH0.UEI0Y6bTvVoKXwTPclT22WVY7_hmHKp6BSzxyhv0qjA";

export const supabase = createClient(supabaseUrl, supabaseKey);