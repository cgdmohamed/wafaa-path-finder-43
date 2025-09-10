-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to active events
CREATE POLICY "Anyone can view active events" ON events
FOR SELECT 
USING (is_active = true);