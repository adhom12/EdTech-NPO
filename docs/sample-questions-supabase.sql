-- ============================================================
-- SAMPLE DATA — 10 Questions across 3 Topics
-- Topics: Pythagoras' Theorem, Solving Quadratic Equations, Probability
-- Syllabus: Edexcel GCSE
-- ============================================================
-- Note: Replace topic_id UUIDs after inserting the topics rows below.
-- All questions are manually authored (source = 'manual'), verified = true.
-- ============================================================


-- ------------------------------------------------------------
-- STEP 1: Insert topics
-- ------------------------------------------------------------

INSERT INTO topics (id, name, syllabus, subject)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'Pythagoras'' Theorem',         'Edexcel GCSE', 'Mathematics'),
  ('11111111-0000-0000-0000-000000000002', 'Solving Quadratic Equations',  'Edexcel GCSE', 'Mathematics'),
  ('11111111-0000-0000-0000-000000000003', 'Probability',                  'Edexcel GCSE', 'Mathematics');


-- ------------------------------------------------------------
-- STEP 2: Insert questions
-- ------------------------------------------------------------

-- ========================
-- TOPIC 1: Pythagoras' Theorem (4 questions, grades 4–7)
-- ========================

-- Q1 — Grade 4, Foundation, short_answer
INSERT INTO questions (
  topic_id, syllabus, subject, grade, criterion,
  difficulty, question_type, question_text, mark_scheme,
  source, verified
) VALUES (
  '11111111-0000-0000-0000-000000000001',
  'Edexcel GCSE', 'Mathematics', 4, 'Geometry and Measures',
  'Foundation', 'short_answer',
  'A right-angled triangle has shorter sides of length 6 cm and 8 cm. Calculate the length of the hypotenuse.',
  'a² + b² = c²  →  6² + 8² = 36 + 64 = 100  →  c = √100 = 10 cm',
  'manual', true
);

-- Q2 — Grade 5, Higher, short_answer (find a shorter side)
INSERT INTO questions (
  topic_id, syllabus, subject, grade, criterion,
  difficulty, question_type, question_text, mark_scheme,
  source, verified
) VALUES (
  '11111111-0000-0000-0000-000000000001',
  'Edexcel GCSE', 'Mathematics', 5, 'Geometry and Measures',
  'Higher', 'short_answer',
  'A right-angled triangle has a hypotenuse of 13 cm and one shorter side of 5 cm. Find the length of the other shorter side. Give your answer to 1 decimal place.',
  'b² = 13² − 5² = 169 − 25 = 144  →  b = √144 = 12.0 cm',
  'manual', true
);

-- Q3 — Grade 5, Higher, structured (applied / real-world context)
INSERT INTO questions (
  topic_id, syllabus, subject, grade, criterion,
  difficulty, question_type, question_text, mark_scheme,
  source, verified
) VALUES (
  '11111111-0000-0000-0000-000000000001',
  'Edexcel GCSE', 'Mathematics', 5, 'Geometry and Measures',
  'Higher', 'structured',
  'A ladder of length 5 m leans against a vertical wall. The base of the ladder is 1.8 m from the wall on horizontal ground. Calculate how high up the wall the ladder reaches. Give your answer to 2 decimal places.',
  'h² = 5² − 1.8² = 25 − 3.24 = 21.76  →  h = √21.76 ≈ 4.66 m',
  'manual', true
);

-- Q4 — Grade 7, Higher, structured (3D Pythagoras)
INSERT INTO questions (
  topic_id, syllabus, subject, grade, criterion,
  difficulty, question_type, question_text, mark_scheme,
  source, verified
) VALUES (
  '11111111-0000-0000-0000-000000000001',
  'Edexcel GCSE', 'Mathematics', 7, 'Geometry and Measures',
  'Higher', 'structured',
  'A cuboid has dimensions 4 cm × 3 cm × 5 cm. Calculate the length of the space diagonal (the diagonal from one corner of the cuboid to the opposite corner). Give your answer in surd form.',
  'Step 1: diagonal of base = √(4² + 3²) = √25 = 5 cm.  Step 2: space diagonal = √(5² + 5²) = √50 = 5√2 cm.',
  'manual', true
);


-- ========================
-- TOPIC 2: Solving Quadratic Equations (3 questions, grades 5–8)
-- ========================

