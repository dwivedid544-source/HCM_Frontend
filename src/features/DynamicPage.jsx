import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardPage from '../components/ui/DashboardPage';

import { Users, Briefcase, CreditCard, LayoutDashboard, Clock, CheckCircle2, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';

const DynamicPage = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();

  const location = useLocation();
  const path = location.pathname.split('/').pop() || 'dashboard';
  
  const title = path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const getStats = () => {
    if (path === 'jobs' || path === 'job-posts') {
      return [
        { label: 'Open Positions', value: '24', trend: '+2', icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50' },
        { label: 'New Applicants', value: '156', trend: '+42%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Interviews Today', value: '8', trend: '+3', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Avg Time to Hire', value: '14d', trend: '-2d', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
      ];
    }
    
    if (path === 'payroll' || path === 'payroll-center') {
      return [
        { label: 'Total Payroll', value: `${getSymbol()}428K`, trend: '+4%', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Taxes Deducted', value: `${getSymbol()}84K`, trend: '+2%', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Payouts', value: '14', trend: '-5', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Last Cycle', value: 'Oct 15', trend: 'Done', icon: CheckCircle2, color: 'text-slate-600', bg: 'bg-slate-50' },
      ];
    }

    if (path === 'attendance') {
      return [
        { label: 'Present Today', value: '94%', trend: '+2%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'On Leave', value: '8', trend: '+1', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Late Arrival', value: '2', trend: '-3', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Avg Shift', value: '8.2h', trend: 'Stables', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
      ];
    }

    if (path === 'ai-score' || path === 'ai-center') {
      return [
        { label: 'AI Processing', value: 'Active', trend: 'Live', icon: Zap, color: 'text-primary-600', bg: 'bg-primary-50' },
        { label: 'Scores Gen', value: '1,420', trend: '+84', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Accuracy', value: '98.2%', trend: '+0.5%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'API Health', value: '100%', trend: 'Stable', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      ];
    }

    return [
      { label: 'Total Members', value: '1,284', trend: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Active Tasks', value: '42', trend: '+5%', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Completed', value: '852', trend: '+18%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Pending Items', value: '12', trend: '-2%', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];
  };

  const getSubtitle = () => {
    if (path === 'dashboard') return "Welcome back! Here's what's happening today.";
    return `Manage your ${title.toLowerCase()} and view detailed reports.`;
  };

  const getActionLabel = () => {
    if (path === 'jobs') return "Post Job";
    if (path === 'candidates') return "Add Candidate";
    if (path === 'users') return "Invite User";
    return `Add New`;
  }

  return (
    <DashboardPage 
      title={title} 
      subtitle={getSubtitle()}
      actionLabel={getActionLabel()}
      stats={getStats()}
    />
  );
};


export default DynamicPage;
