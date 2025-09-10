-- Update events to have future dates
UPDATE events 
SET event_date = '2025-12-15'
WHERE title = 'ورشة الحقوق الأسرية';

UPDATE events 
SET event_date = '2025-12-20'
WHERE title = 'محاضرة حقوق المرأة في العمل';

UPDATE events 
SET event_date = '2025-12-25'
WHERE title = 'معرض الخدمات القانونية';