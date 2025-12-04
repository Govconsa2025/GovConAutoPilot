import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://femtgbdxvyynvsuggqsh.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNlZmQ3ODNjLTA1N2EtNDg1ZC04ZGY0LTMzMTU3ZDEwYmE5OSJ9.eyJwcm9qZWN0SWQiOiJmZW10Z2JkeHZ5eW52c3VnZ3FzaCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY0MzEwMzc1LCJleHAiOjIwNzk2NzAzNzUsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.G7GWuio62iY9l-i7ICM5pOXsJS3Y5EPcw4dTUocrfMg';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };