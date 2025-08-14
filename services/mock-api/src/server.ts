// @ts-nocheck
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

type ListQuery = {
  page?: string;
  pageSize?: string;
  sort?: string;
};

function parsePagination(query: ListQuery) {
  const page = Math.max(1, Number(query.page ?? 1));
  const pageSize = Math.min(200, Math.max(1, Number(query.pageSize ?? 25)));
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  return { page, pageSize, skip, take };
}

function parseSort(sort?: string): { field?: string; order?: "asc" | "desc" } {
  if (!sort) return {};
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  return { field, order: desc ? "desc" : "asc" } as const;
}

// --- Multitenancy helpers (mock) ---
function getBranchId(req: any): string | undefined {
  const header = (req.headers["x-branch-id"] as string | undefined)?.trim();
  const query = (req.query as any)?.branchId as string | undefined;
  return header || query || undefined;
}

function withBranch<T extends object>(branchId?: string): Partial<T> {
  return branchId ? ({ branchId } as Partial<T>) : ({} as Partial<T>);
}

function getTenantId(req: any): string | undefined {
  const header = (req.headers["x-tenant-id"] as string | undefined)?.trim();
  const query = (req.query as any)?.tenantId as string | undefined;
  return header || query || undefined;
}

// Students
app.get("/students", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const branchId = getBranchId(req);
  const where: any = { ...(withBranch(branchId) as any) };
  if (req.query.classId) where.classId = String(req.query.classId);
  if (req.query.sectionId) where.sectionId = String(req.query.sectionId);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const [data, total] = await Promise.all([
    prisma.student.findMany({ skip, take, where, orderBy }),
    prisma.student.count({ where }),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

app.get("/students/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.student.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/students", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.student.create({ data: { ...(req.body || {}), ...withBranch(branchId) } });
  res.status(201).json({ data });
});

app.patch("/students/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.student.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const data = await prisma.student.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/students/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.student.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!existing) return res.status(404).end();
  await prisma.student.delete({ where: { id: existing.id } });
  res.status(204).end();
});

// Guardians
app.get("/guardians", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const branchId = getBranchId(req);
  const where: any = { ...(withBranch(branchId) as any) };
  if (req.query.studentId) where.studentId = String(req.query.studentId);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const [data, total] = await Promise.all([
    prisma.guardian.findMany({ skip, take, where, orderBy }),
    prisma.guardian.count({ where }),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

app.get("/guardians/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.guardian.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/guardians", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.guardian.create({ data: { ...(req.body || {}), ...withBranch(branchId) } });
  res.status(201).json({ data });
});

app.patch("/guardians/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.guardian.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const data = await prisma.guardian.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/guardians/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.guardian.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!existing) return res.status(404).end();
  await prisma.guardian.delete({ where: { id: existing.id } });
  res.status(204).end();
});

// Exams
app.get("/exams", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const branchId = getBranchId(req);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const [data, total] = await Promise.all([
    prisma.exam.findMany({ skip, take, orderBy, where: { ...(withBranch(branchId) as any) } }),
    prisma.exam.count({ where: { ...(withBranch(branchId) as any) } }),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

app.get("/exams/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.exam.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/exams", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.exam.create({ data: { ...(req.body || {}), ...withBranch(branchId) } });
  res.status(201).json({ data });
});

app.patch("/exams/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.exam.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const data = await prisma.exam.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/exams/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.exam.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).end();
  await prisma.exam.delete({ where: { id: existing.id } });
  res.status(204).end();
});

// Fee Structures
app.get("/fees/structures", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const branchId = getBranchId(req);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const [data, total] = await Promise.all([
    prisma.feeStructure.findMany({
      skip,
      take,
      orderBy,
      include: { components: true },
      where: { ...(withBranch(branchId) as any) },
    }),
    prisma.feeStructure.count({ where: { ...(withBranch(branchId) as any) } }),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

// Fee Schedules (mock)
app.get("/fees/schedules", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(req.query as ListQuery);
  const sort = parseSort((req.query as ListQuery).sort);
  const branchId = getBranchId(req);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const where: any = { ...(withBranch(branchId) as any) };
  const [data, total] = await Promise.all([
    prisma.feeSchedule.findMany({ skip, take, orderBy, where }),
    prisma.feeSchedule.count({ where }),
  ]);
  res.json({ data, meta: { page, pageSize, total, hasNext: skip + take < total } });
});

app.post("/fees/schedules", async (req, res) => {
  const branchId = getBranchId(req);
  const payload = { ...(req.body || {}), ...withBranch(branchId) };
  const data = await prisma.feeSchedule.create({ data: payload });
  res.status(201).json({ data });
});

app.patch("/fees/schedules/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.feeSchedule.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const data = await prisma.feeSchedule.update({ where: { id: existing.id }, data: req.body });
  res.json({ data });
});

app.delete("/fees/schedules/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.feeSchedule.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).end();
  await prisma.feeSchedule.delete({ where: { id: existing.id } });
  res.status(204).end();
});

app.post("/fees/schedules/:id/generate", async (req, res) => {
  const schedule = await prisma.feeSchedule.findUnique({ where: { id: req.params.id } });
  if (!schedule) return res.status(404).json({ message: "Not found" });
  if (schedule.status === "paused") return res.json({ created: 0 });

  const structure = await prisma.feeStructure.findUnique({ where: { id: schedule.feeStructureId }, include: { components: true } });
  if (!structure) return res.status(404).json({ message: "Fee structure not found" });
  const amount = (structure.components || []).reduce((sum, c) => sum + (c.amount || 0), 0);

  const students = await prisma.student.findMany({ select: { id: true } });
  const created = await Promise.all(
    students.map((s) =>
      prisma.invoice.create({ data: { studentId: s.id, period: new Date().toISOString().slice(0, 7), dueDate: new Date().toISOString().slice(0, 10), amount, status: "issued" } })
    )
  );
  res.status(202).json({ created: created.length });
});

app.get("/fees/structures/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.feeStructure.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
    include: { components: true },
  });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/fees/structures", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.feeStructure.create({ data: { ...(req.body || {}), ...withBranch(branchId) } });
  res.status(201).json({ data });
});

