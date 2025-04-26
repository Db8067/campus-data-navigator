
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Calculator } from 'lucide-react';
import { GradeValue, gradePoints } from '@/types';

interface CourseGrade {
  id: string;
  name: string;
  credits: number;
  grade: GradeValue | '';
}

const GPACalculator = () => {
  const [courses, setCourses] = useState<CourseGrade[]>([
    { id: '1', name: '', credits: 3, grade: '' },
    { id: '2', name: '', credits: 3, grade: '' },
    { id: '3', name: '', credits: 3, grade: '' },
  ]);
  
  const [gpa, setGPA] = useState<number | null>(null);
  const [calculated, setCalculated] = useState(false);

  const addCourse = () => {
    setCourses([
      ...courses,
      { 
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        credits: 3,
        grade: ''
      }
    ]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  const updateCourse = (id: string, field: keyof CourseGrade, value: any) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
    setCalculated(false);
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    courses.forEach(course => {
      if (course.grade && course.credits > 0) {
        totalPoints += gradePoints[course.grade as GradeValue] * course.credits;
        totalCredits += course.credits;
      }
    });
    
    if (totalCredits === 0) {
      setGPA(0);
    } else {
      setGPA(totalPoints / totalCredits);
    }
    
    setCalculated(true);
  };

  const grades = Object.keys(gradePoints) as GradeValue[];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-dbms-primary">GPA Calculator</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Calculate Your GPA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 font-medium text-sm">
                <div className="col-span-5">Course Name</div>
                <div className="col-span-3">Credits</div>
                <div className="col-span-3">Grade</div>
                <div className="col-span-1"></div>
              </div>
              
              {courses.map(course => (
                <div key={course.id} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <Input
                      placeholder="Course name"
                      value={course.name}
                      onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min="0"
                      max="6"
                      value={course.credits}
                      onChange={(e) => updateCourse(course.id, 'credits', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-3">
                    <Select 
                      value={course.grade} 
                      onValueChange={(value) => updateCourse(course.id, 'grade', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map(grade => (
                          <SelectItem key={grade} value={grade}>
                            {grade} ({gradePoints[grade]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeCourse(course.id)}
                      disabled={courses.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={addCourse}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Course
                </Button>
              </div>
            </div>
            
            <div>
              <Button 
                onClick={calculateGPA}
                className="w-full bg-dbms-primary hover:bg-dbms-dark"
              >
                <Calculator className="h-4 w-4 mr-2" /> Calculate GPA
              </Button>
            </div>
            
            {calculated && (
              <div className="mt-6 text-center">
                <div className="text-2xl font-bold">
                  Your GPA: <span className="text-dbms-primary">{gpa !== null ? gpa.toFixed(2) : '0.00'}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {gpa !== null && gpa >= 3.5 ? (
                    <span>Excellent! You're doing great.</span>
                  ) : gpa !== null && gpa >= 2.5 ? (
                    <span>Good job! Keep working hard.</span>
                  ) : (
                    <span>Consider seeking academic assistance to improve your grades.</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>GPA Scale Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full student-table">
                <thead>
                  <tr>
                    <th>Letter Grade</th>
                    <th>Grade Points</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A</td>
                    <td>4.0</td>
                    <td>90-100%</td>
                  </tr>
                  <tr>
                    <td>A-</td>
                    <td>3.7</td>
                    <td>87-89%</td>
                  </tr>
                  <tr>
                    <td>B+</td>
                    <td>3.3</td>
                    <td>84-86%</td>
                  </tr>
                  <tr>
                    <td>B</td>
                    <td>3.0</td>
                    <td>80-83%</td>
                  </tr>
                  <tr>
                    <td>B-</td>
                    <td>2.7</td>
                    <td>77-79%</td>
                  </tr>
                  <tr>
                    <td>C+</td>
                    <td>2.3</td>
                    <td>74-76%</td>
                  </tr>
                  <tr>
                    <td>C</td>
                    <td>2.0</td>
                    <td>70-73%</td>
                  </tr>
                  <tr>
                    <td>C-</td>
                    <td>1.7</td>
                    <td>67-69%</td>
                  </tr>
                  <tr>
                    <td>D+</td>
                    <td>1.3</td>
                    <td>64-66%</td>
                  </tr>
                  <tr>
                    <td>D</td>
                    <td>1.0</td>
                    <td>60-63%</td>
                  </tr>
                  <tr>
                    <td>F</td>
                    <td>0.0</td>
                    <td>0-59%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default GPACalculator;
