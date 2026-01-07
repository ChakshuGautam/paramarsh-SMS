/**
 * Indian Context Data Constants for Seed Data Manager v3.0
 * Authentic Indian names, locations, and cultural data
 * Following TDD methodology and Indian educational context
 */

export const INDIAN_NAMES = {
  male: {
    first: [
      'Aarav', 'Arjun', 'Vivaan', 'Aditya', 'Ishaan', 'Pranav', 'Reyansh', 'Krishna', 'Sai', 'Arnav',
      'Ayaan', 'Atharva', 'Aryan', 'Kabir', 'Avinash', 'Rohan', 'Rudra', 'Vedant', 'Yash', 'Dhruv',
      'Kartik', 'Gaurav', 'Harsh', 'Mihir', 'Nikhil', 'Parth', 'Rishi', 'Samarth', 'Tanish', 'Utkarsh',
      'Varun', 'Viraj', 'Abhishek', 'Akash', 'Aman', 'Ankit', 'Ashwin', 'Dev', 'Karthik', 'Manish',
      'Neeraj', 'Piyush', 'Rahul', 'Rajat', 'Sanjay', 'Shivam', 'Siddharth', 'Surya', 'Tarun', 'Vishal'
    ],
    last: [
      'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Rao', 'Patel', 'Shah', 'Mehta',
      'Joshi', 'Desai', 'Nair', 'Menon', 'Pillai', 'Iyer', 'Iyengar', 'Choudhury', 'Banerjee', 'Mukherjee',
      'Das', 'Bose', 'Roy', 'Ghosh', 'Chatterjee', 'Khan', 'Ahmed', 'Syed', 'Ali', 'Fernandes',
      'D\'Souza', 'Rodrigues', 'Pereira', 'Naidu', 'Raju', 'Yadav', 'Pandey', 'Mishra', 'Tiwari', 'Dubey',
      'Shukla', 'Agarwal', 'Jain', 'Singhal', 'Goyal', 'Mittal', 'Malhotra', 'Kapoor', 'Chopra', 'Arora'
    ]
  },
  female: {
    first: [
      'Aadhya', 'Saanvi', 'Aarohi', 'Ananya', 'Diya', 'Ishani', 'Kavya', 'Navya', 'Pari', 'Sara',
      'Aanya', 'Aisha', 'Akshara', 'Anvi', 'Avani', 'Bhavya', 'Charvi', 'Darshana', 'Eesha', 'Gauri',
      'Ira', 'Jiya', 'Kiara', 'Lavanya', 'Mahika', 'Nandini', 'Oviya', 'Palak', 'Rhea', 'Samaira',
      'Tanvi', 'Uma', 'Vanya', 'Yashasvi', 'Zara', 'Aditi', 'Anjali', 'Deepika', 'Divya', 'Gayatri',
      'Kavita', 'Meera', 'Neha', 'Pooja', 'Priya', 'Rashmi', 'Shweta', 'Sneha', 'Srishti', 'Swati'
    ],
    // Female last names same as male (family names)
    last: [] as string[]
  }
};

// Initialize female last names (same as male family names)
INDIAN_NAMES.female.last = [...INDIAN_NAMES.male.last];

