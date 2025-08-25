/**
 * Grade-Level Subject Appropriateness Mapping
 * 
 * This configuration defines which subjects are appropriate for each grade level.
 * It prevents inappropriate assignments like Geography for Nursery students.
 */

export interface SubjectMapping {
  code: string;
  name: string;
  minGrade: number;
  maxGrade?: number;
  category: 'core' | 'elective' | 'activity' | 'science' | 'language' | 'arts';
  description?: string;
}

export const GRADE_SUBJECT_MAPPING: SubjectMapping[] = [
  // ========== EARLY CHILDHOOD (Nursery=0, LKG=1, UKG=2) ==========
  { 
    code: 'ENG_BASIC', 
    name: 'English', 
    minGrade: 0, 
    maxGrade: 12, 
    category: 'core',
    description: 'Basic English language learning appropriate for all ages'
  },
  { 
    code: 'HINDI_BASIC', 
    name: 'Hindi', 
    minGrade: 0, 
    maxGrade: 12, 
    category: 'language',
    description: 'Basic Hindi language learning'
  },
  { 
    code: 'MATH_BASIC', 
    name: 'Mathematics', 
    minGrade: 0, 
    maxGrade: 12, 
    category: 'core',
    description: 'Age-appropriate mathematics concepts'
  },
  { 
    code: 'ART', 
    name: 'Art & Craft', 
    minGrade: 0, 
    maxGrade: 12, 
    category: 'arts',
    description: 'Creative arts and crafts activities'
  },
  { 
    code: 'MUS', 
    name: 'Music', 
    minGrade: 0, 
    maxGrade: 12, 
    category: 'arts',
    description: 'Music education and singing'
  },
  { 
    code: 'PE', 
    name: 'Physical Education', 
    minGrade: 0, 
    maxGrade: 12, 
    category: 'activity',
    description: 'Physical fitness and sports activities'
  },
  { 
    code: 'ENV_SCIENCE', 
    name: 'Environmental Science', 
    minGrade: 0, 
    maxGrade: 4, 
    category: 'science',
    description: 'Basic environmental awareness and nature studies'
  },

  // ========== PRIMARY GRADES (1-5) ==========
  { 
    code: 'SCI_BASIC', 
    name: 'Science', 
    minGrade: 3, 
    maxGrade: 7, 
    category: 'science',
    description: 'Integrated science covering basic concepts'
  },
  { 
    code: 'SST_BASIC', 
    name: 'Social Studies', 
    minGrade: 3, 
    maxGrade: 7, 
    category: 'core',
    description: 'Basic social studies including civics and general knowledge'
  },
  { 
    code: 'COMP_BASIC', 
    name: 'Computer Science', 
    minGrade: 3, 
    maxGrade: 12, 
    category: 'elective',
    description: 'Basic computer literacy and programming concepts'
  },
  { 
    code: 'SANS', 
    name: 'Sanskrit', 
    minGrade: 5, 
    maxGrade: 12, 
    category: 'language',
    description: 'Classical Sanskrit language'
  },

  // ========== MIDDLE GRADES (6-8) ==========
  { 
    code: 'HIST_INTRO', 
    name: 'History', 
    minGrade: 6, 
    maxGrade: 12, 
    category: 'core',
    description: 'Historical studies and world civilizations'
  },
  { 
    code: 'GEO_INTRO', 
    name: 'Geography', 
    minGrade: 6, 
    maxGrade: 12, 
    category: 'core',
    description: 'Physical and human geography'
  },

  // ========== SECONDARY GRADES (9-10) ==========
  { 
    code: 'PHY', 
    name: 'Physics', 
    minGrade: 9, 
    maxGrade: 12, 
    category: 'science',
    description: 'Principles of physics and natural phenomena'
  },
  { 
    code: 'CHEM', 
    name: 'Chemistry', 
    minGrade: 9, 
    maxGrade: 12, 
    category: 'science',
    description: 'Chemical reactions and molecular structures'
  },
  { 
    code: 'BIO', 
    name: 'Biology', 
    minGrade: 9, 
    maxGrade: 12, 
    category: 'science',
    description: 'Life sciences and biological processes'
  },
  { 
    code: 'ECO', 
    name: 'Economics', 
    minGrade: 9, 
    maxGrade: 12, 
    category: 'elective',
    description: 'Economic principles and market systems'
  },
  { 
    code: 'POL', 
    name: 'Political Science', 
    minGrade: 9, 
    maxGrade: 12, 
    category: 'elective',
    description: 'Government systems and political theory'
  },

  // ========== SENIOR SECONDARY (11-12) ==========
  { 
    code: 'PHIL', 
    name: 'Philosophy', 
    minGrade: 11, 
    maxGrade: 12, 
    category: 'elective',
    description: 'Philosophical thought and ethics'
  },
  { 
    code: 'PSY', 
    name: 'Psychology', 
    minGrade: 11, 
    maxGrade: 12, 
    category: 'elective',
    description: 'Human behavior and mental processes'
  },
  { 
    code: 'SOC', 
    name: 'Sociology', 
    minGrade: 11, 
    maxGrade: 12, 
    category: 'elective',
    description: 'Society and human relationships'
  }
];

