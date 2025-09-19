-- Add Votes Table and Update Issues Table for Voting and Location Features

-- Create votes table to track individual user votes on issues
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one vote per user per issue
  UNIQUE(issue_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_votes_issue_id ON votes(issue_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_issue_user ON votes(issue_id, user_id);

-- Add location index for proximity searches
CREATE INDEX IF NOT EXISTS idx_issues_location ON issues USING gist (point(longitude, latitude));

-- Add RLS policies for votes table
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow users to view all votes
CREATE POLICY "Users can view all votes" ON votes FOR SELECT USING (true);

-- Allow authenticated users to insert their own votes
CREATE POLICY "Users can insert their own votes" ON votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own votes
CREATE POLICY "Users can update their own votes" ON votes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own votes
CREATE POLICY "Users can delete their own votes" ON votes FOR DELETE
USING (auth.uid() = user_id);

-- Function to update vote count when votes are added/removed
CREATE OR REPLACE FUNCTION update_issue_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment vote count based on vote type
    UPDATE issues
    SET vote_count = COALESCE(vote_count, 0) + CASE WHEN NEW.vote_type = 'upvote' THEN 1 ELSE -1 END,
        updated_at = NOW()
    WHERE id = NEW.issue_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement vote count based on vote type
    UPDATE issues
    SET vote_count = COALESCE(vote_count, 0) + CASE WHEN OLD.vote_type = 'upvote' THEN -1 ELSE 1 END,
        updated_at = NOW()
    WHERE id = OLD.issue_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote type changes
    IF OLD.vote_type != NEW.vote_type THEN
      UPDATE issues
      SET vote_count = COALESCE(vote_count, 0) +
                       CASE WHEN NEW.vote_type = 'upvote' THEN 2 ELSE -2 END,
          updated_at = NOW()
      WHERE id = NEW.issue_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update vote counts
DROP TRIGGER IF EXISTS trigger_update_vote_count ON votes;
CREATE TRIGGER trigger_update_vote_count
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_issue_vote_count();

-- Function to calculate distance between two points (in kilometers)
CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
DECLARE
  dlat float;
  dlon float;
  a float;
  c float;
  earth_radius float := 6371; -- Earth's radius in kilometers
BEGIN
  -- Convert degrees to radians
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);

  -- Haversine formula
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1-a));

  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;