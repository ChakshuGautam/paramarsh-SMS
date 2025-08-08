# Screen Specs — Exams & Results

1) Exam Setup
- Route: /exams
- Create Term: name, session, dates; subjects/components with max marks & weightage
- Seating Plan: generator by room capacity; print hall tickets

2) Marks Entry
- Route: /exams/:id/marks
- Grid per subject/section; range validations; missing marks warnings; lock after moderation

3) Moderation
- Route: /exams/:id/moderation
- HoD/Controller view: compare distributions; apply curve; capture reason; track deltas

4) Results
- Route: /exams/:id/results
- Compute; preview report cards; remarks; lock and publish; staged release
- Student/Parent view: PDF download; watermark if dues pending (configurable)

