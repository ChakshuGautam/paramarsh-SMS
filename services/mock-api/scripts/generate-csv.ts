import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../../..");
const seedsDir = path.join(root, "docs/Seeds");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeCsv(file: string, header: string, rows: string[]) {
  const contents = [header, ...rows].join("\n");
  fs.writeFileSync(file, contents, "utf-8");
}

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

function pad(n: number, width: number) {
  return String(n).padStart(width, "0");
}

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

function main() {
  ensureDir(seedsDir);

  const SCHOOL_NAMES = [
    "Green Valley Public School",
    "Sunrise International Academy",
    "Blue Ridge High School",
    "Riverdale Convent",
    "Hillside Senior Secondary",
    "Lotus Public School",
    "Oakwood Academy",
    "Crescent High School",
    "Maple Leaf School",
    "Silver Oaks Academy",
  ];

  // Tenants (100)
  const tenants = range(100).map((i) => {
    const base = pick(SCHOOL_NAMES, i).replace(/[^a-zA-Z ]/g, "");
    const sub = base.toLowerCase().replace(/\s+/g, "-") + "-" + (i + 1);
    return `${base},${sub}`;
  });
  writeCsv(
    path.join(seedsDir, "tenants.csv"),
    "name,subdomain",
    tenants
  );

  // Classes (1..100) and Sections (A,B)
  const classes = range(100).map((i) => `Class ${i + 1},${(i % 12) + 1}`);
  writeCsv(path.join(seedsDir, "classes.csv"), "name,gradeLevel", classes);

  const sections: string[] = [];
  range(100).forEach((i) => {
    sections.push(`Class ${i + 1},A,40`);
    sections.push(`Class ${i + 1},B,40`);
  });
  writeCsv(
    path.join(seedsDir, "sections.csv"),
    "className,sectionName,capacity",
    sections
  );

  // Students (200)
  const firstNames = [
    "Aarav",
    "Vihaan",
    "Ishaan",
    "Kabir",
    "Advait",
    "Saanvi",
    "Aadhya",
    "Diya",
    "Anaya",
    "Myra",
    "Arjun",
    "Rahul",
    "Priya",
    "Neha",
    "Kiran",
  ];
  const lastNames = [
    "Sharma",
    "Verma",
    "Patel",
    "Reddy",
    "Nair",
    "Iyer",
    "Khan",
    "Singh",
    "Gupta",
    "Mehta",
  ];
  const genders = ["male", "female", "other"];
  const students: string[] = [];
  range(200).forEach((i) => {
    const cls = `Class ${((i % 100) + 1)}`;
    const sec = i % 2 === 0 ? "A" : "B";
    const fn = pick(firstNames, i);
    const ln = pick(lastNames, i);
    const y = 2010 + (i % 6); // 2010..2015
    const m = `0${(i % 9) + 1}`.slice(-2);
    const d = `1${i % 9}`;
    students.push(
      `ADM-${1000 + i},${fn},${ln},${y}-${m}-${d},${pick(genders, i)},${cls},${sec}`
    );
  });
  writeCsv(
    path.join(seedsDir, "students.csv"),
    "admissionNo,firstName,lastName,dob,gender,className,sectionName",
    students
  );

  // Guardians (400) — two per student
  const guardians: string[] = [];
  range(200).forEach((i) => {
    const fn1 = pick(lastNames, i);
    const fn2 = pick(lastNames, i + 1);
    guardians.push(
      `ADM-${1000 + i},father,Raj ${fn1},parent${i}@example.com,+9199${pad(
        100000 + i,
        6
      )},Apartment 12, Lakeside Colony`
    );
    guardians.push(
      `ADM-${1000 + i},mother,Meera ${fn2},parent2_${i}@example.com,+9188${pad(
        100000 + i,
        6
      )},Apartment 12, Lakeside Colony`
    );
  });
  writeCsv(
    path.join(seedsDir, "guardians.csv"),
    "studentAdmissionNo,relation,name,email,phone,address",
    guardians
  );

  // Enrollments (200)
  const enrollments = range(200).map((i) => {
    const cls = `Class ${((i % 100) + 1)}`;
    const sec = i % 2 === 0 ? "A" : "B";
    const status = i % 25 === 0 ? "transferred" : "active";
    const endDate = status === "transferred" ? "2025-03-31" : "";
    return `ADM-${1000 + i},${cls},${sec},${status},2024-06-01,${endDate}`;
  });
  writeCsv(
    path.join(seedsDir, "enrollments.csv"),
    "studentAdmissionNo,className,sectionName,status,startDate,endDate",
    enrollments
  );

  // Invoices (200)
  const invoices = range(200).map((i) => {
    const statusIdx = i % 6;
    const status = ["paid", "partial", "overdue", "void", "issued", "issued"][
      statusIdx
    ];
    const amount = 40000 + (i % 7) * 1500;
    const due = `2024-${String(((i % 9) + 1)).padStart(2, "0")}-01`;
    return `ADM-${1000 + i},2024-25,${due},${amount},${status}`;
  });
  writeCsv(
    path.join(seedsDir, "invoices.csv"),
    "studentAdmissionNo,period,dueDate,amount,status",
    invoices
  );

  // Payments (100+) referencing (studentAdmissionNo,period)
  const payments = range(120)
    .map((i) => {
      const method = ["upi", "card", "netbanking"][i % 3];
      const status = ["success", "success", "failed"][i % 3];
      const amount = [1, 0.5, 1][i % 3];
      const baseAmount = 40000 + (i % 7) * 1500;
      const paid = Math.floor(baseAmount * amount);
      const ref = `PAY-${10000 + i}`;
      return `ADM-${1000 + i},2024-25,${paid},${status},${method},mock,${ref}`;
    })
    .join("\n");
  writeCsv(
    path.join(seedsDir, "payments.csv"),
    "studentAdmissionNo,period,amount,status,method,gateway,reference",
    payments.split("\n")
  );

  // Exams (100)
  const exams = range(100).map(
    (i) => `Assessment ${i + 1},2024-${String(((i % 9) + 1)).padStart(2, "0")}-10,2024-${String(((i % 9) + 1)).padStart(2, "0")}-20`
  );
  writeCsv(path.join(seedsDir, "exams.csv"), "name,startDate,endDate", exams);

  // Exam Sessions (200)
  const examSessions: string[] = [];
  range(100).forEach((i) => {
    examSessions.push(
      `Assessment ${i + 1},math,RM-${100 + i},2024-09-${String(
        (i % 20) + 1
      ).padStart(2, "0")}`
    );
    examSessions.push(
      `Assessment ${i + 1},science,RM-${200 + i},2024-09-${String(
        (i % 20) + 2
      ).padStart(2, "0")}`
    );
  });
  writeCsv(
    path.join(seedsDir, "exam_sessions.csv"),
    "examName,subjectId,roomId,schedule",
    examSessions
  );

  // Marks (200)
  const marks: string[] = [];
  range(100).forEach((i) => {
    const adm = `ADM-${1000 + i}`;
    marks.push(`${adm},Assessment 1,math,78,B,`);
    marks.push(`${adm},Assessment 1,science,64,C,`);
  });
  writeCsv(
    path.join(seedsDir, "marks.csv"),
    "studentAdmissionNo,examName,subjectId,rawMarks,grade,comments",
    marks
  );

  // Fee Structures (100) and Components (300)
  const feeStructures = range(100).map((i) => `grade-${(i % 12) + 1}`);
  writeCsv(path.join(seedsDir, "fee_structures.csv"), "gradeId", feeStructures);

  const feeComponents: string[] = [];
  feeStructures.forEach((g, i) => {
    feeComponents.push(`${g},tuition,tuition,${25000 + (i % 5) * 1000}`);
    feeComponents.push(`${g},library,library,${1500 + (i % 3) * 250}`);
    feeComponents.push(`${g},lab,lab,${2000 + (i % 4) * 500}`);
  });
  writeCsv(
    path.join(seedsDir, "fee_components.csv"),
    "feeStructureGradeId,name,type,amount",
    feeComponents
  );

  // Applications (100)
  const applications = range(100).map((i) => {
    const sub = `demo-${(i % 100) + 1}`;
    const programId = `p${(i % 10) + 1}`;
    const profile = `profile-${i + 1}`;
    const status = [
      "pending",
      "verified",
      "offered",
      "accepted",
      "waitlisted",
      "rejected",
    ][i % 6];
    const score = 60 + (i % 41);
    const tag = i % 7 === 0 ? "sports" : i % 7 === 1 ? "alumni" : "";
    const createdAt = `2024-${String(((i % 12) + 1)).padStart(2, "0")}-${String(
      (i % 28) + 1
    ).padStart(2, "0")}T09:00:00Z`;
    return `${sub},${programId},${profile},${status},${score},${tag},${createdAt}`;
  });
  writeCsv(
    path.join(seedsDir, "applications.csv"),
    "tenantSubdomain,programId,studentProfileRef,status,score,priorityTag,createdAt",
    applications
  );

  // Staff (100)
  const staff = range(100).map((i) => {
    const fn = `StaffFirst${i + 1}`;
    const ln = `StaffLast${i + 1}`;
    const email = `staff${i + 1}@example.com`;
    const phone = `+9197000${String(10000 + i).slice(-5)}`;
    const designation = ["Teacher", "Administrator", "Counselor", "Accountant"][i % 4];
    const department = ["Academics", "Admin", "Finance", "Support"][i % 4];
    const empType = i % 3 === 0 ? "full-time" : i % 3 === 1 ? "part-time" : "contract";
    const joinDate = `201${i % 10}-0${(i % 9) + 1}-1${i % 9}`;
    const status = i % 17 === 0 ? "inactive" : "active";
    return `${fn},${ln},${email},${phone},${designation},${department},${empType},${joinDate},${status}`;
  });
  writeCsv(
    path.join(seedsDir, "staff.csv"),
    "firstName,lastName,email,phone,designation,department,employmentType,joinDate,status",
    staff
  );

  // Attendance (200)
  const attendance: string[] = [];
  range(100).forEach((i) => {
    const adm = `ADM-${1000 + i}`;
    attendance.push(
      `${adm},2024-09-${String((i % 10) + 1).padStart(2, "0")},P,,teacher,manual`
    );
    attendance.push(
      `${adm},2024-09-${String((i % 10) + 2).padStart(2, "0")},L,late bus,system,rfid`
    );
  });
  writeCsv(
    path.join(seedsDir, "attendance_records.csv"),
    "studentAdmissionNo,date,status,reason,markedBy,source",
    attendance
  );

  console.log(`Generated CSVs in ${seedsDir}`);
}

main();
