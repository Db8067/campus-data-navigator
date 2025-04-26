
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Student } from '@/types';
import { getStudents, updateStudent, generateFakeData } from '@/services/database';
import { Search, DollarSign, CreditCard, Receipt } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Fees = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  
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
  };

  const handlePaymentSubmit = () => {
    if (!selectedStudent || paymentAmount <= 0) {
      toast({
        title: "Invalid Payment",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (paymentAmount > selectedStudent.fees.due) {
      toast({
        title: "Payment Error",
        description: "Payment amount cannot exceed the due amount.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Update student fees
      const updatedFees = {
        ...selectedStudent.fees,
        paid: selectedStudent.fees.paid + paymentAmount,
        due: selectedStudent.fees.due - paymentAmount,
        lastPayment: new Date().toISOString().split('T')[0]
      };
      
      const updatedStudent = updateStudent(selectedStudent.id, {
        fees: updatedFees
      });
      
      if (updatedStudent) {
        // Update local state
        setStudents(students.map(
          s => s.id === selectedStudent.id ? updatedStudent : s
        ));
        setSelectedStudent(updatedStudent);
        
        toast({
          title: "Payment Successful",
          description: `$${paymentAmount.toLocaleString()} paid for ${selectedStudent.firstName} ${selectedStudent.lastName}.`,
        });
        
        // Reset form and close dialog
        setPaymentAmount(0);
        setIsPaymentDialogOpen(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "An error occurred while processing the payment.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-dbms-primary">Fees Management</h1>
        
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
            {/* Fee Details */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Details - {selectedStudent.firstName} {selectedStudent.lastName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="stat-card border rounded-md">
                    <span className="text-sm text-gray-500">Total Fees</span>
                    <div className="flex items-center mt-2">
                      <DollarSign className="h-5 w-5 text-dbms-primary mr-2" />
                      <span className="text-2xl font-bold">${selectedStudent.fees.total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="stat-card border rounded-md">
                    <span className="text-sm text-gray-500">Paid Amount</span>
                    <div className="flex items-center mt-2">
                      <Receipt className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-2xl font-bold">${selectedStudent.fees.paid.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="stat-card border rounded-md">
                    <span className="text-sm text-gray-500">Due Amount</span>
                    <div className="flex items-center mt-2">
                      <CreditCard className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-2xl font-bold">${selectedStudent.fees.due.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Payment Progress:</span>
                      <span className="font-medium">
                        {((selectedStudent.fees.paid / selectedStudent.fees.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-dbms-primary h-2.5 rounded-full" 
                        style={{ width: `${(selectedStudent.fees.paid / selectedStudent.fees.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <div>
                    {selectedStudent.fees.lastPayment && (
                      <p className="text-sm text-gray-500">
                        Last Payment Date: <span className="font-medium">{selectedStudent.fees.lastPayment}</span>
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    className="bg-dbms-primary hover:bg-dbms-dark"
                    onClick={() => setIsPaymentDialogOpen(true)}
                    disabled={selectedStudent.fees.due <= 0}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Make Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {/* In a real app, this would display actual payment history records */}
                <div className="border rounded-lg">
                  <table className="w-full student-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Receipt No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.fees.lastPayment && selectedStudent.fees.paid > 0 ? (
                        <tr>
                          <td>{selectedStudent.fees.lastPayment}</td>
                          <td>${selectedStudent.fees.paid.toLocaleString()}</td>
                          <td>Online Transfer</td>
                          <td>RCT-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-4">
                            No payment history available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Make Payment</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="payment-amount" className="text-sm font-medium">
                      Payment Amount
                    </label>
                    <Input
                      id="payment-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={paymentAmount || ''}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      min={1}
                      max={selectedStudent.fees.due}
                    />
                    <p className="text-sm text-gray-500">
                      Maximum payable amount: ${selectedStudent.fees.due.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="payment-method" className="text-sm font-medium">
                      Payment Method
                    </label>
                    <Select defaultValue="online">
                      <SelectTrigger id="payment-method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online Transfer</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-dbms-primary hover:bg-dbms-dark" onClick={handlePaymentSubmit}>
                    Submit Payment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-dbms-primary mb-4" />
              <h3 className="text-xl font-medium mb-2">No Student Selected</h3>
              <p className="text-gray-500 text-center">
                Please select a student to view and manage fees.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Fees;
