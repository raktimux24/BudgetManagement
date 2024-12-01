-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'renewal', 'budget', 'cancellation')),
  is_read BOOLEAN DEFAULT false,
  related_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user_id for faster queries
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

-- Create index for created_at for sorting
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to update their own notifications
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policy to allow the application to insert notifications for users
CREATE POLICY "Application can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
