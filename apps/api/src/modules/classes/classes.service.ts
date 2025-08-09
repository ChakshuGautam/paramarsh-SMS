import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';

export type ClassRow = { name: string; gradeLevel?: number };

@Injectable()
export class ClassesService {
  private classes: ClassRow[] = [];

  constructor() {
    const root = path.resolve(__dirname, '../../../../..');
    const csvPath = path.join(root, 'docs/Seeds/classes.csv');
    if (fs.existsSync(csvPath)) {
      const lines = fs
        .readFileSync(csvPath, 'utf-8')
        .split(/\r?\n/)
        .filter(Boolean)
        .slice(1);
      this.classes = lines.map((l) => {
        const [name, gradeLevel] = l.split(',');
        return {
          name,
          gradeLevel: gradeLevel ? Number(gradeLevel) : undefined,
        } as ClassRow;
      });
    }
  }

  list(params: {
    page?: number;
    pageSize?: number;
    sort?: string;
    q?: string;
  }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    let data = [...this.classes];
    if (params.q) {
      const q = params.q.toLowerCase();
      data = data.filter((c) => c.name.toLowerCase().includes(q));
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
    return {
      data: pageData,
      meta: { page, pageSize, total, hasNext: skip + pageSize < total },
    };
  }
}
