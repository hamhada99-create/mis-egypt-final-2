CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(20) NOT NULL UNIQUE,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  term_order INT NOT NULL,
  UNIQUE (academic_year_id, term_order)
);

CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(40) NOT NULL UNIQUE,
  name_ar VARCHAR(120) NOT NULL,
  stage VARCHAR(40) NOT NULL,
  grade_order INT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE,
  name_ar VARCHAR(160) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS grade_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  annual_periods INT,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE (academic_year_id, grade_id, subject_id)
);

CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  title_ar VARCHAR(220) NOT NULL,
  unit_order INT NOT NULL,
  UNIQUE (subject_id, grade_id, unit_order)
);

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title_ar VARCHAR(240) NOT NULL,
  lesson_order INT NOT NULL,
  explanation TEXT,
  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  interactive_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (unit_id, lesson_order)
);

CREATE TABLE IF NOT EXISTS lesson_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  source_type VARCHAR(40) NOT NULL,
  source_url TEXT,
  source_ref TEXT,
  rights_note TEXT
);

CREATE TABLE IF NOT EXISTS concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  name_ar VARCHAR(220) NOT NULL,
  mastery_target NUMERIC(5,2) NOT NULL DEFAULT 80
);

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  question_type VARCHAR(30) NOT NULL,
  prompt TEXT NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
  points NUMERIC(8,2) NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_order INT NOT NULL,
  label TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(question_id, option_order)
);

CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar VARCHAR(240) NOT NULL,
  exam_type VARCHAR(30) NOT NULL,
  grade_id UUID REFERENCES grades(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  duration_seconds INT NOT NULL DEFAULT 1800,
  question_count INT NOT NULL DEFAULT 10,
  shuffle_questions BOOLEAN NOT NULL DEFAULT true,
  shuffle_options BOOLEAN NOT NULL DEFAULT true,
  pass_percentage NUMERIC(5,2) NOT NULL DEFAULT 60,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exam_questions (
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  PRIMARY KEY(exam_id, question_id)
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(180) NOT NULL,
  email VARCHAR(320) UNIQUE,
  role VARCHAR(30) NOT NULL CHECK (role IN ('student','parent','teacher','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  score NUMERIC(8,2),
  percentage NUMERIC(5,2),
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress'
);

CREATE TABLE IF NOT EXISTS attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer JSONB,
  is_correct BOOLEAN,
  points_awarded NUMERIC(8,2) NOT NULL DEFAULT 0,
  UNIQUE(attempt_id, question_id)
);

CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  best_score NUMERIC(8,2),
  xp INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_lesson ON questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
-- MIS-EGYPT v1.3 — Student Intelligence & Analytics
CREATE INDEX IF NOT EXISTS idx_progress_user_subject ON student_progress(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_exam_submitted ON attempts(user_id, exam_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_question_correct ON attempt_answers(question_id, is_correct);

CREATE OR REPLACE VIEW student_subject_analytics AS
SELECT
  sp.user_id,
  sp.subject_id,
  s.name_ar AS subject_name,
  COALESCE(ROUND(AVG(sp.completion_percentage)::numeric,0),0) AS progress_percent,
  COALESCE(ROUND(AVG(a.percentage)::numeric,0),0) AS average_percentage,
  COUNT(a.id) FILTER (WHERE a.submitted_at IS NOT NULL) AS attempts
FROM student_progress sp
JOIN subjects s ON s.id = sp.subject_id
LEFT JOIN attempts a ON a.user_id = sp.user_id
GROUP BY sp.user_id, sp.subject_id, s.name_ar;
-- MIS-EGYPT v1.4 — Adaptive Learning Engine
CREATE TABLE IF NOT EXISTS student_concept_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  mastery_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  attempts INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  last_score NUMERIC(5,2),
  last_attempt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, concept_id)
);

CREATE TABLE IF NOT EXISTS adaptive_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept_id UUID REFERENCES concepts(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  recommendation_type VARCHAR(30) NOT NULL,
  priority INT NOT NULL DEFAULT 50,
  title_ar TEXT NOT NULL,
  reason_ar TEXT NOT NULL,
  action_url TEXT NOT NULL DEFAULT '/learning',
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mastery_user_percent ON student_concept_mastery(user_id, mastery_percent);
CREATE INDEX IF NOT EXISTS idx_mastery_concept ON student_concept_mastery(concept_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_user_status ON adaptive_recommendations(user_id, status, priority DESC);

CREATE OR REPLACE VIEW student_weak_concepts AS
SELECT scm.user_id, scm.concept_id, c.lesson_id, c.name_ar AS concept_name,
       scm.mastery_percent, scm.attempts, scm.correct_answers, scm.last_attempt_at
FROM student_concept_mastery scm
JOIN concepts c ON c.id = scm.concept_id
WHERE scm.mastery_percent < c.mastery_target;

-- Final hardening: integrity, indexes and safe exam reads
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_order ON exam_questions(exam_id, question_order);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
