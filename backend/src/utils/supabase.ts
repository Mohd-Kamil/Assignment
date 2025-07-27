import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://otinzrlstwizaqdyhqjo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aW56cmxzdHdpemFxZHlocWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDE1ODIsImV4cCI6MjA2OTE3NzU4Mn0.1Hn43x6JkqkJJ2ldoj-9ga_aJ6ZUvuQxaZwHlEm2qEE'
); 