app.patch("/fees/structures/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.feeStructure.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const data = await prisma.feeStructure.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/fees/structures/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.feeStructure.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).end();
  await prisma.feeStructure.delete({ where: { id: existing.id } });
  res.status(204).end();
});

// Invoices
app.get("/fees/invoices", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const branchId = getBranchId(req);
  const where: any = { ...(withBranch(branchId) as any) };
  if (req.query.studentId) where.studentId = String(req.query.studentId);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const [data, total] = await Promise.all([
    prisma.invoice.findMany({ skip, take, where, orderBy }),
    prisma.invoice.count({ where }),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

app.get("/fees/invoices/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.invoice.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/fees/invoices", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.invoice.create({ data: { ...(req.body || {}), ...withBranch(branchId) } });
  res.status(201).json({ data });
});

app.patch("/fees/invoices/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.invoice.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const data = await prisma.invoice.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/fees/invoices/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.invoice.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).end();
  await prisma.invoice.delete({ where: { id: existing.id } });
  res.status(204).end();
});

// Admissions Applications
app.get("/admissions/applications", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const tenantId = getTenantId(req);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const [data, total] = await Promise.all([
    prisma.application.findMany({ skip, take, orderBy, where: tenantId ? { tenantId: String(tenantId) } : {} }),
    prisma.application.count({ where: tenantId ? { tenantId: String(tenantId) } : {} }),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

app.get("/admissions/applications/:id", async (req, res) => {
  const tenantId = getTenantId(req);
  const data = await prisma.application.findFirst({
    where: { id: req.params.id, ...(tenantId ? { tenantId: String(tenantId) } : {}) },
  });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/admissions/applications", async (req, res) => {
  const tenantId = getTenantId(req);
  const data = await prisma.application.create({ data: { ...(req.body || {}), ...(tenantId ? { tenantId: String(tenantId) } : {}) } });
  res.status(201).json({ data });
});

app.patch("/admissions/applications/:id", async (req, res) => {
  const tenantId = getTenantId(req);
  const existing = await prisma.application.findFirst({ where: { id: req.params.id, ...(tenantId ? { tenantId: String(tenantId) } : {}) } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const data = await prisma.application.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/admissions/applications/:id", async (req, res) => {
  const tenantId = getTenantId(req);
  const existing = await prisma.application.findFirst({ where: { id: req.params.id, ...(tenantId ? { tenantId: String(tenantId) } : {}) } });
  if (!existing) return res.status(404).end();
  await prisma.application.delete({ where: { id: existing.id } });
  res.status(204).end();
});

const port = Number(4010);
app.listen(port, () => {
  console.log(`Mock API listening on http://localhost:${port}`);
});

// Classes
app.get("/classes", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const branchId = getBranchId(req);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const [data, total] = await Promise.all([
    prisma.class.findMany({ skip, take, orderBy, where: { ...(withBranch(branchId) as any) } }),
    prisma.class.count({ where: { ...(withBranch(branchId) as any) } }),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

app.get("/classes/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.class.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/classes", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.class.create({ data: { ...(req.body || {}), ...withBranch(branchId) } });
  res.status(201).json({ data });
});

app.patch("/classes/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.class.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const data = await prisma.class.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/classes/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.class.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).end();
  await prisma.class.delete({ where: { id: existing.id } });
  res.status(204).end();
});

// Sections
app.get("/sections", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const branchId = getBranchId(req);
  const where: any = { ...(withBranch(branchId) as any) };
  if (req.query.classId) where.classId = String(req.query.classId);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const [data, total] = await Promise.all([
    prisma.section.findMany({ skip, take, where, orderBy }),
    prisma.section.count({ where }),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

app.get("/sections/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.section.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/sections", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.section.create({ data: { ...(req.body || {}), ...withBranch(branchId) } });
  res.status(201).json({ data });
});

app.patch("/sections/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.section.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const data = await prisma.section.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/sections/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.section.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).end();
  await prisma.section.delete({ where: { id: existing.id } });
  res.status(204).end();
});

// Enrollments
app.get("/enrollments", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const branchId = getBranchId(req);
  const where: any = { ...(withBranch(branchId) as any) };
  if (req.query.studentId) where.studentId = String(req.query.studentId);
  if (req.query.sectionId) where.sectionId = String(req.query.sectionId);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const [data, total] = await Promise.all([
    prisma.enrollment.findMany({ skip, take, where, orderBy }),
    prisma.enrollment.count({ where }),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

app.get("/enrollments/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.enrollment.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/enrollments", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.enrollment.create({ data: { ...(req.body || {}), ...withBranch(branchId) } });
  res.status(201).json({ data });
});

app.patch("/enrollments/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.enrollment.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const data = await prisma.enrollment.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/enrollments/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.enrollment.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).end();
  await prisma.enrollment.delete({ where: { id: existing.id } });
  res.status(204).end();
});

// Payments
app.get("/fees/payments", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const branchId = getBranchId(req);
  const where: any = { ...(withBranch(branchId) as any) };
  if (req.query.invoiceId) where.invoiceId = String(req.query.invoiceId);
  if (req.query.status) where.status = String(req.query.status);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const [data, total] = await Promise.all([
    prisma.payment.findMany({ skip, take, where, orderBy }),
    prisma.payment.count({ where }),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

app.get("/fees/payments/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.payment.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/fees/payments", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.payment.create({ data: { ...(req.body || {}), ...withBranch(branchId) } });
  res.status(201).json({ data });
});

app.patch("/fees/payments/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.payment.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const data = await prisma.payment.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/fees/payments/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.payment.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).end();
  await prisma.payment.delete({ where: { id: existing.id } });
  res.status(204).end();
});

// Marks
app.get("/marks", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const branchId = getBranchId(req);
  const where: any = { ...(withBranch(branchId) as any) };
  if (req.query.sessionId) where.sessionId = String(req.query.sessionId);
  if (req.query.studentId) where.studentId = String(req.query.studentId);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const [data, total] = await Promise.all([
    prisma.marksEntry.findMany({ skip, take, where, orderBy }),
    prisma.marksEntry.count({ where }),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

app.get("/marks/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.marksEntry.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/marks", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.marksEntry.create({ data: { ...(req.body || {}), ...withBranch(branchId) } });
  res.status(201).json({ data });
});

app.patch("/marks/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.marksEntry.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const data = await prisma.marksEntry.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/marks/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.marksEntry.findFirst({ where: { id: req.params.id, ...(withBranch(branchId) as any) } });
  if (!existing) return res.status(404).end();
  await prisma.marksEntry.delete({ where: { id: existing.id } });
  res.status(204).end();
});

// Attendance
app.get("/attendance/records", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const where: any = {};
  if (req.query.studentId) where.studentId = String(req.query.studentId);
  // Demo-only simple filter (from/to as yyyy-mm-dd)
  const orderBy = sort.field ? { [sort.field]: sort.order } : { date: "desc" };
  const [data, total] = await Promise.all([
    prisma.attendanceRecord.findMany({ skip, take, where, orderBy }),
    prisma.attendanceRecord.count({ where }),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

app.get("/attendance/records/:id", async (req, res) => {
  const data = await prisma.attendanceRecord.findUnique({
    where: { id: req.params.id },
  });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/attendance/records", async (req, res) => {
  const data = await prisma.attendanceRecord.create({ data: req.body });
  res.status(201).json({ data });
});

app.patch("/attendance/records/:id", async (req, res) => {
  const data = await prisma.attendanceRecord.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/attendance/records/:id", async (req, res) => {
  await prisma.attendanceRecord.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// HR - Staff
app.get("/hr/staff", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const [data, total] = await Promise.all([
    prisma.staff.findMany({ skip, take, orderBy }),
    prisma.staff.count(),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

app.get("/hr/staff/:id", async (req, res) => {
  const data = await prisma.staff.findUnique({ where: { id: req.params.id } });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/hr/staff", async (req, res) => {
  const data = await prisma.staff.create({ data: req.body });
  res.status(201).json({ data });
});

app.patch("/hr/staff/:id", async (req, res) => {
  const data = await prisma.staff.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/hr/staff/:id", async (req, res) => {
  await prisma.staff.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// HR - Teachers (first-class)
app.get("/hr/teachers", async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(
    req.query as ListQuery,
  );
  const sort = parseSort((req.query as ListQuery).sort);
  const branchId = getBranchId(req);
  const orderBy = sort.field ? { [sort.field]: sort.order } : { id: "asc" };
  const where: any = { ...(withBranch(branchId) as any) };
  const [data, total] = await Promise.all([
    prisma.teacher.findMany({ skip, take, orderBy, where }),
    prisma.teacher.count({ where }),
  ]);
  res.json({
    data,
    meta: { page, pageSize, total, hasNext: skip + take < total },
  });
});

app.get("/hr/teachers/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const data = await prisma.teacher.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ data });
});

app.post("/hr/teachers", async (req, res) => {
  const branchId = getBranchId(req);
  const payload = { ...(req.body || {}), ...withBranch(branchId) };
  const data = await prisma.teacher.create({ data: payload });
  res.status(201).json({ data });
});

app.patch("/hr/teachers/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.teacher.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const data = await prisma.teacher.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ data });
});

app.delete("/hr/teachers/:id", async (req, res) => {
  const branchId = getBranchId(req);
  const existing = await prisma.teacher.findFirst({
    where: { id: req.params.id, ...(withBranch(branchId) as any) },
  });
  if (!existing) return res.status(404).end();
  await prisma.teacher.delete({ where: { id: existing.id } });
  res.status(204).end();
});
