
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student, departments } from '@/types';
import { getStudents, getStudentsByDepartment, addStudent, deleteStudent, generateFakeData } from '@/services/database';
import { Plus, Search, Filter, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // New student form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [totalFees, setTotalFees] = useState(10000);
  
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

  // Filter students based on department and search term
  useEffect(() => {
    let result = students;
    
    // Filter by department
    if (selectedDepartment !== 'all') {
      result = getStudentsByDepartment(selectedDepartment);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        student => 
          student.firstName.toLowerCase().includes(term) || 
          student.lastName.toLowerCase().includes(term) ||
          student.email.toLowerCase().includes(term) ||
          student.studentId.toLowerCase().includes(term)
      );
    }
    
    setFilteredStudents(result);
  }, [selectedDepartment, searchTerm, students]);

  const handleAddStudent = () => {
    if (!firstName || !lastName || !email || !department || !studentId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Generate a student ID if not provided
      const generatedStudentId = studentId || `ST${100000 + students.length}`;
      
      const newStudent: Omit<Student, 'id'> = {
        firstName,
        lastName,
        email,
        department,
        enrollmentDate: new Date().toISOString().split('T')[0],
        studentId: generatedStudentId,
        fees: {
          total: totalFees,
          paid: 0,
          due: totalFees,
          lastPayment: '',
        }
      };
      
      const addedStudent = addStudent(newStudent);
      setStudents([...students, addedStudent]);
      
      toast({
        title: "Student Added",
        description: `${firstName} ${lastName} has been added successfully`,
      });
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setDepartment('');
      setStudentId('');
      setTotalFees(10000);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      const success = deleteStudent(id);
      if (success) {
        setStudents(students.filter(student => student.id !== id));
        toast({
          title: "Student Deleted",
          description: "Student has been removed from the database",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete student",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-dbms-primary">Students</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-dbms-primary hover:bg-dbms-dark">
                <Plus className="mr-2 h-4 w-4" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="studentId" className="text-sm font-medium">Student ID</label>
                  <Input
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="ST12345"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium">Department</label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="fees" className="text-sm font-medium">Total Fees</label>
                  <Input
                    id="fees"
                    type="number"
                    value={totalFees.toString()}
                    onChange={(e) => setTotalFees(Number(e.target.value))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button className="bg-dbms-primary hover:bg-dbms-dark" onClick={handleAddStudent}>Add Student</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search students..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full student-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Enrollment Date</th>
                  <th>Fees Paid</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.studentId}</td>
                      <td>{student.firstName} {student.lastName}</td>
                      <td>{student.email}</td>
                      <td>{student.department}</td>
                      <td>{student.enrollmentDate}</td>
                      <td>
                        ${student.fees.paid.toLocaleString()} / ${student.fees.total.toLocaleString()}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4 text-dbms-primary" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Students;
