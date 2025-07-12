-- DevBattle.gg Database Schema
-- Execute these commands in Supabase SQL Editor

-- 1. PROBLEMS TABLE
CREATE TABLE IF NOT EXISTS problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
    test_cases JSONB NOT NULL, -- Array of test cases with input/output
    starter_code JSONB, -- { "javascript": "function solution() {...}", "python": "def solution():" }
    solution_code JSONB, -- Reference solutions for each language
    tags VARCHAR(50)[],
    time_limit INTEGER DEFAULT 30, -- Time limit in seconds
    memory_limit INTEGER DEFAULT 128, -- Memory limit in MB
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BATTLES TABLE  
CREATE TABLE IF NOT EXISTS battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES problems(id) NOT NULL,
    player1_id UUID REFERENCES profiles(id) NOT NULL,
    player2_id UUID REFERENCES profiles(id),
    player1_code TEXT,
    player2_code TEXT,
    player1_language VARCHAR(20),
    player2_language VARCHAR(20),
    player1_submitted_at TIMESTAMP WITH TIME ZONE,
    player2_submitted_at TIMESTAMP WITH TIME ZONE,
    player1_test_results JSONB, -- Test results for player 1
    player2_test_results JSONB, -- Test results for player 2
    winner_id UUID REFERENCES profiles(id),
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled', 'expired')),
    battle_mode VARCHAR(20) DEFAULT 'classic' CHECK (battle_mode IN ('classic', 'speed', 'debug')),
    max_duration INTEGER DEFAULT 900, -- Max battle duration in seconds (15 min)
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER DEFAULT 64,
    current_participants INTEGER DEFAULT 0,
    entry_fee INTEGER DEFAULT 0, -- Entry fee in credits/points
    prize_pool INTEGER DEFAULT 0,
    tournament_type VARCHAR(20) DEFAULT 'single_elimination' CHECK (tournament_type IN ('single_elimination', 'double_elimination', 'round_robin')),
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled')),
    bracket_data JSONB, -- Tournament bracket structure
    rules JSONB, -- Tournament specific rules
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TOURNAMENT_PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS tournament_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    seed INTEGER, -- Tournament seeding
    current_round INTEGER DEFAULT 1,
    is_eliminated BOOLEAN DEFAULT false,
    final_ranking INTEGER,
    UNIQUE(tournament_id, participant_id)
);

-- 5. BATTLE_SPECTATORS TABLE (for live viewing)
CREATE TABLE IF NOT EXISTS battle_spectators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
    spectator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(battle_id, spectator_id)
);

-- 6. USER_ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL, -- 'first_win', 'win_streak_5', 'language_master', etc.
    achievement_data JSONB, -- Additional achievement metadata
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

-- 7. BATTLE_MESSAGES TABLE (for battle chat)
CREATE TABLE IF NOT EXISTS battle_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'chat' CHECK (message_type IN ('chat', 'system', 'code_share')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. UPDATE PROFILES TABLE (add missing columns)
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='location') THEN
        ALTER TABLE profiles ADD COLUMN location VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='twitter_url') THEN
        ALTER TABLE profiles ADD COLUMN twitter_url VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='github_url') THEN
        ALTER TABLE profiles ADD COLUMN github_url VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='website') THEN
        ALTER TABLE profiles ADD COLUMN website VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_active') THEN
        ALTER TABLE profiles ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='win_rate') THEN
        ALTER TABLE profiles ADD COLUMN win_rate DECIMAL(5,2) DEFAULT 0.0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='rank') THEN
        ALTER TABLE profiles ADD COLUMN rank INTEGER DEFAULT 1000;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='badge') THEN
        ALTER TABLE profiles ADD COLUMN badge VARCHAR(50) DEFAULT 'Coder';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='preferred_languages') THEN
        ALTER TABLE profiles ADD COLUMN preferred_languages VARCHAR(50)[] DEFAULT '{}';
    END IF;
END $$;

-- 9. CREATE INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status);
CREATE INDEX IF NOT EXISTS idx_battles_players ON battles(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_battles_created_at ON battles(created_at);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_active ON problems(is_active);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_profiles_rank ON profiles(rank);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp);

-- 10. CREATE FUNCTIONS for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. ENABLE ROW LEVEL SECURITY
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_spectators ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_messages ENABLE ROW LEVEL SECURITY;

-- 12. CREATE POLICIES

-- Problems: Public read, authenticated users can create
CREATE POLICY "Anyone can read active problems" ON problems
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create problems" ON problems
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Battles: Participants can read/update their battles
CREATE POLICY "Users can read their own battles" ON battles
    FOR SELECT USING (
        auth.uid() = player1_id OR 
        auth.uid() = player2_id OR
        EXISTS (SELECT 1 FROM battle_spectators WHERE battle_id = battles.id AND spectator_id = auth.uid())
    );

CREATE POLICY "Users can create battles" ON battles
    FOR INSERT WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Players can update their battles" ON battles
    FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Battle messages: Participants can read/create
CREATE POLICY "Battle participants can read messages" ON battle_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM battles 
            WHERE battles.id = battle_messages.battle_id 
            AND (battles.player1_id = auth.uid() OR battles.player2_id = auth.uid())
        )
    );

CREATE POLICY "Battle participants can send messages" ON battle_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM battles 
            WHERE battles.id = battle_messages.battle_id 
            AND (battles.player1_id = auth.uid() OR battles.player2_id = auth.uid())
        )
    );

-- 13. INSERT SAMPLE DATA

-- Sample problems
INSERT INTO problems (title, description, difficulty, test_cases, starter_code, tags) VALUES
(
    'Two Sum',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    'easy',
    '[
        {"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]},
        {"input": {"nums": [3,2,4], "target": 6}, "output": [1,2]},
        {"input": {"nums": [3,3], "target": 6}, "output": [0,1]}
    ]'::jsonb,
    '{
        "javascript": "function twoSum(nums, target) {\n    // Your code here\n}",
        "python": "def two_sum(nums, target):\n    # Your code here\n    pass"
    }'::jsonb,
    ARRAY['array', 'hash-table', 'easy']
),
(
    'Reverse String',
    'Write a function that reverses a string. The input string is given as an array of characters s.',
    'easy', 
    '[
        {"input": {"s": ["h","e","l","l","o"]}, "output": ["o","l","l","e","h"]},
        {"input": {"s": ["H","a","n","n","a","h"]}, "output": ["h","a","n","n","a","H"]}
    ]'::jsonb,
    '{
        "javascript": "function reverseString(s) {\n    // Your code here\n}",
        "python": "def reverse_string(s):\n    # Your code here\n    pass"
    }'::jsonb,
    ARRAY['string', 'two-pointers', 'easy']
);

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE battles;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_spectators;