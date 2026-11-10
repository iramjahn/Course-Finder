-- Seed: one skill (Excel), 35 resources, three paths.
-- Every URL below was opened and returned HTTP 200 on 2026-11-10; hours come from the
-- video's real length or the provider's stated time. No model produced any URL.

insert into public.skills (id, slug, name) values
  ('00000000-0000-4000-8000-000000000001', 'excel', 'Excel');

-- id suffix: 1xx beginner, 2xx intermediate, 3xx advanced
insert into public.resources (id, skill_id, title, url, platform, hours, level) values
  -- beginner (in path)
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 'How to Use Excel for Beginners in 10 Minutes', 'https://www.youtube.com/watch?v=Ai0MV7twEBE', 'YouTube · Kevin Stratvert', 0.14, 'beginner'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 'Excel Tutorial for Beginners', 'https://www.youtube.com/watch?v=e7xGuGqgp-Q', 'YouTube · Kevin Stratvert', 0.52, 'beginner'),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001', 'Excel video training', 'https://support.microsoft.com/en-us/office/excel-video-training-9bc05390-e94c-46af-a5b3-d7c22f6990bb', 'Microsoft Support', 1.50, 'beginner'),
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000001', 'Overview of formulas in Excel', 'https://support.microsoft.com/en-us/office/overview-of-formulas-in-excel-ecfdc708-9162-49e8-b993-c311f47ca173', 'Microsoft Support', 0.50, 'beginner'),
  ('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000001', 'Excel Formulas and Functions | Full Course', 'https://www.youtube.com/watch?v=Y8xhrUa3KH4', 'YouTube · Kevin Stratvert', 0.88, 'beginner'),
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000001', 'Microsoft Excel Tutorial for Beginners – Full Course', 'https://www.youtube.com/watch?v=Vl0H-qTclOg', 'YouTube · freeCodeCamp', 2.44, 'beginner'),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000001', 'Pivot Table Excel Tutorial', 'https://www.youtube.com/watch?v=m0wI61ahfLc', 'YouTube · Kevin Stratvert', 0.23, 'beginner'),
  ('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000001', 'Create a PivotTable to analyze worksheet data', 'https://support.microsoft.com/en-us/office/create-a-pivottable-to-analyze-worksheet-data-a9a84538-bfe9-40a9-a8e9-f99134456576', 'Microsoft Support', 0.50, 'beginner'),
  -- beginner (pool: swap candidates and catalog)
  ('00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000001', 'Excel Course for Beginners: Lesson 1', 'https://www.youtube.com/watch?v=QWebO2FbORk', 'YouTube · ENG-School', 0.15, 'beginner'),
  ('00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000001', 'Complete Excel Course FREE – Basic to Advanced', 'https://www.youtube.com/watch?v=P9OVUhoGtYs', 'YouTube · Course Vourse', 0.71, 'beginner'),
  ('00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000001', 'Excel Tips and Tricks', 'https://www.youtube.com/watch?v=qHaZYN5uINc', 'YouTube · Kevin Stratvert', 0.33, 'beginner'),
  ('00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000001', 'Excel Skills for Business: Essentials (Macquarie University)', 'https://www.coursera.org/learn/excel-essentials', 'Coursera', 30.00, 'beginner'),

  -- intermediate (in path)
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001', 'How to use the XLOOKUP Function in Microsoft Excel – Beginners Tutorial', 'https://www.youtube.com/watch?v=tPaXEZRh9_k', 'YouTube · Teacher''s Tech', 0.29, 'intermediate'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000001', 'XLOOKUP function', 'https://support.microsoft.com/en-us/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929', 'Microsoft Support', 0.50, 'intermediate'),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000001', 'How to Use the Excel XLOOKUP Function (With Examples)', 'https://www.xelplus.com/excel-xlookup/', 'Xelplus · Leila Gharani', 0.50, 'intermediate'),
  ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000001', 'Use conditional formatting to highlight information in Excel', 'https://support.microsoft.com/en-us/excel/use-conditional-formatting-to-highlight-information-in-excel', 'Microsoft Support', 0.50, 'intermediate'),
  ('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000001', 'Excel Formulas & Functions – Full Course', 'https://www.youtube.com/watch?v=gvhsKtjAmgc', 'YouTube · freeCodeCamp', 1.69, 'intermediate'),
  ('00000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000001', 'Tutorial: Import Data into Excel, and Create a Data Model', 'https://support.microsoft.com/en-us/office/tutorial-import-data-into-excel-and-create-a-data-model-4b4e5ab4-60ee-465e-8195-09ebba060bf0', 'Microsoft Support', 1.50, 'intermediate'),
  ('00000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000001', 'Excel Data Visualization Course – Guide to Charts & Dashboards', 'https://www.youtube.com/watch?v=VV8iRJ-DS0A', 'YouTube · freeCodeCamp', 1.17, 'intermediate'),
  -- intermediate (pool)
  ('00000000-0000-4000-8000-000000000208', '00000000-0000-4000-8000-000000000001', 'The Ultimate XLOOKUP Tutorial (The Best Excel Formula)', 'https://www.youtube.com/watch?v=Gfu26nNvrsk', 'YouTube · Kenji Explains', 0.18, 'intermediate'),
  ('00000000-0000-4000-8000-000000000209', '00000000-0000-4000-8000-000000000001', 'XLOOKUP function – quick reference', 'https://exceljet.net/functions/xlookup-function', 'Exceljet', 0.25, 'intermediate'),
  ('00000000-0000-4000-8000-000000000210', '00000000-0000-4000-8000-000000000001', 'Complete Excel Data Analysis Course for Beginners', 'https://www.youtube.com/watch?v=zGGhq3Y6vGw', 'YouTube · LearnwithUD', 0.28, 'intermediate'),
  ('00000000-0000-4000-8000-000000000211', '00000000-0000-4000-8000-000000000001', 'Excel Skills for Business: Intermediate I (Macquarie University)', 'https://www.coursera.org/learn/excel-intermediate-1', 'Coursera', 30.00, 'intermediate'),

  -- advanced (in path)
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000001', 'How Power Query Will Change the Way You Use Excel', 'https://www.youtube.com/watch?v=6lBqYInBldk', 'YouTube · Leila Gharani', 0.15, 'advanced'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000001', 'What is Power Query?', 'https://learn.microsoft.com/en-us/power-query/power-query-what-is-power-query', 'Microsoft Learn', 0.50, 'advanced'),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000001', 'Learn to use Power Query and Power Pivot in Excel', 'https://support.microsoft.com/en-us/excel/learn-to-use-power-query-and-power-pivot-in-excel', 'Microsoft Support', 1.00, 'advanced'),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000001', 'Get started with Power Pivot in Microsoft Excel', 'https://support.microsoft.com/en-us/excel/get-started-with-power-pivot-in-microsoft-excel', 'Microsoft Support', 1.00, 'advanced'),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000001', 'DAX overview', 'https://learn.microsoft.com/en-us/dax/dax-overview', 'Microsoft Learn', 0.75, 'advanced'),
  ('00000000-0000-4000-8000-000000000306', '00000000-0000-4000-8000-000000000001', 'Dynamic array formulas and spilled array behavior', 'https://support.microsoft.com/en-us/office/dynamic-array-formulas-and-spilled-array-behavior-205c6b06-03ba-4151-89a1-87a7eb36e531', 'Microsoft Support', 0.50, 'advanced'),
  ('00000000-0000-4000-8000-000000000307', '00000000-0000-4000-8000-000000000001', 'LAMBDA function', 'https://support.microsoft.com/en-us/office/lambda-function-bd212d27-1cd1-4321-a34a-ccbf254b8b67', 'Microsoft Support', 0.50, 'advanced'),
  ('00000000-0000-4000-8000-000000000308', '00000000-0000-4000-8000-000000000001', 'Getting started with VBA in Office', 'https://learn.microsoft.com/en-us/office/vba/library-reference/concepts/getting-started-with-vba-in-office', 'Microsoft Learn', 1.00, 'advanced'),
  ('00000000-0000-4000-8000-000000000309', '00000000-0000-4000-8000-000000000001', 'Excel for Data Analytics – Full Course for Beginners', 'https://www.youtube.com/watch?v=pCJ15nGFgVg', 'YouTube · Luke Barousse', 11.00, 'advanced'),
  -- advanced (pool)
  ('00000000-0000-4000-8000-000000000310', '00000000-0000-4000-8000-000000000001', 'This Power Query course will change the way you use Excel', 'https://www.youtube.com/watch?v=oAli5ShgfDs', 'YouTube · Zubair Sohail', 0.21, 'advanced'),
  ('00000000-0000-4000-8000-000000000311', '00000000-0000-4000-8000-000000000001', 'Power Pivot – overview and learning', 'https://support.microsoft.com/en-us/excel/power-pivot-overview-and-learning', 'Microsoft Support', 0.25, 'advanced'),
  ('00000000-0000-4000-8000-000000000312', '00000000-0000-4000-8000-000000000001', 'Excel Skills for Business: Advanced (Macquarie University)', 'https://www.coursera.org/learn/excel-advanced', 'Coursera', 30.00, 'advanced'),
  ('00000000-0000-4000-8000-000000000313', '00000000-0000-4000-8000-000000000001', 'Master Excel Power Query – Beginner to Pro (paid, $299)', 'https://www.xelplus.com/course/excel-power-query/', 'Xelplus · Leila Gharani', 18.00, 'advanced');

