import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';

export type Student = {
  admissionNo: string;
  firstName: string;
  lastName: string;
  dob?: string;
  gender?: string;
  className: string;
  sectionName: string;
};

@Injectable()
export class StudentsService {
  private students: Student[] = [];

  constructor() {
    const root = path.resolve(__dirname, '../../../../..');
    const csvPath = path.join(root, 'docs/Seeds/students.csv');
    if (fs.existsSync(csvPath)) {
      const lines = fs
        .readFileSync(csvPath, 'utf-8')
        .split(/\r?\n/)
        .filter(Boolean)
        .slice(1);
      this.students = lines.map((l) => {
        const [admissionNo, firstName, lastName, dob, gender, className, sectionName] = l.split(',');
        return { admissionNo, firstName, lastName, dob, gender, className, sectionName } as Student;
      });
    }
  }

  list(params: { page?: number; pageSize?: number; sort?: string; q?: string; className?: string; sectionName?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    let data = [...this.students];
    if (params.className) data = data.filter((s) => s.className === params.className);
    if (params.sectionName) data = data.filter((s) => s.sectionName === params.sectionName);
    if (params.q) {
      const q = params.q.toLowerCase();
      data = data.filter(
        (s) =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.admissionNo.toLowerCase().includes(q),
      );
    }

    if (params.sort) {
      const fields = params.sort.split(',');
      data.sort((a, b) => {
        for (const f of fields) {
          const desc = f.startsWith('-');
          const key = desc ? f.slice(1) : f;
          const av = (a as any)[key];
          const bv = (b as any)[key];
          if (av === bv) continue;
          return (av > bv ? 1 : -1) * (desc ? -1 : 1);
        }
        return 0;
      });
    }

    const total = data.length;
    const pageData = data.slice(skip, skip + pageSize);
    return { data: pageData, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }
}
