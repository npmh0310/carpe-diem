-- Projects table (phù hợp với interface Project hiện tại)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  src TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  film_name TEXT NOT NULL,
  camera TEXT NOT NULL,
  location TEXT NOT NULL,
  photographer TEXT NOT NULL,
  lab TEXT NOT NULL,
  frames_count INTEGER,
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - tùy chọn bảo mật
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc public (ai cũng xem được)
CREATE POLICY "Allow public read" ON projects
  FOR SELECT USING (true);

-- Cho phép insert/update khi có anon key (có thể đổi sang auth sau)
CREATE POLICY "Allow insert with anon" ON projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update with anon" ON projects
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete with anon" ON projects
  FOR DELETE USING (true);

-- Storage bucket cho ảnh project
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Cho phép public upload & read
CREATE POLICY "Allow public upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Allow public read images" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');