export const INDIAN_LOCATIONS = {
  mumbai: {
    areas: ['Andheri', 'Bandra', 'Juhu', 'Powai', 'Goregaon', 'Malad', 'Borivali', 'Dadar', 'Worli', 'Lower Parel'],
    state: 'Maharashtra'
  },
  delhi: {
    areas: ['Connaught Place', 'Karol Bagh', 'Saket', 'Vasant Kunj', 'Lajpat Nagar', 'Defence Colony', 'Greater Kailash', 'Rohini', 'Janakpuri', 'Dwarka'],
    state: 'Delhi'
  },
  bangalore: {
    areas: ['Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'Jayanagar', 'Malleswaram', 'HSR Layout', 'BTM Layout', 'Marathahalli', 'Sarjapur'],
    state: 'Karnataka'
  },
  chennai: {
    areas: ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Tambaram', 'Mylapore', 'Nungambakkam', 'Perambur', 'Guindy', 'Porur'],
    state: 'Tamil Nadu'
  },
  kolkata: {
    areas: ['Salt Lake', 'Park Street', 'Ballygunge', 'New Town', 'Howrah', 'Jadavpur', 'Behala', 'Rajarhat', 'Tollygunge', 'Dum Dum'],
    state: 'West Bengal'
  }
};

export const BRANCH_CONFIGS = {
  'dps-main': {
    name: 'Delhi Public School - Main Campus',
    subdomain: 'dps-main',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 35,
    sections: ['A', 'B', 'C', 'D'],
    grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    baseFee: 8000
  },
  'dps-north': {
    name: 'Delhi Public School - North Campus',
    subdomain: 'dps-north',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 32,
    sections: ['A', 'B', 'C'],
    grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    baseFee: 7500
  },
  'dps-south': {
    name: 'Delhi Public School - South Campus',
    subdomain: 'dps-south',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 30,
    sections: ['A', 'B', 'C'],
    grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    baseFee: 7000
  },
  'dps-east': {
    name: 'Delhi Public School - East Campus',
    subdomain: 'dps-east',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 25,
    sections: ['A', 'B'],
    grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    baseFee: 6500
  },
  'dps-west': {
    name: 'Delhi Public School - West Campus',
    subdomain: 'dps-west',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 28,
    sections: ['A', 'B', 'C'],
    grades: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    baseFee: 7800
  },
  'kvs-central': {
    name: 'Kendriya Vidyalaya - Central',
    subdomain: 'kvs-central',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 40,
    sections: ['A', 'B', 'C', 'D'],
    grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    baseFee: 5000
  },
  'kvs-cantonment': {
    name: 'Kendriya Vidyalaya - Cantonment',
    subdomain: 'kvs-cantonment',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 35,
    sections: ['A', 'B', 'C'],
    grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    baseFee: 4500
  },
  'kvs-airport': {
    name: 'Kendriya Vidyalaya - Airport',
    subdomain: 'kvs-airport',
    type: 'CBSE',
    location: 'delhi',
    studentsPerSection: 30,
    sections: ['A', 'B'],
    grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    baseFee: 4000
  },
  'sps-primary': {
    name: 'St. Paul\'s School - Primary Wing',
    subdomain: 'sps-primary',
    type: 'ICSE',
    location: 'kolkata',
    studentsPerSection: 25,
    sections: ['A', 'B', 'C'],
    grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    baseFee: 9000
  },
  'sps-secondary': {
    name: 'St. Paul\'s School - Secondary Wing',
    subdomain: 'sps-secondary',
    type: 'ICSE',
    location: 'kolkata',
    studentsPerSection: 30,
    sections: ['A', 'B', 'C'],
    grades: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    baseFee: 10000
  },
  'sps-senior': {
    name: 'St. Paul\'s School - Senior Wing',
    subdomain: 'sps-senior',
    type: 'ISC',
    location: 'kolkata',
    studentsPerSection: 25,
    sections: ['A', 'B'],
    grades: ['Class 11', 'Class 12'],
    baseFee: 11000
  },
  'ris-main': {
    name: 'Ryan International School - Main Branch',
    subdomain: 'ris-main',
    type: 'CBSE',
    location: 'mumbai',
    studentsPerSection: 30,
    sections: ['A', 'B', 'C', 'D'],
    grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    baseFee: 8500
  },
  'ris-extension': {
    name: 'Ryan International School - Extension Branch',
    subdomain: 'ris-extension',
    type: 'CBSE',
    location: 'mumbai',
    studentsPerSection: 25,
    sections: ['A', 'B', 'C'],
    grades: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    baseFee: 9000
  }
} as const;

export const INDIAN_PHONE_PREFIXES = ['91', '92', '93', '94', '95', '96', '97', '98', '99'];

export const INDIAN_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const INDIAN_RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];

export const INDIAN_CATEGORIES = ['General', 'OBC', 'SC', 'ST'];

export const INDIAN_OCCUPATIONS = [
  'Doctor', 'Engineer', 'Teacher', 'Business Owner', 'Government Service', 'Bank Officer',
  'Software Developer', 'Accountant', 'Lawyer', 'Police Officer', 'Army Officer', 'Nurse',
  'Professor', 'Manager', 'Consultant', 'Architect', 'Pilot', 'Journalist', 'Shopkeeper',
  'Farmer', 'Electrician', 'Plumber', 'Driver', 'Chef', 'Artist', 'Photographer'
];

