
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Student, Course, Grade, GradeValue, gradePoints } from '@/types';
import { getStudents, generateFakeData, db, addGrade, getStudentGrades, calculateGPA } from '@/services/database';
import { Search, GraduationCap, BarChart, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Grades = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isAddGradeDialogOpen, setIsAddGradeDialogOpen] = useState(false);
  const [studentGrades, setStudentGrades] = useState<Grade[]>([]);
  const [gpa, setGpa] = useState<number>(0);
  
  // New grade form state
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<GradeValue>('B');
  const [semester, setSemester] = useState('Fall 2023');
  
  const { toast } = useToast();

  useEffect(() => {
    // Load students or generate if none exist
    let studentsList = getStudents();
    
    if (studentsList.length === 0) {
      studentsList = generateFakeData(20);
    }
    
    setStudents(studentsList);
    setFilteredStudents(studentsList);
  }, []);

  // Filter students by search term
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = students.filter(
        student => 
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(term) || 
          student.studentId.toLowerCase().includes(term)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const handleStudentSelect = (id: string) => {
    const student = students.find(s => s.id === id);
    setSelectedStudent(student || null);
    
    if (student) {
      // Get student's grades
      const grades = getStudentGrades(student.id);
      setStudentGrades(grades);
      
      // Calculate GPA
      const studentGpa = calculateGPA(student.id);
      setGpa(studentGpa);
      
      // If no grades, generate some sample grades
      if (grades.length === 0) {
        generateSampleGrades(student.id);
      }
    }
  };

  const generateSampleGrades = (studentId: string) => {
    // Generate some sample grades for demo purposes
    const gradeValues: GradeValue[] = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'];
    const semesters = ['Fall 2022', 'Spring 2023', 'Fall 2023'];
    
    const generatedGrades: Grade[] = [];
    
    db.courses.forEach(course => {
      const semester = semesters[Math.floor(Math.random() * semesters.length)];
      const grade = gradeValues[Math.floor(Math.random() * gradeValues.length)];
      const points = gradePoints[grade];
      
      generatedGrades.push({
        studentId,
        courseId: course.id,
        grade,
        points,
        semester,
      });
    });
    
    // Add the grades to the database
    generatedGrades.forEach(g => {
      addGrade(g);
    });
    
    // Update local state
    setStudentGrades(generatedGrades);
    setGpa(calculateGPA(studentId));
  };

  const handleAddGrade = () => {
    if (!selectedStudent || !selectedCourse || !selectedGrade || !semester) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Add the new grade
      const newGrade = addGrade({
        studentId: selectedStudent.id,
        courseId: selectedCourse,
        grade: selectedGrade,
        semester,
      });
      
      // Update local state
      setStudentGrades([...studentGrades, newGrade]);
      setGpa(calculateGPA(selectedStudent.id));
      
      toast({
        title: "Grade Added",
        description: `Grade ${selectedGrade} added for the course`,
      });
      
      // Reset form and close dialog
      setIsAddGradeDialogOpen(false);
    } catch (error) {
      console.error("Error adding grade:", error);
      toast({
        title: "Error",
        description: "Failed to add grade",
        variant: "destructive",
      });
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-500';
    if (grade.startsWith('B')) return 'text-blue-500';
    if (grade.startsWith('C')) return 'text-amber-500';
    if (grade.startsWith('D')) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGPAStatus = (gpa: number) => {
    if (gpa >= 3.5) return { text: 'Excellent', color: 'text-green-500' };
    if (gpa >= 3.0) return { text: 'Very Good', color: 'text-blue-500' };
    if (gpa >= 2.5) return { text: 'Good', color: 'text-amber-500' };
    if (gpa >= 2.0) return { text: 'Satisfactory', color: 'text-orange-500' };
    return { text: 'Needs Improvement', color: 'text-red-500' };
  };

  const prepareChartData = () => {
    const coursesMap = new Map<string, { name: string, code: string }>();
    db.courses.forEach(course => {
      coursesMap.set(course.id, { name: course.name, code: course.code });
    });
    
    return studentGrades.map(grade => {
      const course = coursesMap.get(grade.courseId);
      return {
        name: course?.code || 'Unknown',
        fullName: course?.name || 'Unknown Course',
        points: grade.points,
        semester: grade.semester,
        grade: grade.grade,
      };
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-dbms-primary">Grades Management</h1>
        
        {/* Student Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="student-search" className="text-sm font-medium">Search Student</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="student-search"
                placeholder="Search by name or ID"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="student-select" className="text-sm font-medium">Select Student</label>
            <Select onValueChange={handleStudentSelect}>
              <SelectTrigger id="student-select">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {filteredStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.studentId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {selectedStudent ? (
          <>
            {/* Grade Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">GPA Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="text-5xl font-bold text-dbms-primary mb-2">
                      {gpa.toFixed(2)}
                    </div>
                    <div className={`text-lg font-medium ${getGPAStatus(gpa).color}`}>
                      {getGPAStatus(gpa).text}
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      {studentGrades.length} courses completed
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Grade Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={prepareChartData()}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 4]} />
                        <Tooltip 
                          formatter={(value, name, props) => [`${value} (${props.payload.grade})`, props.payload.fullName]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="points"
                          name="Grade Points"
                          stroke="#1E5091"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Grades Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Course Grades</CardTitle>
                <Button 
                  onClick={() => setIsAddGradeDialogOpen(true)}
                  className="bg-dbms-primary hover:bg-dbms-dark"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Grade
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full student-table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Semester</th>
                        <th>Grade</th>
                        <th>Grade Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentGrades.length > 0 ? (
                        studentGrades.map((grade, index) => {
                          const course = db.courses.find(c => c.id === grade.courseId);
                          return (
                            <tr key={index}>
                              <td>{course?.code || 'Unknown'}</td>
                              <td>{course?.name || 'Unknown Course'}</td>
                              <td>{grade.semester}</td>
                              <td className={getGradeColor(grade.grade)}>
                                <span className="font-bold">{grade.grade}</span>
                              </td>
                              <td>{grade.points.toFixed(1)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-4">
                            No grades available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {/* Add Grade Dialog */}
            <Dialog open={isAddGradeDialogOpen} onOpenChange={setIsAddGradeDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Grade</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="course" className="text-sm font-medium">Course</label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger id="course">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {db.courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="semester" className="text-sm font-medium">Semester</label>
                    <Select value={semester} onValueChange={setSemester}>
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fall 2022">Fall 2022</SelectItem>
                        <SelectItem value="Spring 2023">Spring 2023</SelectItem>
                        <SelectItem value="Fall 2023">Fall 2023</SelectItem>
                        <SelectItem value="Spring 2024">Spring 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="grade" className="text-sm font-medium">Grade</label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade as any}>
                      <SelectTrigger id="grade">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(gradePoints).map(grade => (
                          <SelectItem key={grade} value={grade}>
                            {grade} ({gradePoints[grade as GradeValue].toFixed(1)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddGradeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-dbms-primary hover:bg-dbms-dark" onClick={handleAddGrade}>
                    Add Grade
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-dbms-primary mb-4" />
              <h3 className="text-xl font-medium mb-2">No Student Selected</h3>
              <p className="text-gray-500 text-center">
                Please select a student to view and manage grades.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Grades;
