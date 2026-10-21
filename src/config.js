// ================= Supabase config =================
// The anon key is a public client key and is meant to ship in the page. It grants
// nothing on its own: every table is guarded by row-level security, so a request
// only ever reaches the signed-in user's own rows. Never put the service_role key
// here — that one bypasses RLS.
const SUPABASE_URL = 'https://kuqrfsotqfvimsqwekos.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cXJmc290cWZ2aW1zcXdla29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MTA0MzIsImV4cCI6MjEwODE4NjQzMn0.KACNICL9b8SmpgDAo1IP8tML9hJKWx89u1sqW7Ifb-4';
