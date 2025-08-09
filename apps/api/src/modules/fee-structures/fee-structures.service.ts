import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';

export type FeeStructure = { gradeId: string };
export type FeeComponent = { feeStructureGradeId: string; name: string; type?: string; amount: number };

@Injectable()
export class FeeStructuresService {
  private structures: FeeStructure[] = [];
  private components: FeeComponent[] = [];

  constructor() {
    const root = path.resolve(__dirname, '../../../../..');
    const fsCsv = path.join(root, 'docs/Seeds/fee_structures.csv');
    const fcCsv = path.join(root, 'docs/Seeds/fee_components.csv');
    if (fs.existsSync(fsCsv)) {
      const lines = fs
        .readFileSync(fsCsv, 'utf-8')
        .split(/\r?\n/)
        .filter(Boolean)
        .slice(1);
      this.structures = lines.map((l) => ({ gradeId: l.split(',')[0] } as FeeStructure));
    }
    if (fs.existsSync(fcCsv)) {
      const lines = fs
        .readFileSync(fcCsv, 'utf-8')
        .split(/\r?\n/)
        .filter(Boolean)
        .slice(1);
      this.components = lines.map((l) => {
        const [feeStructureGradeId, name, type, amount] = l.split(',');
        return { feeStructureGradeId, name, type, amount: Number(amount) } as FeeComponent;
      });
    }
  }

  list(params: { page?: number; pageSize?: number; sort?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    let data = this.structures.map((s) => ({
      id: s.gradeId,
      gradeId: s.gradeId,
      components: this.components.filter((c) => c.feeStructureGradeId === s.gradeId),
    }));

    if (params.sort) {
      const fields = params.sort.split(',');
      data.sort((a: any, b: any) => {
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
