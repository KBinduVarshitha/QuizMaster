/*
  # Online Quiz Application Database Schema

  1. New Tables
    - `quizzes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `duration_minutes` (integer)
      - `total_questions` (integer)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `is_active` (boolean)
    
    - `questions`
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, references quizzes)
      - `question_text` (text)
      - `option_a` (text)
      - `option_b` (text)
      - `option_c` (text)
      - `option_d` (text)
      - `correct_answer` (text)
      - `question_order` (integer)
      - `created_at` (timestamp)
    
    - `user_quiz_attempts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `quiz_id` (uuid, references quizzes)
      - `score` (integer)
      - `total_questions` (integer)
      - `time_taken_seconds` (integer)
      - `answers` (jsonb)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Restrict quiz creation to authenticated users
    - Users can only view their own attempts
*/

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration_minutes integer DEFAULT 30,
  total_questions integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  question_order integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create user quiz attempts table
CREATE TABLE IF NOT EXISTS user_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  time_taken_seconds integer DEFAULT 0,
  answers jsonb DEFAULT '{}',
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for quizzes
CREATE POLICY "Anyone can view active quizzes"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can create quizzes"
  ON quizzes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own quizzes"
  ON quizzes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policies for questions
CREATE POLICY "Anyone can view questions for active quizzes"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = questions.quiz_id 
      AND quizzes.is_active = true
    )
  );

CREATE POLICY "Quiz creators can manage questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes 
      WHERE quizzes.id = questions.quiz_id 
      AND quizzes.created_by = auth.uid()
    )
  );

-- Policies for user quiz attempts
CREATE POLICY "Users can view their own attempts"
  ON user_quiz_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
  ON user_quiz_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert sample data
INSERT INTO quizzes (title, description, duration_minutes, total_questions, created_by, is_active) VALUES
  ('JavaScript Fundamentals', 'Test your knowledge of JavaScript basics', 20, 5, (SELECT id FROM auth.users LIMIT 1), true),
  ('React Concepts', 'Understanding React components and hooks', 25, 5, (SELECT id FROM auth.users LIMIT 1), true),
  ('Web Development', 'HTML, CSS, and JavaScript essentials', 30, 5, (SELECT id FROM auth.users LIMIT 1), true);

-- Insert sample questions for JavaScript Fundamentals quiz
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'What is the correct way to declare a variable in JavaScript?', 'var myVar;', 'variable myVar;', 'v myVar;', 'declare myVar;', 'A', 1),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'Which of the following is NOT a JavaScript data type?', 'string', 'boolean', 'float', 'undefined', 'C', 2),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'What does "=== " operator do in JavaScript?', 'Assignment', 'Comparison with type coercion', 'Strict equality comparison', 'Not equal', 'C', 3),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'Which method is used to add an element to the end of an array?', 'push()', 'pop()', 'shift()', 'unshift()', 'A', 4),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'What is the correct way to create a function in JavaScript?', 'function = myFunction() {}', 'function myFunction() {}', 'create myFunction() {}', 'def myFunction() {}', 'B', 5);

-- Insert sample questions for React Concepts quiz
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
  ((SELECT id FROM quizzes WHERE title = 'React Concepts' LIMIT 1), 'What is JSX?', 'A JavaScript library', 'A syntax extension for JavaScript', 'A database', 'A CSS framework', 'B', 1),
  ((SELECT id FROM quizzes WHERE title = 'React Concepts' LIMIT 1), 'Which hook is used to manage state in functional components?', 'useEffect', 'useState', 'useContext', 'useReducer', 'B', 2),
  ((SELECT id FROM quizzes WHERE title = 'React Concepts' LIMIT 1), 'What is the purpose of useEffect hook?', 'To create state variables', 'To handle side effects', 'To create components', 'To manage props', 'B', 3),
  ((SELECT id FROM quizzes WHERE title = 'React Concepts' LIMIT 1), 'How do you pass data from parent to child component?', 'Using state', 'Using props', 'Using context', 'Using refs', 'B', 4),
  ((SELECT id FROM quizzes WHERE title = 'React Concepts' LIMIT 1), 'What is the Virtual DOM?', 'A real DOM element', 'A JavaScript representation of the DOM', 'A CSS selector', 'A database', 'B', 5);

