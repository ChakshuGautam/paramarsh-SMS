import request = require('supertest');
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('API E2E', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;

  beforeAll(async () => {
    process.env.PORT = '0';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        validationError: { target: false },
      }),
    );
    await app.init();
    const server = app.getHttpServer();
    http = request(server);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create class, section, student with guardians+enrollment, then cascade delete', async () => {
    // Create class
    const clsRes = await http
      .post('/api/v1/classes')
      .send({ name: `Class E2E`, gradeLevel: 7 })
      .expect(201);
    const classId = clsRes.body.data.id;

    // Create section
    const secRes = await http
      .post('/api/v1/sections')
      .send({ classId, name: 'A', capacity: 40 })
      .expect(201);
    const sectionId = secRes.body.data.id;

    // Create student with guardians and enrollment
    const stuRes = await http
      .post('/api/v1/students')
      .send({
        firstName: 'E2E',
        lastName: 'Student',
        gender: 'male',
        guardians: [
          { relation: 'father', name: 'Parent One', email: 'p1@example.com' },
          { relation: 'mother', name: 'Parent Two', email: 'p2@example.com' },
        ],
        enrollment: { sectionId, status: 'active', startDate: '2024-06-01' },
      })
      .expect(201);
    const studentId = stuRes.body.data.id;

    // Guardians should be present
    const guaList = await http
      .get('/api/v1/guardians')
      .query({ studentId, pageSize: 10 })
      .expect(200);
    expect(guaList.body.data.length).toBeGreaterThanOrEqual(2);

    // Enrollment should be present
    const enrList = await http
      .get('/api/v1/enrollments')
      .query({ sectionId, pageSize: 10 })
      .expect(200);
    expect(
      enrList.body.data.find((e: any) => e.studentId === studentId),
    ).toBeTruthy();

    // Delete student -> cascade guardians/enrollments
    await http.delete(`/api/v1/students/${studentId}`).expect(200);

    const guaListAfter = await http
      .get('/api/v1/guardians')
      .query({ studentId, pageSize: 10 })
      .expect(200);
    expect(guaListAfter.body.data.length).toBe(0);

    const enrListAfter = await http
      .get('/api/v1/enrollments')
      .query({ sectionId, pageSize: 10 })
      .expect(200);
    expect(
      enrListAfter.body.data.find((e: any) => e.studentId === studentId),
    ).toBeFalsy();
  });

  it('should create invoice with payment and cascade delete invoice->payments', async () => {
    // Create a student first
    const sres = await http
      .post('/api/v1/students')
      .send({ firstName: 'Bill', lastName: 'Payer' })
      .expect(201);
    const studentId = sres.body.data.id;

    // Create an invoice with auto-payment
    const invRes = await http
      .post('/api/v1/fees/invoices')
      .send({ studentId, amount: 12345, status: 'issued', withPayment: true })
      .expect(201);
    const invoiceId = invRes.body.data.id;

    // Payment should exist
    const payList = await http
      .get('/api/v1/fees/payments')
      .query({ invoiceId })
      .expect(200);
    expect(payList.body.data.length).toBeGreaterThanOrEqual(1);

    // Delete invoice -> payments vanish
    await http.delete(`/api/v1/fees/invoices/${invoiceId}`).expect(200);

    const payListAfter = await http
      .get('/api/v1/fees/payments')
      .query({ invoiceId })
      .expect(200);
    expect(payListAfter.body.data.length).toBe(0);
  });

  it('should create fee structure and components and delete them', async () => {
    const fsRes = await http
      .post('/api/v1/fees/structures')
      .send({ gradeId: 'grade-x' })
      .expect(201);
    const feeStructureId = fsRes.body.data.id;

    const fc1 = await http
      .post('/api/v1/fees/structures/components')
      .send({ feeStructureId, name: 'tuition', type: 'tuition', amount: 1000 })
      .expect(201);
    const compId = fc1.body.data.id;

    const list = await http
      .get('/api/v1/fees/structures')
      .query({ pageSize: 5 })
      .expect(200);
    expect(
      list.body.data.find((s: any) => s.id === feeStructureId),
    ).toBeTruthy();

    await http
      .delete(`/api/v1/fees/structures/components/${compId}`)
      .expect(200);
    await http.delete(`/api/v1/fees/structures/${feeStructureId}`).expect(200);
  });

  it('should create staff and filter by department', async () => {
    const s1 = await http
      .post('/api/v1/hr/staff')
      .send({ firstName: 'Alice', lastName: 'Admin', department: 'Admin' })
      .expect(201);
    expect(s1.body.data.id).toBeDefined();

    const list = await http
      .get('/api/v1/hr/staff')
      .query({ department: 'Admin' })
      .expect(200);
    expect(
      list.body.data.find((s: any) => s.firstName === 'Alice'),
    ).toBeTruthy();
  });
});