export const INDIAN_EDUCATION_LEVELS = [
  'Graduate', 'Post Graduate', 'PhD', 'Diploma', 'B.Tech', 'M.Tech', 'MBA', 'MBBS', 'LLB',
  'B.Sc', 'M.Sc', 'B.Com', 'M.Com', 'BA', 'MA', 'B.Ed', 'M.Ed'
];

/**
 * Indian Academic Calendar and Subject Configuration
 */
export const INDIAN_ACADEMIC_CONFIG = {
  academicYear: {
    start: '04-01', // April 1st
    end: '03-31'    // March 31st
  },
  terms: [
    { name: 'Term 1', start: '04-01', end: '07-31' },
    { name: 'Term 2', start: '08-01', end: '11-30' },
    { name: 'Term 3', start: '12-01', end: '03-31' }
  ],
  holidays: [
    { name: 'Independence Day', date: '08-15' },
    { name: 'Republic Day', date: '01-26' },
    { name: 'Gandhi Jayanti', date: '10-02' }
  ]
};

/**
 * Subject configuration by grade level following Indian curriculum
 */
export const INDIAN_SUBJECTS_BY_GRADE = {
  'Nursery': ['Pre-Math', 'Pre-English', 'Activity', 'Art & Craft', 'Physical Education'],
  'LKG': ['Pre-Math', 'Pre-English', 'Activity', 'Art & Craft', 'Physical Education'],
  'UKG': ['Pre-Math', 'Pre-English', 'Activity', 'Art & Craft', 'Physical Education'],
  'Class 1': ['English', 'Hindi', 'Mathematics', 'EVS', 'Art & Craft', 'Physical Education'],
  'Class 2': ['English', 'Hindi', 'Mathematics', 'EVS', 'Art & Craft', 'Physical Education'],
  'Class 3': ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer Science', 'Art & Craft', 'Physical Education'],
  'Class 4': ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer Science', 'Art & Craft', 'Physical Education'],
  'Class 5': ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer Science', 'Art & Craft', 'Physical Education'],
  'Class 6': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer Science', 'Physical Education'],
  'Class 7': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer Science', 'Physical Education'],
  'Class 8': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer Science', 'Physical Education'],
  'Class 9': ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Social Science', 'Computer Science', 'Physical Education'],
  'Class 10': ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Social Science', 'Computer Science', 'Physical Education'],
  'Class 11': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Physical Education'], // Science stream
  'Class 12': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Physical Education']  // Science stream
};

/**
 * Generate authentic Indian phone number
 */
export function generateIndianPhoneNumber(): string {
  const prefix = INDIAN_PHONE_PREFIXES[Math.floor(Math.random() * INDIAN_PHONE_PREFIXES.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `+91-${prefix}${suffix}`;
}

/**
 * Generate authentic Indian address
 */
export function generateIndianAddress(city: keyof typeof INDIAN_LOCATIONS): {
  address: string;
  city: string;
  state: string;
  pincode: string;
} {
  const location = INDIAN_LOCATIONS[city];
  const area = location.areas[Math.floor(Math.random() * location.areas.length)];
  const houseNo = Math.floor(Math.random() * 999) + 1;
  const streetNo = Math.floor(Math.random() * 20) + 1;
  
  // Generate realistic pincode based on city
  const basePincodes = {
    mumbai: 400001,
    delhi: 110001,
    bangalore: 560001,
    chennai: 600001,
    kolkata: 700001
  };
  
  const basePincode = basePincodes[city];
  const pincode = (basePincode + Math.floor(Math.random() * 100)).toString();
  
  return {
    address: `${houseNo}, Street ${streetNo}, ${area}`,
    city: city.charAt(0).toUpperCase() + city.slice(1),
    state: location.state,
    pincode
  };
}

/**
 * Generate authentic Indian name
 */
export function generateIndianName(gender: 'male' | 'female'): {
  firstName: string;
  lastName: string;
  fullName: string;
} {
  const firstNames = INDIAN_NAMES[gender].first;
  const lastNames = INDIAN_NAMES[gender].last;
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`
  };
}

/**
 * Random selection utilities
 */
export function randomSelect<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomSelectMultiple<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export type BranchConfigType = typeof BRANCH_CONFIGS;
export type BranchId = keyof BranchConfigType;