import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';

export type Attendance = {
  studentAdmissionNo: string;
  date: string;
  status?: string;
  reason?: string;
  markedBy?: string;
  source?: string;
};

@Injectable()
export class AttendanceService {
  private rows: Attendance[] = [];

  constructor() {
    const root = path.resolve(__dirname, '../../../../..');
    const csvPath = path.join(root, 'docs/Seeds/attendance_records.csv');
    if (fs.existsSync(csvPath)) {
      const lines = fs
        .readFileSync(csvPath, 'utf-8')
        .split(/\r?\n/)
        .filter(Boolean)
        .slice(1);
      this.rows = lines.map((l) => {
        const [studentAdmissionNo, date, status, reason, markedBy, source] = l.split(',');
        return { studentAdmissionNo, date, status, reason, markedBy, source } as Attendance;
      });
    }
  }

  list(params: { page?: number; pageSize?: number; sort?: string; studentAdmissionNo?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    let data = [...this.rows];
    if (params.studentAdmissionNo) data = data.filter((r) => r.studentAdmissionNo === params.studentAdmissionNo);

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
