
import { Student, User, Course, Grade, Attendance, GradeValue, gradePoints } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock in-memory database
let students: Student[] = [];
let users: User[] = [];
let courses: Course[] = [];
let grades: Grade[] = [];
let attendance: Attendance[] = [];

// Initialize with some sample data
const initializeDatabase = () => {
  // Add admin user
  users = [
    {
      id: '1',
      username: 'admin',
      password: 'admin123', // In a real app, store hashed passwords
      role: 'admin'
    }
  ];

  // Add some sample courses
  courses = [
    {
      id: '1',
      code: 'CS101',
      name: 'Introduction to Computer Science',
      department: 'Computer Science',
      credits: 3
    },
    {
      id: '2',
      code: 'CS202',
      name: 'Data Structures',
      department: 'Computer Science',
      credits: 4
    },
    {
      id: '3',
      code: 'EE101',
      name: 'Circuit Analysis',
      department: 'Electrical Engineering',
      credits: 3
    }
  ];
};

// User management
export const loginUser = (username: string, password: string): User | null => {
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};

export const registerUser = (username: string, password: string, role: 'admin' | 'teacher' | 'student'): User => {
  const newUser = {
    id: uuidv4(),
    username,
    password, // In a real app, hash this password
    role
  };
  users.push(newUser);
  return newUser;
};

// Student management
export const addStudent = (student: Omit<Student, 'id'>): Student => {
  const newStudent = {
    ...student,
    id: uuidv4()
  };
  students.push(newStudent);
  return newStudent;
};

export const getStudents = (): Student[] => {
  return [...students];
};

export const getStudentById = (id: string): Student | undefined => {
  return students.find(student => student.id === id);
};

export const getStudentsByDepartment = (department: string): Student[] => {
  return students.filter(student => student.department === department);
};

export const updateStudent = (id: string, updates: Partial<Student>): Student | undefined => {
  const index = students.findIndex(student => student.id === id);
  if (index !== -1) {
    students[index] = { ...students[index], ...updates };
    return students[index];
  }
  return undefined;
};

export const deleteStudent = (id: string): boolean => {
  const initialLength = students.length;
  students = students.filter(student => student.id !== id);
  return students.length < initialLength;
};

// Grade management
export const addGrade = (grade: Omit<Grade, 'points'>): Grade => {
  const gradeValue = grade.grade as GradeValue;
  const points = gradePoints[gradeValue] || 0;
  
  const newGrade = {
    ...grade,
    points
  };
  
  grades.push(newGrade);
  return newGrade;
};

export const getStudentGrades = (studentId: string): Grade[] => {
  return grades.filter(grade => grade.studentId === studentId);
};

export const calculateGPA = (studentId: string): number => {
  const studentGrades = getStudentGrades(studentId);
  
  if (studentGrades.length === 0) return 0;
  
  const totalPoints = studentGrades.reduce((sum, grade) => sum + grade.points, 0);
  return totalPoints / studentGrades.length;
};

// Attendance management
export const addAttendance = (record: Attendance): Attendance => {
  attendance.push(record);
  return record;
};

export const getStudentAttendance = (studentId: string): Attendance[] => {
  return attendance.filter(record => record.studentId === studentId);
};

export const calculateAttendancePercentage = (studentId: string, courseId: string): number => {
  const records = attendance.filter(
    record => record.studentId === studentId && record.courseId === courseId
  );
  
  if (records.length === 0) return 0;
  
  const present = records.filter(record => record.status === 'present').length;
  return (present / records.length) * 100;
};

// Initialize the database
initializeDatabase();

// Export the database for direct access in development
export const db = {
  students,
  users,
  courses,
  grades,
  attendance
};

// Function to generate fake data for testing
export const generateFakeData = (count: number = 10) => {
  const departments = ['Computer Science', 'Electrical Engineering', 'Business Administration', 'Mechanical Engineering', 'Biology'];
  
  for (let i = 0; i < count; i++) {
    const firstName = `First${i + 1}`;
    const lastName = `Last${i + 1}`;
    const department = departments[Math.floor(Math.random() * departments.length)];
    
    const student: Omit<Student, 'id'> = {
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      department,
      enrollmentDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      studentId: `ST${100000 + i}`,
      fees: {
        total: 10000,
        paid: Math.floor(Math.random() * 10000),
        due: 0,
        lastPayment: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
      }
    };
    
    // Calculate due amount
    student.fees.due = student.fees.total - student.fees.paid;
    
    addStudent(student);
  }
  
  // Return the generated students
  return getStudents();
};
