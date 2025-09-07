-- Check ClassSubjectTeacher table
SELECT COUNT(*) as total_assignments FROM "ClassSubjectTeacher";

-- Check distribution by branch
SELECT 
    "branchId",
    COUNT(*) as assignments
FROM "ClassSubjectTeacher" 
GROUP BY "branchId" 
ORDER BY assignments DESC;

-- Sample records with details
SELECT 
    c.name as class_name,
    c."gradeLevel",
    s.name as subject_name,
    st."firstName" || ' ' || st."lastName" as teacher_name,
    cst."branchId"
FROM "ClassSubjectTeacher" cst
JOIN "Class" c ON cst."classId" = c.id
JOIN "Subject" s ON cst."subjectId" = s.id
JOIN "Teacher" t ON cst."teacherId" = t.id
JOIN "Staff" st ON t."staffId" = st.id
LIMIT 10;