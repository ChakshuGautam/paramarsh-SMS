import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  // Hard reset (respect FK ordering: children first)
  await prisma.marksEntry.deleteMany().catch(() => {});
  await prisma.examSession.deleteMany().catch(() => {});
  await prisma.exam.deleteMany().catch(() => {});
  await prisma.attendanceRecord.deleteMany().catch(() => {});
  await prisma.payment.deleteMany().catch(() => {});
  await prisma.invoice.deleteMany().catch(() => {});
  await prisma.guardian.deleteMany().catch(() => {});
  await prisma.enrollment.deleteMany().catch(() => {});
  await prisma.student.deleteMany().catch(() => {});
  await prisma.section.deleteMany().catch(() => {});
  await prisma.class.deleteMany().catch(() => {});
  await prisma.feeComponent.deleteMany().catch(() => {});
  await prisma.feeStructure.deleteMany().catch(() => {});
  await prisma.application.deleteMany().catch(() => {});
  await prisma.staff.deleteMany().catch(() => {});
  await prisma.tenant.deleteMany().catch(() => {});

  // Target minimum rows per entity
  const TARGET = 100;

  // Tenants (>=100)
  await prisma.tenant.createMany({
    data: Array.from({ length: TARGET }).map((_, i) => ({
      name: `Demo School ${i + 1}`,
      subdomain: `demo-${i + 1}`,
    })),
  });
  const tenants = await prisma.tenant.findMany();

  // Classes (>=100)
  await prisma.class.createMany({
    data: Array.from({ length: TARGET }).map((_, i) => ({
      name: `Class ${i + 1}`,
      gradeLevel: (i % 12) + 1,
    })),
  });
  const classes = await prisma.class.findMany();

  // Sections (>=100) — two per class
  const sections = await prisma.$transaction(
    classes.flatMap((cls) => [
      prisma.section.create({
        data: { classId: cls.id, name: "A", capacity: 40 },
      }),
      prisma.section.create({
        data: { classId: cls.id, name: "B", capacity: 40 },
      }),
    ])
  );

  // Students (>=100) — generate 200 for richer relations
  const STUDENT_COUNT = Math.max(TARGET, 200);
  const students = await prisma.$transaction(
    Array.from({ length: STUDENT_COUNT }).map((_, i) => {
      const cls = classes[i % classes.length];
      const sec =
        sections.filter((s) => s.classId === cls.id)[i % 2] ??
        sections[i % sections.length];
      return prisma.student.create({
        data: {
          admissionNo: `ADM-${1000 + i}`,
          firstName: `First${i}`,
          lastName: `Last${i}`,
          dob: `201${i % 10}-0${(i % 9) + 1}-1${i % 9}`,
          gender: i % 3 === 0 ? "male" : i % 3 === 1 ? "female" : "other",
          classId: cls.id,
          sectionId: sec.id,
        },
      });
    })
  );

  // Enrollments (>=100) — one per student
  await prisma.$transaction(
    students.map((s, i) =>
      prisma.enrollment.create({
        data: {
          studentId: s.id,
          sectionId: s.sectionId!,
          status: i % 25 === 0 ? "transferred" : "active",
          startDate: "2024-06-01",
          endDate: i % 25 === 0 ? "2025-03-31" : null,
        },
      })
    )
  );

  // Guardians (>=100) — two per student
  await prisma.$transaction(
    students.flatMap((s, i) => [
      prisma.guardian.create({
        data: {
          studentId: s.id,
          relation: "father",
          name: `Parent ${i}`,
          phone: `99999${String(10000 + i).slice(-5)}`,
          email: `parent${i}@example.com`,
        },
      }),
      prisma.guardian.create({
        data: {
          studentId: s.id,
          relation: "mother",
          name: `Parent2 ${i}`,
          phone: `88888${String(10000 + i).slice(-5)}`,
          email: `parent2_${i}@example.com`,
        },
      }),
    ])
  );

  // Invoices (>=100) — one per student
  const invoices = await prisma.$transaction(
    students.map((s, i) =>
      prisma.invoice.create({
        data: {
          studentId: s.id,
          period: "2024-25",
          dueDate: `2024-${String((i % 9) + 1).padStart(2, "0")}-01`,
          amount: 40000 + (i % 7) * 1500,
          status:
            i % 6 === 0
              ? "paid"
              : i % 6 === 1
              ? "partial"
              : i % 6 === 2
              ? "overdue"
              : i % 6 === 3
              ? "void"
              : "issued",
        },
      })
    )
  );

  // Payments (>=100) — ensure at least one for many invoices
  await prisma.$transaction(
    invoices.flatMap((inv, idx) => {
      if (idx % 6 === 0) {
        return [
          prisma.payment.create({
            data: {
              invoiceId: inv.id,
              gateway: "mock",
              amount: inv.amount ?? 0,
              status: "success",
              method: "upi",
            },
          }),
        ];
      }
      if (idx % 6 === 1) {
        const half = Math.floor((inv.amount ?? 0) / 2);
        return [
          prisma.payment.create({
            data: {
              invoiceId: inv.id,
              gateway: "mock",
              amount: half,
              status: "success",
              method: "card",
            },
          }),
        ];
      }
      if (idx % 6 === 2) {
        return [
          prisma.payment.create({
            data: {
              invoiceId: inv.id,
              gateway: "mock",
              amount: inv.amount ?? 0,
              status: "failed",
              method: "netbanking",
            },
          }),
        ];
      }
      return [];
    })
  );

  // Exams (>=100)
  await prisma.exam.createMany({
    data: Array.from({ length: TARGET }).map((_, i) => ({
      name: `Assessment ${i + 1}`,
      startDate: `2024-${String((i % 9) + 1).padStart(2, "0")}-10`,
      endDate: `2024-${String((i % 9) + 1).padStart(2, "0")}-20`,
    })),
  });
  const exams = await prisma.exam.findMany();

  // Exam Sessions (>=100) — two per exam
  const sessions = await prisma.$transaction(
    exams.flatMap((ex, idx) => [
      prisma.examSession.create({
        data: {
          examId: ex.id,
          subjectId: "math",
          schedule: `2024-09-${String((idx % 20) + 1).padStart(2, "0")}`,
        },
      }),
      prisma.examSession.create({
        data: {
          examId: ex.id,
          subjectId: "science",
          schedule: `2024-09-${String((idx % 20) + 2).padStart(2, "0")}`,
        },
      }),
    ])
  );

  // Marks (>=100) — 2 sessions x first 100 students
  await prisma.$transaction(
    students.slice(0, TARGET).flatMap((s, si) =>
      sessions.slice(0, 2).map((sess, k) =>
        prisma.marksEntry.create({
          data: {
            studentId: s.id,
            sessionId: sess.id,
            rawMarks: 35 + ((si + k) % 66),
            grade:
              35 + ((si + k) % 66) >= 90
                ? "A"
                : 35 + ((si + k) % 66) >= 75
                ? "B"
                : 35 + ((si + k) % 66) >= 50
                ? "C"
                : "F",
          },
        })
      )
    )
  );

  // Fee Structures (>=100) + Components (>=100)
  const feeStructures = await prisma.$transaction(
    Array.from({ length: TARGET }).map((_, i) =>
      prisma.feeStructure.create({ data: { gradeId: `grade-${(i % 12) + 1}` } })
    )
  );

  await prisma.$transaction(
    feeStructures.flatMap((fs, i) => [
      prisma.feeComponent.create({
        data: {
          feeStructureId: fs.id,
          name: "tuition",
          type: "tuition",
          amount: 25000 + (i % 5) * 1000,
        },
      }),
      prisma.feeComponent.create({
        data: {
          feeStructureId: fs.id,
          name: "library",
          type: "library",
          amount: 1500 + (i % 3) * 250,
        },
      }),
      prisma.feeComponent.create({
        data: {
          feeStructureId: fs.id,
          name: "lab",
          type: "lab",
          amount: 2000 + (i % 4) * 500,
        },
      }),
    ])
  );

  // Attendance (>=100) — 2 records for first 100 students
  await prisma.$transaction(
    students.slice(0, TARGET).flatMap((s, i) =>
      Array.from({ length: 2 }).map((_, d) =>
        prisma.attendanceRecord.create({
          data: {
            studentId: s.id,
            date: `2024-09-${String((i % 10) + d + 1).padStart(2, "0")}`,
            status:
              (i + d) % 4 === 0
                ? "A"
                : (i + d) % 4 === 1
                ? "L"
                : (i + d) % 4 === 2
                ? "E"
                : "P",
            reason: (i + d) % 4 === 1 ? "late bus" : undefined,
            markedBy: (i + d) % 3 === 0 ? "teacher" : "system",
            source: (i + d) % 2 === 0 ? "manual" : "rfid",
          },
        })
      )
    )
  );

  // Applications (>=100)
  await prisma.application.createMany({
    data: Array.from({ length: TARGET }).map((_, i) => ({
      tenantId: pickRandom(tenants).id,
      programId: `p${(i % 10) + 1}`,
      studentProfileRef: `profile-${i + 1}`,
      status: [
        "pending",
        "verified",
        "offered",
        "accepted",
        "waitlisted",
        "rejected",
      ][i % 6],
      score: 60 + (i % 41),
      priorityTag: i % 7 === 0 ? "sports" : i % 7 === 1 ? "alumni" : null,
      createdAt: new Date(Date.UTC(2024, i % 12, (i % 28) + 1)),
    })),
  });

  // Staff (>=100)
  await prisma.staff.createMany({
    data: Array.from({ length: TARGET }).map((_, i) => ({
      firstName: `StaffFirst${i + 1}`,
      lastName: `StaffLast${i + 1}`,
      email: `staff${i + 1}@example.com`,
      phone: `+9197000${String(10000 + i).slice(-5)}`,
      designation: ["Teacher", "Administrator", "Counselor", "Accountant"][
        i % 4
      ],
      department: ["Academics", "Admin", "Finance", "Support"][i % 4],
      employmentType:
        i % 3 === 0 ? "full-time" : i % 3 === 1 ? "part-time" : "contract",
      joinDate: `201${i % 10}-0${(i % 9) + 1}-1${i % 9}`,
      status: i % 17 === 0 ? "inactive" : "active",
    })),
  });

  // Teachers (link subset of staff with designation Teacher)
  const allStaff = await prisma.staff.findMany();
  const teacherStaff = allStaff.filter((s) => (s.designation || "").toLowerCase().includes("teacher"));
  await prisma.$transaction(
    teacherStaff.slice(0, TARGET).map((s, idx) =>
      prisma.teacher.create({
        data: {
          staffId: s.id,
          subjects: JSON.stringify(idx % 2 === 0 ? ["math", "science"] : ["english", "history"]),
          qualifications: idx % 3 === 0 ? "B.Ed" : idx % 3 === 1 ? "M.Ed" : "B.Sc",
          experienceYears: (idx % 15) + 1,
        },
      })
    )
  );
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