/**
 * Get subjects appropriate for a specific grade level
 */
export function getSubjectsForGrade(gradeLevel: number): SubjectMapping[] {
  return GRADE_SUBJECT_MAPPING.filter(subject => 
    gradeLevel >= subject.minGrade && 
    (subject.maxGrade === undefined || gradeLevel <= subject.maxGrade)
  );
}

/**
 * Check if a subject is appropriate for a given grade level
 */
export function isSubjectAppropriateForGrade(subjectName: string, gradeLevel: number): boolean {
  const subject = GRADE_SUBJECT_MAPPING.find(s => s.name === subjectName);
  if (!subject) return false;
  
  return gradeLevel >= subject.minGrade && 
         (subject.maxGrade === undefined || gradeLevel <= subject.maxGrade);
}

/**
 * Get inappropriate subject assignments for validation
 */
export function validateSubjectGradeAssignment(subjectName: string, gradeLevel: number): {
  isValid: boolean;
  message?: string;
  suggestion?: string;
} {
  const subject = GRADE_SUBJECT_MAPPING.find(s => s.name === subjectName);
  
  if (!subject) {
    return {
      isValid: false,
      message: `Subject "${subjectName}" is not recognized in the curriculum`,
      suggestion: 'Please use one of the predefined subjects or add it to the mapping'
    };
  }

  if (gradeLevel < subject.minGrade) {
    const gradeNames = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 
                       'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 
                       'Class 9', 'Class 10', 'Class 11', 'Class 12'];
    
    const minGradeName = subject.minGrade < gradeNames.length ? gradeNames[subject.minGrade] : `Grade ${subject.minGrade}`;
    const currentGradeName = gradeLevel < gradeNames.length ? gradeNames[gradeLevel] : `Grade ${gradeLevel}`;
    
    return {
      isValid: false,
      message: `${subjectName} is not appropriate for ${currentGradeName}. It should start from ${minGradeName}`,
      suggestion: subject.category === 'science' && gradeLevel < 6 ? 
        'Consider using "Environmental Science" or "Science" for younger grades' :
        'Please select an age-appropriate subject'
    };
  }

  if (subject.maxGrade && gradeLevel > subject.maxGrade) {
    return {
      isValid: false,
      message: `${subjectName} is typically completed by Grade ${subject.maxGrade}`,
      suggestion: 'Consider selecting an advanced alternative or specialized course'
    };
  }

  return { isValid: true };
}

/**
 * Grade level mapping for Indian education system
 */
export const GRADE_LEVEL_MAPPING: Record<string, number> = {
  'Nursery': 0,
  'LKG': 1,
  'UKG': 2,
  'Class 1': 3,
  'Class 2': 4,
  'Class 3': 5,
  'Class 4': 6,
  'Class 5': 7,
  'Class 6': 8,
  'Class 7': 9,
  'Class 8': 10,
  'Class 9': 11,
  'Class 10': 12,
  'Class 11': 13,
  'Class 12': 14
};

/**
 * Convert class name to grade level
 */
export function getGradeLevelFromClassName(className: string): number {
  return GRADE_LEVEL_MAPPING[className] || 0;
}