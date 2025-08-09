import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';

export type Payment = {
  studentAdmissionNo: string;
  period?: string;
  amount?: number;
  status?: string;
  method?: string;
  gateway?: string;
  reference?: string;
};

@Injectable()
export class PaymentsService {
  private payments: Payment[] = [];

  constructor() {
    const root = path.resolve(__dirname, '../../../../..');
    const csvPath = path.join(root, 'docs/Seeds/payments.csv');
    if (fs.existsSync(csvPath)) {
      const lines = fs
        .readFileSync(csvPath, 'utf-8')
        .split(/\r?\n/)
        .filter(Boolean)
        .slice(1);
      this.payments = lines.map((l) => {
        const [studentAdmissionNo, period, amount, status, method, gateway, reference] = l.split(',');
        return {
          studentAdmissionNo,
          period,
          amount: amount ? Number(amount) : undefined,
          status,
          method,
          gateway,
          reference,
        } as Payment;
      });
    }
  }

  list(params: { page?: number; pageSize?: number; sort?: string; status?: string; method?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    let data = [...this.payments];
    if (params.status) data = data.filter((p) => p.status === params.status);
    if (params.method) data = data.filter((p) => p.method === params.method);

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
