
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Book, Calendar, DollarSign } from 'lucide-react';
import { getStudents, db, generateFakeData } from '@/services/database';
import { Student } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#1E5091', '#0EA5E9', '#38BDF8', '#7DD3FC', '#E0F2FE'];

const Dashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [feesData, setFeesData] = useState<any[]>([]);

  useEffect(() => {
    // Get students from database or generate if none exist
    let studentsList = getStudents();
    
    if (studentsList.length === 0) {
      studentsList = generateFakeData(20);
    }
    
    setStudents(studentsList);
    
    // Process department statistics
    const departments: Record<string, number> = {};
    studentsList.forEach(student => {
      departments[student.department] = (departments[student.department] || 0) + 1;
    });
    
    const deptData = Object.keys(departments).map(dept => ({
      department: dept,
      count: departments[dept]
    }));
    setDepartmentData(deptData);
    
    // Process fees data
    const feesInfo = [
      {
        name: 'Paid',
        value: studentsList.reduce((acc, student) => acc + student.fees.paid, 0)
      },
      {
        name: 'Due',
        value: studentsList.reduce((acc, student) => acc + student.fees.due, 0)
      }
    ];
    setFeesData(feesInfo);
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-dbms-primary">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-dbms-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all departments
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <Book className="h-4 w-4 text-dbms-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{db.courses.length}</div>
              <p className="text-xs text-muted-foreground">
                Active courses
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <Calendar className="h-4 w-4 text-dbms-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">
                Average across departments
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(students.reduce((acc, student) => acc + student.fees.total, 0)).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                ${(students.reduce((acc, student) => acc + student.fees.paid, 0)).toLocaleString()} paid
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Distribution */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Students by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="department" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Students" fill="#1E5091" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Fees Status */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Fees Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={feesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {feesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#0EA5E9' : '#EF4444'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Students */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Recently Added Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full student-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Enrollment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 5).map((student) => (
                    <tr key={student.id}>
                      <td>{student.studentId}</td>
                      <td>{student.firstName} {student.lastName}</td>
                      <td>{student.department}</td>
                      <td>{student.email}</td>
                      <td>{student.enrollmentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
