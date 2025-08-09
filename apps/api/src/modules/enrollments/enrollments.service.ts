import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';

export type Enrollment = {
  studentAdmissionNo: string;
  className: string;
  sectionName: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

@Injectable()
export class EnrollmentsService {
  private enrollments: Enrollment[] = [];

  constructor() {
    const root = path.resolve(__dirname, '../../../../..');
    const csvPath = path.join(root, 'docs/Seeds/enrollments.csv');
    if (fs.existsSync(csvPath)) {
      const lines = fs
        .readFileSync(csvPath, 'utf-8')
        .split(/\r?\n/)
        .filter(Boolean)
        .slice(1);
      this.enrollments = lines.map((l) => {
        const [studentAdmissionNo, className, sectionName, status, startDate, endDate] = l.split(',');
        return { studentAdmissionNo, className, sectionName, status, startDate, endDate } as Enrollment;
      });
    }
  }

  list(params: { page?: number; pageSize?: number; sort?: string; className?: string; sectionName?: string; status?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    let data = [...this.enrollments];
    if (params.className) data = data.filter((e) => e.className === params.className);
    if (params.sectionName) data = data.filter((e) => e.sectionName === params.sectionName);
    if (params.status) data = data.filter((e) => e.status === params.status);

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
