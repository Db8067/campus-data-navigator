
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  enrollmentDate: string;
  studentId: string;
  fees: {
    total: number;
    paid: number;
    due: number;
    lastPayment: string;
  };
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
}

export interface Grade {
  studentId: string;
  courseId: string;
  grade: string;
  points: number;
  semester: string;
}

export interface Attendance {
  studentId: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export const departments: Department[] = [
  { id: '1', name: 'Computer Science', code: 'CS' },
  { id: '2', name: 'Electrical Engineering', code: 'EE' },
  { id: '3', name: 'Business Administration', code: 'BA' },
  { id: '4', name: 'Mechanical Engineering', code: 'ME' },
  { id: '5', name: 'Biology', code: 'BIO' },
];

export type GradeValue = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F';

export const gradePoints: Record<GradeValue, number> = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0,
};
