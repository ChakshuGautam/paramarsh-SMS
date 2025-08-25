import { computeVisibleResources } from '@/app/admin/permissions';

const defs = {
  students: { hasList: true },
  guardians: { hasList: true },
  exams: { hasList: true },
  classes: { hasList: true },
  sections: { hasList: true },
  enrollments: { hasList: true },
  marks: { hasList: true },
  invoices: { hasList: true },
  payments: { hasList: true },
  attendanceRecords: { hasList: true },
};

describe('computeVisibleResources', () => {
  test('admin sees all', () => {
    const res = computeVisibleResources(defs as any, ['admin']);
    expect(res.sort()).toEqual(Object.keys(defs).sort());
  });
  test('teacher sees subset', () => {
    const res = computeVisibleResources(defs as any, ['teacher']);
    expect(res.sort()).toEqual(
      [
        'classes',
        'sections',
        'students',
<<<<<<< HEAD
        'guardians',        // Teachers CAN see guardians (per permissions.ts line 18)
=======
>>>>>>> origin/main
        'attendanceRecords',
        'marks',
        'exams',
        'enrollments',
<<<<<<< HEAD
        'invoices',         // Teachers CAN see invoices (per permissions.ts line 49)
        'payments',         // Teachers CAN see payments (per permissions.ts line 50)
=======
>>>>>>> origin/main
      ].sort()
    );
  });
  test('no roles sees none', () => {
    const res = computeVisibleResources(defs as any, []);
    expect(res).toEqual([]);
  });
});
