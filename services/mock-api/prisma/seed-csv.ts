import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../../..");
const seeds = path.join(root, "docs/Seeds");

function readCsv(file: string): string[][] {
  const p = path.join(seeds, file);
  if (!fs.existsSync(p)) throw new Error(`Missing CSV: ${file}`);
  return fs
    .readFileSync(p, "utf-8")
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(1)
    .map((l) => l.split(","));
}

async function main() {
  // Truncate (respect FK ordering)
  await prisma.marksEntry.deleteMany();
  await prisma.examSession.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.section.deleteMany();
  await prisma.class.deleteMany();
  await prisma.feeComponent.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.application.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.tenant.deleteMany();

  // Tenants
  const tenantsCsv = readCsv("tenants.csv");
  const tenants = await prisma.$transaction(
    tenantsCsv.map(([name, subdomain]) =>
      prisma.tenant.create({ data: { name, subdomain } })
    )
  );

  // Classes
  const classesCsv = readCsv("classes.csv");
  const classes = await prisma.$transaction(
    classesCsv.map(([name, gradeLevel]) =>
      prisma.class.create({ data: { name, gradeLevel: Number(gradeLevel) || null } })
    )
  );

  // Sections
  const sectionsCsv = readCsv("sections.csv");
  const sections = await prisma.$transaction(
    sectionsCsv.map(([className, sectionName, capacity]) => {
      const cls = classes.find((c) => c.name === className);
      if (!cls) throw new Error(`Section references missing class: ${className}`);
      return prisma.section.create({
        data: { classId: cls.id, name: sectionName, capacity: Number(capacity) || 40 },
      });
    })
  );

  // Students
  const studentsCsv = readCsv("students.csv");
  const students = await prisma.$transaction(
    studentsCsv.map(([admissionNo, firstName, lastName, dob, gender, className, sectionName]) => {
      const cls = classes.find((c) => c.name === className);
      if (!cls) throw new Error(`Student ${admissionNo} missing class: ${className}`);
      const sec = sections.find((s) => s.classId === cls.id && s.name === sectionName);
      if (!sec) throw new Error(`Student ${admissionNo} missing section: ${className}/${sectionName}`);
      return prisma.student.create({
        data: {
          admissionNo,
          firstName,
          lastName,
          dob,
          gender,
          classId: cls.id,
          sectionId: sec.id,
        },
      });
    })
  );

  // Enrollments
  const enrollmentsCsv = readCsv("enrollments.csv");
  await prisma.$transaction(
    enrollmentsCsv.map(([studentAdmissionNo, className, sectionName, status, startDate, endDate]) => {
      const student = students.find((s) => s.admissionNo === studentAdmissionNo);
      if (!student) throw new Error(`Enrollment missing student: ${studentAdmissionNo}`);
      const cls = classes.find((c) => c.name === className);
      if (!cls) throw new Error(`Enrollment missing class: ${className}`);
      const sec = sections.find((s) => s.classId === cls.id && s.name === sectionName);
      if (!sec) throw new Error(`Enrollment missing section: ${className}/${sectionName}`);
      return prisma.enrollment.create({
        data: {
          studentId: student.id,
          sectionId: sec.id,
          status: status || null,
          startDate: startDate || null,
          endDate: endDate || null,
        },
      });
    })
  );

  // Guardians
  const guardiansCsv = readCsv("guardians.csv");
  await prisma.$transaction(
    guardiansCsv.map(([studentAdmissionNo, relation, name, email, phone, address]) => {
      const student = students.find((s) => s.admissionNo === studentAdmissionNo);
      if (!student) throw new Error(`Guardian missing student: ${studentAdmissionNo}`);
      return prisma.guardian.create({
        data: { studentId: student.id, relation, name, email: email || null, phone: phone || null, address: address || null },
      });
    })
  );

  // Invoices
  const invoicesCsv = readCsv("invoices.csv");
  const invoices = await prisma.$transaction(
    invoicesCsv.map(([studentAdmissionNo, period, dueDate, amount, status]) => {
      const student = students.find((s) => s.admissionNo === studentAdmissionNo);
      if (!student) throw new Error(`Invoice missing student: ${studentAdmissionNo}`);
      return prisma.invoice.create({
        data: {
          studentId: student.id,
          period,
          dueDate: dueDate || null,
          amount: amount ? Number(amount) : null,
          status: status || null,
        },
      });
    })
  );

  // Payments (linked via studentAdmissionNo+period)
  const paymentsCsv = readCsv("payments.csv");
  await prisma.$transaction(
    paymentsCsv.map(([studentAdmissionNo, period, amount, status, method, gateway, reference]) => {
      const student = students.find((s) => s.admissionNo === studentAdmissionNo);
      if (!student) throw new Error(`Payment missing student: ${studentAdmissionNo}`);
      const invoice = invoices.find((inv) => inv.studentId === student.id && inv.period === period);
      if (!invoice) throw new Error(`Payment missing invoice for ${studentAdmissionNo}/${period}`);
      return prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: amount ? Number(amount) : null,
          status: status || null,
          method: method || null,
          gateway: gateway || null,
          reference: reference || null,
        },
      });
    })
  );

  // Exams
  const examsCsv = readCsv("exams.csv");
  const exams = await prisma.$transaction(
    examsCsv.map(([name, startDate, endDate]) =>
      prisma.exam.create({ data: { name, startDate: startDate || null, endDate: endDate || null } })
    )
  );

  // Exam Sessions
  const sessionsCsv = readCsv("exam_sessions.csv");
  const sessions = await prisma.$transaction(
    sessionsCsv.map(([examName, subjectId, roomId, schedule]) => {
      const exam = exams.find((e) => e.name === examName);
      if (!exam) throw new Error(`Session missing exam: ${examName}`);
      return prisma.examSession.create({
        data: { examId: exam.id, subjectId: subjectId || null, roomId: roomId || null, schedule: schedule || null },
      });
    })
  );

  // Marks
  const marksCsv = readCsv("marks.csv");
  await prisma.$transaction(
    marksCsv.map(([studentAdmissionNo, examName, subjectId, rawMarks, grade, comments]) => {
      const student = students.find((s) => s.admissionNo === studentAdmissionNo);
      if (!student) throw new Error(`Marks missing student: ${studentAdmissionNo}`);
      const exam = exams.find((e) => e.name === examName);
      if (!exam) throw new Error(`Marks missing exam: ${examName}`);
      const session = sessions.find((s) => s.examId === exam.id && s.subjectId === subjectId);
      if (!session) throw new Error(`Marks missing session: ${examName}/${subjectId}`);
      return prisma.marksEntry.create({
        data: {
          studentId: student.id,
          sessionId: session.id,
          rawMarks: rawMarks ? Number(rawMarks) : null,
          grade: grade || null,
          comments: comments || null,
        },
      });
    })
  );

  // Fee Structures
  const feeStructuresCsv = readCsv("fee_structures.csv");
  const feeStructures = await prisma.$transaction(
    feeStructuresCsv.map(([gradeId]) => prisma.feeStructure.create({ data: { gradeId } }))
  );

  // Fee Components
  const feeComponentsCsv = readCsv("fee_components.csv");
  await prisma.$transaction(
    feeComponentsCsv.map(([feeStructureGradeId, name, type, amount]) => {
      const fsr = feeStructures.find((f) => f.gradeId === feeStructureGradeId);
      if (!fsr) throw new Error(`Fee component missing fee structure: ${feeStructureGradeId}`);
      return prisma.feeComponent.create({
        data: { feeStructureId: fsr.id, name, type: type || null, amount: Number(amount) },
      });
    })
  );

  // Applications
  const applicationsCsv = readCsv("applications.csv");
  await prisma.$transaction(
    applicationsCsv.map(([tenantSubdomain, programId, studentProfileRef, status, score, priorityTag, createdAt]) => {
      const tenant = tenants.find((t) => t.subdomain === tenantSubdomain);
      if (!tenant) throw new Error(`Application missing tenant: ${tenantSubdomain}`);
      return prisma.application.create({
        data: {
          tenantId: tenant.id,
          programId: programId || null,
          studentProfileRef: studentProfileRef || null,
          status: status || null,
          score: score ? Number(score) : null,
          priorityTag: priorityTag || null,
          createdAt: createdAt ? new Date(createdAt) : undefined,
        },
      });
    })
  );

  // Staff
  const staffCsv = readCsv("staff.csv");
  await prisma.$transaction(
    staffCsv.map(([firstName, lastName, email, phone, designation, department, employmentType, joinDate, status]) =>
      prisma.staff.create({
        data: {
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
          designation: designation || null,
          department: department || null,
          employmentType: employmentType || null,
          joinDate: joinDate || null,
          status: status || null,
        },
      })
    )
  );

  // Attendance
  const attendanceCsv = readCsv("attendance_records.csv");
  await prisma.$transaction(
    attendanceCsv.map(([studentAdmissionNo, date, status, reason, markedBy, source]) => {
      const student = students.find((s) => s.admissionNo === studentAdmissionNo);
      if (!student) throw new Error(`Attendance missing student: ${studentAdmissionNo}`);
      return prisma.attendanceRecord.create({
        data: {
          studentId: student.id,
          date,
          status: status || null,
          reason: reason || null,
          markedBy: markedBy || null,
          source: source || null,
        },
      });
    })
  );

  // Strict minimums
  const min100 = async (table: string, count: number) => {
    if (count < 100) throw new Error(`Strict mode: ${table} has ${count} < 100 rows`);
  };

  await min100("Tenant", await prisma.tenant.count());
  await min100("Class", await prisma.class.count());
  await min100("Section", await prisma.section.count());
  await min100("Student", await prisma.student.count());
  await min100("Enrollment", await prisma.enrollment.count());
  await min100("Guardian", await prisma.guardian.count());
  await min100("Invoice", await prisma.invoice.count());
  await min100("Payment", await prisma.payment.count());
  await min100("Exam", await prisma.exam.count());
  await min100("ExamSession", await prisma.examSession.count());
  await min100("MarksEntry", await prisma.marksEntry.count());
  await min100("FeeStructure", await prisma.feeStructure.count());
  await min100("FeeComponent", await prisma.feeComponent.count());
  await min100("Application", await prisma.application.count());
  await min100("Staff", await prisma.staff.count());
  await min100("AttendanceRecord", await prisma.attendanceRecord.count());

  console.log("CSV seed completed with >=100 rows per entity.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
