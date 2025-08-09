import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';

export type Staff = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  employmentType?: string;
  joinDate?: string;
  status?: string;
};

@Injectable()
export class StaffService {
  private staff: Staff[] = [];

  constructor() {
    const root = path.resolve(__dirname, '../../../../..');
    const csvPath = path.join(root, 'docs/Seeds/staff.csv');
    if (fs.existsSync(csvPath)) {
      const lines = fs
        .readFileSync(csvPath, 'utf-8')
        .split(/\r?\n/)
        .filter(Boolean)
        .slice(1);
      this.staff = lines.map((l) => {
        const [firstName, lastName, email, phone, designation, department, employmentType, joinDate, status] = l.split(',');
        return { firstName, lastName, email, phone, designation, department, employmentType, joinDate, status } as Staff;
      });
    }
  }

  list(params: { page?: number; pageSize?: number; sort?: string; department?: string; status?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    let data = [...this.staff];
    if (params.department) data = data.filter((s) => s.department === params.department);
    if (params.status) data = data.filter((s) => s.status === params.status);

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
