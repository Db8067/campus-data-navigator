
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  GraduationCap,
  Calculator,
  Calendar,
  DollarSign,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: Users,
      label: 'Students',
      href: '/students',
    },
    {
      icon: GraduationCap,
      label: 'Grades',
      href: '/grades',
    },
    {
      icon: Calendar,
      label: 'Attendance',
      href: '/attendance',
    },
    {
      icon: DollarSign,
      label: 'Fees',
      href: '/fees',
    },
    {
      icon: Calculator,
      label: 'GPA Calculator',
      href: '/gpa-calculator',
    },
  ];

  return (
    <div className="h-screen bg-dbms-primary text-white w-64 p-4 flex flex-col">
      <div className="mb-8 flex justify-center">
        <Link to="/dashboard" className="text-2xl font-bold text-white">
          Student DBMS
        </Link>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                to={item.href} 
                className={cn(
                  "flex items-center p-3 rounded-md hover:bg-dbms-dark transition-colors",
                  pathname === item.href && "bg-dbms-dark"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="border-t border-dbms-dark pt-4 mt-4">
        {user && (
          <div className="flex items-center mb-4 bg-dbms-dark p-2 rounded-md">
            <User className="h-5 w-5 mr-2" />
            <span className="text-sm overflow-hidden text-ellipsis">{user.username}</span>
          </div>
        )}
        <Button 
          variant="destructive" 
          className="w-full flex items-center justify-center"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
