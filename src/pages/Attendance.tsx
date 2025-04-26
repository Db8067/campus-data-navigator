
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Student } from '@/types';
import { getStudents, generateFakeData } from '@/services/database';
import { Calendar, Search, CheckCheck, X, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useToast } from '@/components/ui/use-toast';

const ATTENDANCE_COLORS = ['#10B981', '#EF4444', '#F59E0B'];

const Attendance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  
  const [attendanceData, setAttendanceData] = useState([
    { name: 'Present', value: 0 },
    { name: 'Absent', value: 0 },
    { name: 'Late', value: 0 },
  ]);
  
  const [dailyAttendance, setDailyAttendance] = useState<any[]>([]);
  
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

  // Generate mock attendance data when student is selected
  useEffect(() => {
    if (!selectedStudent) return;
    
    const monthIndex = parseInt(selectedMonth, 10);
    const year = new Date().getFullYear();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    // Mock attendance records for the selected student
    let present = 0;
    let absent = 0;
    let late = 0;
    const daily: any[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      
      // Skip weekends (0=Sunday, 6=Saturday)
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Generate random attendance status
      const rand = Math.random();
      let status;
      
      if (rand > 0.85) {
        status = 'absent';
        absent++;
      } else if (rand > 0.7) {
        status = 'late';
        late++;
      } else {
        status = 'present';
        present++;
      }
      
      daily.push({
        date: date.toISOString().split('T')[0],
        status
      });
    }
    
    // Update attendance chart data
    setAttendanceData([
      { name: 'Present', value: present },
      { name: 'Absent', value: absent },
      { name: 'Late', value: late },
    ]);
    
    // Update daily attendance records
    setDailyAttendance(daily);
  }, [selectedStudent, selectedMonth]);

  const getMonthName = (index: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[index];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCheck className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <X className="h-5 w-5 text-red-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return null;
    }
  };

  const calculateAttendancePercentage = () => {
    const total = attendanceData.reduce((acc, item) => acc + item.value, 0);
    const present = attendanceData[0].value;
    
    if (total === 0) return 0;
    return (present / total) * 100;
  };

  const markAttendance = (index: number, status: 'present' | 'absent' | 'late') => {
    // Update the attendance status for a specific day
    const updatedDailyAttendance = [...dailyAttendance];
    const oldStatus = updatedDailyAttendance[index].status;
    updatedDailyAttendance[index].status = status;
    setDailyAttendance(updatedDailyAttendance);
    
    // Update the attendance chart data
    const updatedChartData = [...attendanceData];
    
    // Decrement the old status count
    if (oldStatus === 'present') updatedChartData[0].value--;
    else if (oldStatus === 'absent') updatedChartData[1].value--;
    else if (oldStatus === 'late') updatedChartData[2].value--;
    
    // Increment the new status count
    if (status === 'present') updatedChartData[0].value++;
    else if (status === 'absent') updatedChartData[1].value++;
    else if (status === 'late') updatedChartData[2].value++;
    
    setAttendanceData(updatedChartData);
    
    toast({
      title: "Attendance Updated",
      description: `Marked as ${status} for ${updatedDailyAttendance[index].date}`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-dbms-primary">Attendance Management</h1>
        
        {/* Student Selection and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
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
          
          <div className="space-y-2">
            <label htmlFor="month-select" className="text-sm font-medium">Select Month</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month-select">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {getMonthName(i)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {selectedStudent ? (
          <>
            {/* Attendance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Attendance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={attendanceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {attendanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={ATTENDANCE_COLORS[index % ATTENDANCE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Attendance Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="stat-card">
                      <span className="text-sm text-gray-500">Present</span>
                      <div className="flex items-center mt-1">
                        <CheckCheck className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-xl font-bold">{attendanceData[0].value} days</span>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <span className="text-sm text-gray-500">Absent</span>
                      <div className="flex items-center mt-1">
                        <X className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-xl font-bold">{attendanceData[1].value} days</span>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <span className="text-sm text-gray-500">Late</span>
                      <div className="flex items-center mt-1">
                        <Clock className="h-5 w-5 text-amber-500 mr-2" />
                        <span className="text-xl font-bold">{attendanceData[2].value} days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Attendance Rate:</span>
                        <span className="font-medium">{calculateAttendancePercentage().toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-dbms-primary h-2.5 rounded-full" 
                          style={{ width: `${calculateAttendancePercentage()}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Daily Attendance Records */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    {getMonthName(parseInt(selectedMonth, 10))} Attendance Records
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full student-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyAttendance.map((record, index) => {
                        const recordDate = new Date(record.date);
                        const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(recordDate);
                        
                        return (
                          <tr key={record.date}>
                            <td>{record.date}</td>
                            <td>{dayName}</td>
                            <td>
                              <div className="flex items-center">
                                {getStatusIcon(record.status)}
                                <span className="ml-2 capitalize">{record.status}</span>
                              </div>
                            </td>
                            <td>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={record.status === 'present' ? 'default' : 'outline'}
                                  className={record.status === 'present' ? 'bg-green-500 hover:bg-green-600' : ''}
                                  onClick={() => markAttendance(index, 'present')}
                                >
                                  Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant={record.status === 'absent' ? 'default' : 'outline'}
                                  className={record.status === 'absent' ? 'bg-red-500 hover:bg-red-600' : ''}
                                  onClick={() => markAttendance(index, 'absent')}
                                >
                                  Absent
                                </Button>
                                <Button
                                  size="sm"
                                  variant={record.status === 'late' ? 'default' : 'outline'}
                                  className={record.status === 'late' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                                  onClick={() => markAttendance(index, 'late')}
                                >
                                  Late
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-dbms-primary mb-4" />
              <h3 className="text-xl font-medium mb-2">No Student Selected</h3>
              <p className="text-gray-500 text-center">
                Please select a student to view and manage attendance records.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Attendance;