insert into public.paths (id, skill_id, level, title, resource_ids) values
  ('00000000-0000-4000-8000-000000000a01', '00000000-0000-4000-8000-000000000001', 'beginner', 'Excel from zero', array[
    '00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000104','00000000-0000-4000-8000-000000000105','00000000-0000-4000-8000-000000000106',
    '00000000-0000-4000-8000-000000000107','00000000-0000-4000-8000-000000000108']::uuid[]),
  ('00000000-0000-4000-8000-000000000a02', '00000000-0000-4000-8000-000000000001', 'intermediate', 'Excel for real work', array[
    '00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000204','00000000-0000-4000-8000-000000000205','00000000-0000-4000-8000-000000000206',
    '00000000-0000-4000-8000-000000000207']::uuid[]),
  ('00000000-0000-4000-8000-000000000a03', '00000000-0000-4000-8000-000000000001', 'advanced', 'Excel power user', array[
    '00000000-0000-4000-8000-000000000301','00000000-0000-4000-8000-000000000302','00000000-0000-4000-8000-000000000303',
    '00000000-0000-4000-8000-000000000304','00000000-0000-4000-8000-000000000305','00000000-0000-4000-8000-000000000306',
    '00000000-0000-4000-8000-000000000307','00000000-0000-4000-8000-000000000308','00000000-0000-4000-8000-000000000309']::uuid[]);
