import { createClient } from '@supabase/supabase-js'

const URL = 'https://rorzllbqmmwgepuhrkbf.supabase.co';
const PUBLIC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcnpsbGJxbW13Z2VwdWhya2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEzNjk2ODIsImV4cCI6MjAzNjk0NTY4Mn0.0MQ00ZcdjF8eb-32Xx3b3TOPI7knzXE3PgYBxdp5v_I';

const supabase = createClient(URL, PUBLIC_KEY);
export default supabase;