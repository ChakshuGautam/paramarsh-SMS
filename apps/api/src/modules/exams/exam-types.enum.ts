export enum ExamType {
  UNIT_TEST = 'UNIT_TEST',           // Small periodic tests (10-20% weightage)
  MONTHLY_TEST = 'MONTHLY_TEST',     // Monthly assessments (10-15% weightage)
  QUARTERLY = 'QUARTERLY',           // Quarter-end exams (20-25% weightage)
  HALF_YEARLY = 'HALF_YEARLY',       // Mid-year exams (30-40% weightage)
  ANNUAL = 'ANNUAL',                 // Final exams (40-50% weightage)
  PRE_BOARD = 'PRE_BOARD',          // Practice exams for board classes
  BOARD_EXAM = 'BOARD_EXAM',        // Board examinations
  REMEDIAL = 'REMEDIAL',            // Re-examination
  PRACTICAL = 'PRACTICAL',          // Lab/practical exams
  ORAL = 'ORAL',                    // Viva/oral examinations
  PROJECT = 'PROJECT',               // Project submissions
  ASSIGNMENT = 'ASSIGNMENT'         // Regular assignments
}

export enum ExamStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESULTS_PENDING = 'RESULTS_PENDING',
  RESULTS_PUBLISHED = 'RESULTS_PUBLISHED'
}

export enum BoardType {
  CBSE = 'CBSE',
  ICSE = 'ICSE',
  STATE_BOARD = 'STATE_BOARD',
  IB = 'IB',
  CAMBRIDGE = 'CAMBRIDGE',
  CUSTOM = 'CUSTOM'
}

export enum GradingType {
  MARKS = 'MARKS',
  GRADE = 'GRADE',
  CGPA = 'CGPA',
  PERCENTAGE = 'PERCENTAGE'
}

// Exam type configurations with typical weightages
export const EXAM_TYPE_CONFIG = {
  [ExamType.UNIT_TEST]: {
    label: 'Unit Test',
    typicalWeightage: 10,
    duration: 1, // days
    description: 'Small periodic tests covering specific units'
  },
  [ExamType.MONTHLY_TEST]: {
    label: 'Monthly Test',
    typicalWeightage: 15,
    duration: 2,
    description: 'Monthly assessments of student progress'
  },
  [ExamType.QUARTERLY]: {
    label: 'Quarterly Exam',
    typicalWeightage: 25,
    duration: 5,
    description: 'End of quarter comprehensive exam'
  },
  [ExamType.HALF_YEARLY]: {
    label: 'Half Yearly Exam',
    typicalWeightage: 35,
    duration: 7,
    description: 'Mid-year comprehensive examination'
  },
  [ExamType.ANNUAL]: {
    label: 'Annual/Final Exam',
    typicalWeightage: 50,
    duration: 10,
    description: 'Year-end final examination'
  },
  [ExamType.PRE_BOARD]: {
    label: 'Pre-Board Exam',
    typicalWeightage: 0, // Practice exam
    duration: 10,
    description: 'Practice examination for board classes'
  },
  [ExamType.BOARD_EXAM]: {
    label: 'Board Exam',
    typicalWeightage: 100,
    duration: 15,
    description: 'Official board examination'
  },
  [ExamType.REMEDIAL]: {
    label: 'Remedial Exam',
    typicalWeightage: 0,
    duration: 1,
    description: 'Re-examination for failed students'
  },
  [ExamType.PRACTICAL]: {
    label: 'Practical Exam',
    typicalWeightage: 20,
    duration: 1,
    description: 'Laboratory or practical examination'
  },
  [ExamType.ORAL]: {
    label: 'Oral/Viva',
    typicalWeightage: 10,
    duration: 1,
    description: 'Oral examination or viva voce'
  },
  [ExamType.PROJECT]: {
    label: 'Project Work',
    typicalWeightage: 15,
    duration: 30,
    description: 'Project submission and evaluation'
  },
  [ExamType.ASSIGNMENT]: {
    label: 'Assignment',
    typicalWeightage: 5,
    duration: 7,
    description: 'Regular assignments'
  }
};