-- Insert sample questions for Web Development quiz
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
  ((SELECT id FROM quizzes WHERE title = 'Web Development' LIMIT 1), 'What does HTML stand for?', 'Hypertext Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'Hypermedia Markup Language', 'A', 1),
  ((SELECT id FROM quizzes WHERE title = 'Web Development' LIMIT 1), 'Which CSS property is used to change the text color?', 'color', 'text-color', 'font-color', 'text-style', 'A', 2),
  ((SELECT id FROM quizzes WHERE title = 'Web Development' LIMIT 1), 'What is the purpose of the DOCTYPE declaration?', 'To define the document type', 'To include external files', 'To create comments', 'To set the page title', 'A', 3),
  ((SELECT id FROM quizzes WHERE title = 'Web Development' LIMIT 1), 'Which HTML tag is used to create a hyperlink?', '<link>', '<a>', '<href>', '<url>', 'B', 4),
  ((SELECT id FROM quizzes WHERE title = 'Web Development' LIMIT 1), 'What does CSS stand for?', 'Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets', 'B', 5);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'What is the correct way to declare a variable in JavaScript?', 'var myVar;', 'variable myVar;', 'v myVar;', 'declare myVar;', 'A', 1),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'Which of the following is NOT a JavaScript data type?', 'string', 'boolean', 'float', 'undefined', 'C', 2),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'What does "=== " operator do in JavaScript?', 'Assignment', 'Comparison with type coercion', 'Strict equality comparison', 'Not equal', 'C', 3),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'Which method is used to add an element to the end of an array?', 'push()', 'pop()', 'shift()', 'unshift()', 'A', 4),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'What is the correct way to create a function in JavaScript?', 'function = myFunction() {}', 'function myFunction() {}', 'create myFunction() {}', 'def myFunction() {}', 'B', 5);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'What is the correct way to declare a variable in JavaScript?', 'var myVar;', 'variable myVar;', 'v myVar;', 'declare myVar;', 'A', 1),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'Which of the following is NOT a JavaScript data type?', 'string', 'boolean', 'float', 'undefined', 'C', 2),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'What does "=== " operator do in JavaScript?', 'Assignment', 'Comparison with type coercion', 'Strict equality comparison', 'Not equal', 'C', 3),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'Which method is used to add an element to the end of an array?', 'push()', 'pop()', 'shift()', 'unshift()', 'A', 4),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'What is the correct way to create a function in JavaScript?', 'function = myFunction() {}', 'function myFunction() {}', 'create myFunction() {}', 'def myFunction() {}', 'B', 5);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'What is the correct way to declare a variable in JavaScript?', 'var myVar;', 'variable myVar;', 'v myVar;', 'declare myVar;', 'A', 1),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'Which of the following is NOT a JavaScript data type?', 'string', 'boolean', 'float', 'undefined', 'C', 2),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'What does "=== " operator do in JavaScript?', 'Assignment', 'Comparison with type coercion', 'Strict equality comparison', 'Not equal', 'C', 3),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'Which method is used to add an element to the end of an array?', 'push()', 'pop()', 'shift()', 'unshift()', 'A', 4),
  ((SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' LIMIT 1), 'What is the correct way to create a function in JavaScript?', 'function = myFunction() {}', 'function myFunction() {}', 'create myFunction() {}', 'def myFunction() {}', 'B', 5);

-- Update total_questions count for each quiz
UPDATE quizzes SET total_questions = (
  SELECT COUNT(*) FROM questions WHERE questions.quiz_id = quizzes.id
);