-- Q5 — Grade 5, Higher, short_answer (factorise, a=1)
INSERT INTO questions (
  topic_id, syllabus, subject, grade, criterion,
  difficulty, question_type, question_text, mark_scheme,
  source, verified
) VALUES (
  '11111111-0000-0000-0000-000000000002',
  'Edexcel GCSE', 'Mathematics', 5, 'Algebra',
  'Higher', 'short_answer',
  'Solve x² + 5x + 6 = 0.',
  'Factorise: (x + 2)(x + 3) = 0  →  x = −2 or x = −3',
  'manual', true
);

-- Q6 — Grade 7, Higher, short_answer (quadratic formula)
INSERT INTO questions (
  topic_id, syllabus, subject, grade, criterion,
  difficulty, question_type, question_text, mark_scheme,
  source, verified
) VALUES (
  '11111111-0000-0000-0000-000000000002',
  'Edexcel GCSE', 'Mathematics', 7, 'Algebra',
  'Higher', 'short_answer',
  'Solve 3x² − 5x − 2 = 0. Give your solutions to 2 decimal places.',
  'Use quadratic formula: x = (5 ± √(25 + 24)) / 6 = (5 ± 7) / 6.  x = 2 or x = −0.33 (to 2 d.p.)',
  'manual', true
);

-- Q7 — Grade 8, Higher, structured (completing the square + applied)
INSERT INTO questions (
  topic_id, syllabus, subject, grade, criterion,
  difficulty, question_type, question_text, mark_scheme,
  source, verified
) VALUES (
  '11111111-0000-0000-0000-000000000002',
  'Edexcel GCSE', 'Mathematics', 8, 'Algebra',
  'Higher', 'structured',
  '(a) Write x² − 6x + 5 in the form (x − a)² − b.
(b) Hence, or otherwise, solve x² − 6x + 5 = 0.
(c) State the coordinates of the minimum point of the curve y = x² − 6x + 5.',
  '(a) (x − 3)² − 4.   (b) (x − 3)² = 4  →  x − 3 = ±2  →  x = 5 or x = 1.   (c) Minimum at (3, −4).',
  'manual', true
);


-- ========================
-- TOPIC 3: Probability (3 questions, grades 3–5)
-- ========================

-- Q8 — Grade 3, Foundation, short_answer (basic single-event)
INSERT INTO questions (
  topic_id, syllabus, subject, grade, criterion,
  difficulty, question_type, question_text, mark_scheme,
  source, verified
) VALUES (
  '11111111-0000-0000-0000-000000000003',
  'Edexcel GCSE', 'Mathematics', 3, 'Probability',
  'Foundation', 'short_answer',
  'A bag contains 3 red balls, 5 blue balls, and 2 green balls. A ball is chosen at random. Write down the probability that the ball is blue.',
  'P(blue) = 5/10 = 1/2',
  'manual', true
);

-- Q9 — Grade 4, Foundation/Higher, structured (relative frequency + expected outcomes)
INSERT INTO questions (
  topic_id, syllabus, subject, grade, criterion,
  difficulty, question_type, question_text, mark_scheme,
  source, verified
) VALUES (
  '11111111-0000-0000-0000-000000000003',
  'Edexcel GCSE', 'Mathematics', 4, 'Probability',
  'Foundation', 'structured',
  'A biased coin is flipped 200 times. It lands on heads 130 times.
(a) Write down the relative frequency of heads.
(b) The coin is flipped a further 500 times. Estimate the number of times it will land on heads.',
  '(a) 130/200 = 0.65.   (b) 0.65 × 500 = 325 times.',
  'manual', true
);

-- Q10 — Grade 5, Higher, structured (tree diagram — two events)
INSERT INTO questions (
  topic_id, syllabus, subject, grade, criterion,
  difficulty, question_type, question_text, mark_scheme,
  source, verified
) VALUES (
  '11111111-0000-0000-0000-000000000003',
  'Edexcel GCSE', 'Mathematics', 5, 'Probability',
  'Higher', 'structured',
  'The probability that it rains on any given day is 0.3. If it rains, the probability that Amy takes an umbrella is 0.9. If it does not rain, the probability that Amy takes an umbrella is 0.1.
(a) Complete a probability tree diagram for these events.
(b) Calculate the probability that Amy takes an umbrella on a randomly chosen day.
(c) Given that Amy takes an umbrella, find the probability that it rained.',
  '(a) Tree: Rain(0.3)→Umbrella(0.9), No Umbrella(0.1); No Rain(0.7)→Umbrella(0.1), No Umbrella(0.9).
(b) P(Umbrella) = 0.3×0.9 + 0.7×0.1 = 0.27 + 0.07 = 0.34.
(c) P(Rain|Umbrella) = 0.27/0.34 = 27/34 ≈ 0.794.',
  'manual', true
);