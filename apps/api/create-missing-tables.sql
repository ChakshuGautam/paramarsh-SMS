-- Create ClassSubjectTeacher table
CREATE TABLE IF NOT EXISTS "ClassSubjectTeacher" (
    "id" TEXT NOT NULL,
    "branchId" TEXT,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "ClassSubjectTeacher_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "ClassSubjectTeacher_branchId_idx" ON "ClassSubjectTeacher"("branchId");
CREATE INDEX IF NOT EXISTS "ClassSubjectTeacher_classId_idx" ON "ClassSubjectTeacher"("classId");
CREATE INDEX IF NOT EXISTS "ClassSubjectTeacher_subjectId_idx" ON "ClassSubjectTeacher"("subjectId");
CREATE INDEX IF NOT EXISTS "ClassSubjectTeacher_teacherId_idx" ON "ClassSubjectTeacher"("teacherId");
CREATE INDEX IF NOT EXISTS "ClassSubjectTeacher_deletedAt_idx" ON "ClassSubjectTeacher"("deletedAt");

-- Create unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "ClassSubjectTeacher_classId_subjectId_teacherId_key" ON "ClassSubjectTeacher"("classId", "subjectId", "teacherId");

-- Add foreign keys
ALTER TABLE "ClassSubjectTeacher" ADD CONSTRAINT "ClassSubjectTeacher_classId_fkey" 
  FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassSubjectTeacher" ADD CONSTRAINT "ClassSubjectTeacher_subjectId_fkey" 
  FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassSubjectTeacher" ADD CONSTRAINT "ClassSubjectTeacher_teacherId_fkey" 
  FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;