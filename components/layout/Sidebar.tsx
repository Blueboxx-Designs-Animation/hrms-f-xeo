'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { fetchApi } from '@/lib/api';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  TrendingUp,
  CheckSquare,
  Settings,
  ChevronRight,
  Plus,
  ShieldCheck,
  Building2,
  FileText,
  UserCheck,
  Megaphone,
  User,
  LogOut,
  ListTodo,
  Sparkles,
  Receipt,
  X,
} from '@/components/ui/Icon';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { isCollapsed, toggleSidebarCollapse, isMobileMenuOpen, closeMobileMenu } = useTheme();

  // Automatically close mobile menu whenever route changes
  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  // Determine user's primary role for sidebar menu items
  const userRole = (user?.role_name || (typeof user?.role === 'object' ? (user.role as any)?.name : user?.role) || 'employee').toString().toLowerCase();
  const userPermissions: string[] = Array.isArray(user?.role_permissions) ? user.role_permissions : [];

  // Determine namespace
  let activeNamespace: 'admin' | 'hr' | 'manager' | 'team_leader' | 'employee' = 'employee';
  if (userRole === 'admin') {
    activeNamespace = 'admin';
  } else if (userRole === 'hr') {
    activeNamespace = 'hr';
  } else if (userRole === 'manager' || userRole === 'company_manager') {
    activeNamespace = 'manager';
  } else if (userRole === 'team_leader' || userRole === 'tl' || userRole === 'team_lead') {
    activeNamespace = 'team_leader';
  } else if (pathname.startsWith('/admin') && (userRole === 'admin' || userPermissions.includes('all'))) {
    activeNamespace = 'admin';
  } else if (pathname.startsWith('/hr') && userRole === 'hr') {
    activeNamespace = 'hr';
  } else if (pathname.startsWith('/manager') && (userRole === 'manager' || userRole === 'company_manager')) {
    activeNamespace = 'manager';
  } else if (pathname.startsWith('/team-leader') && userRole === 'team_leader') {
    activeNamespace = 'team_leader';
  } else {
    activeNamespace = 'employee';
  }

  const portalTitleMap = {
    admin: 'ADMIN PORTAL',
    hr: userRole === 'admin' ? 'ADMIN PORTAL' : 'HR PORTAL',
    manager: userRole === 'admin' ? 'ADMIN PORTAL' : 'COMPANY MANAGER PORTAL',
    team_leader: userRole === 'admin' ? 'ADMIN PORTAL' : 'TEAM LEADER PORTAL',
    employee: userRole === 'admin' ? 'ADMIN PORTAL' : (user?.role_display ? `${user.role_display.toUpperCase()} PORTAL` : 'EMPLOYEE PORTAL'),
  };

  // Namespace specific navigation menus
  const menuItemsMap = {
    admin: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, module: 'dashboard' },
      { label: 'AI Assistant', href: '/admin/assistant', icon: Sparkles, module: 'assistant' },
      { label: 'Notifications', href: '/notifications', icon: Megaphone, module: 'notifications' },
      { label: 'Users & Master', href: '/admin/users', icon: Users, module: 'users' },
      { label: 'Document Vault', href: '/admin/documents', icon: FileText, module: 'documents' },
      { label: 'Departments', href: '/admin/departments', icon: Building2, module: 'departments' },
      { label: 'Invoices', href: '/admin/invoices', icon: Receipt, module: 'invoices' },
      { label: 'Payroll & Slips', href: '/admin/payroll', icon: CreditCard, module: 'payroll' },
      { label: 'Tasks', href: '/admin/tasks', icon: ListTodo, module: 'tasks' },
      { label: 'Performance', href: '/admin/performance', icon: TrendingUp, module: 'performance' },
      { label: 'Attendance', href: '/admin/attendance', icon: Clock, module: 'attendance' },
      { label: 'Leave', href: '/admin/leave', icon: CalendarDays, module: 'leave' },
      { label: 'Recruitment ATS', href: '/hr/recruitment', icon: UserCheck, module: 'recruitment' },
      { label: 'Timesheets', href: '/timesheets', icon: Clock, module: 'timesheets' },
      { label: 'Assets', href: '/assets', icon: Building2, module: 'assets' },
      { label: 'Helpdesk', href: '/helpdesk', icon: FileText, module: 'helpdesk' },
      { label: 'Roles', href: '/admin/roles', icon: ShieldCheck, module: 'roles' },
      { label: 'Permissions', href: '/admin/permissions', icon: CheckSquare, module: 'permissions' },
      { label: 'Organization', href: '/admin/organization', icon: Building2, module: 'organization' },
      { label: 'Settings', href: '/admin/settings', icon: Settings, module: 'settings' },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText, module: 'audit_logs' },
      { label: 'My Profile', href: '/profile', icon: User, module: 'profile' },
    ],
    hr: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, module: 'dashboard' },
      { label: 'HR Assistant', href: '/hr/assistant', icon: Sparkles, module: 'assistant' },
      { label: 'Notifications', href: '/notifications', icon: Megaphone, module: 'notifications' },
      { label: 'Employees', href: '/hr/employees', icon: Users, module: 'employees' },
      { label: 'Document Vault', href: '/hr/documents', icon: FileText, module: 'documents' },
      { label: 'Recruitment & ATS', href: '/hr/recruitment', icon: UserCheck, module: 'recruitment' },
      { label: 'Tasks', href: '/hr/tasks', icon: ListTodo, module: 'tasks' },
      { label: 'Attendance', href: '/hr/attendance', icon: Clock, module: 'attendance' },
      { label: 'Leave', href: '/hr/leave', icon: CalendarDays, module: 'leave' },
      { label: 'Timesheets', href: '/timesheets', icon: Clock, module: 'timesheets' },
      { label: 'Asset Register', href: '/assets', icon: Building2, module: 'assets' },
      { label: 'HR Helpdesk', href: '/helpdesk', icon: FileText, module: 'helpdesk' },
      { label: 'Reports', href: '/hr/reports', icon: FileText, module: 'reports' },
      { label: 'Announcements', href: '/hr/announcements', icon: Megaphone, module: 'announcements' },
      { label: 'My Profile', href: '/profile', icon: User, module: 'profile' },
    ],
    manager: [
      { label: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard, module: 'dashboard' },
      { label: 'Team Assistant', href: '/manager/assistant', icon: Sparkles, module: 'assistant' },
      { label: 'Notifications', href: '/notifications', icon: Megaphone, module: 'notifications' },
      { label: 'Team Leaders', href: '/manager/team', icon: Users, module: 'team' },
      { label: 'Employees', href: '/manager/employees', icon: UserCheck, module: 'employees' },
      { label: 'Team Tasks', href: '/manager/tasks', icon: ListTodo, module: 'tasks' },
      { label: 'Performance', href: '/admin/performance', icon: TrendingUp, module: 'performance' },
      { label: 'Vault & Reports', href: '/manager/documents', icon: FileText, module: 'documents' },
      { label: 'Timesheets', href: '/timesheets', icon: Clock, module: 'timesheets' },
      { label: 'Helpdesk', href: '/helpdesk', icon: FileText, module: 'helpdesk' },
      { label: 'Reports', href: '/manager/reports', icon: FileText, module: 'reports' },
      { label: 'My Profile', href: '/profile', icon: User, module: 'profile' },
    ],
    team_leader: [
      { label: 'Dashboard', href: '/team-leader/dashboard', icon: LayoutDashboard, module: 'dashboard' },
      { label: 'Team Assistant', href: '/team-leader/assistant', icon: Sparkles, module: 'assistant' },
      { label: 'Notifications', href: '/notifications', icon: Megaphone, module: 'notifications' },
      { label: 'My Team', href: '/team-leader/team', icon: Users, module: 'team' },
      { label: 'Tasks', href: '/team-leader/tasks', icon: ListTodo, module: 'tasks' },
      { label: 'Performance', href: '/admin/performance', icon: TrendingUp, module: 'performance' },
      { label: 'Vault & Reports', href: '/team-leader/documents', icon: FileText, module: 'documents' },
      { label: 'Timesheets', href: '/timesheets', icon: Clock, module: 'timesheets' },
      { label: 'Helpdesk', href: '/helpdesk', icon: FileText, module: 'helpdesk' },
      { label: 'Profile', href: '/profile', icon: User, module: 'profile' },
    ],
    employee: [
      { label: 'Dashboard', href: '/employee/dashboard', icon: LayoutDashboard, module: 'dashboard' },
      { label: 'Invoices', href: '/admin/invoices', icon: Receipt, module: 'invoices' },
      { label: 'AI Assistant', href: '/employee/assistant', icon: Sparkles, module: 'assistant' },
      { label: 'Notifications', href: '/notifications', icon: Megaphone, module: 'notifications' },
      { label: 'My Payslips', href: '/employee/payroll', icon: CreditCard, module: 'payroll' },
      { label: 'My Tasks', href: '/employee/tasks', icon: ListTodo, module: 'tasks' },
      { label: 'My Performance', href: '/employee/performance', icon: TrendingUp, module: 'performance' },
      { label: 'Attendance', href: '/employee/attendance', icon: Clock, module: 'attendance' },
      { label: 'Leave', href: '/employee/leave', icon: CalendarDays, module: 'leave' },
      { label: 'Timesheets', href: '/timesheets', icon: Clock, module: 'timesheets' },
      { label: 'My Assets', href: '/assets', icon: Building2, module: 'assets' },
      { label: 'Helpdesk', href: '/helpdesk', icon: FileText, module: 'helpdesk' },
      { label: 'My Vault', href: '/employee/documents', icon: FileText, module: 'documents' },
      { label: 'Profile', href: '/profile', icon: User, module: 'profile' },
    ],
  };

  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!token || !user) return;
    let isMounted = true;
    const fetchUnreadNotifications = async () => {
      try {
        const res = await fetchApi('/notifications');
        if (isMounted && typeof res.unread_count === 'number') {
          setUnreadCount(res.unread_count);
        }
      } catch (err) {
        // Silently ignore background polling errors
      }
    };

    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pathname, user, token]);

  // Determine which items to display
  let currentMenuItems = menuItemsMap[activeNamespace] || menuItemsMap.employee;

  // If user has custom role permissions configured, strictly filter the menu items!
  const isStandard = ['admin', 'hr', 'manager', 'team_leader'].includes(userRole);
  if (!isStandard && userPermissions && userPermissions.length > 0 && !userPermissions.includes('all')) {
    // Only show items whose module key is explicitly in userPermissions, or Profile
    currentMenuItems = currentMenuItems.filter((item) => {
      if (item.module === 'profile') return true;
      return userPermissions.includes(item.module);
    });
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const renderNavContent = (isDrawer = false) => (
    <>
      {/* BRAND & PORTAL HEADER */}
      <div className={`p-4 border-b border-slate-100 flex items-center ${!isDrawer && isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
        <Link
          href={`/${activeNamespace}/dashboard`}
          onClick={() => isDrawer && closeMobileMenu()}
          className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity"
        >
          {!isDrawer && isCollapsed ? (
            <img
              src={user?.organization_icon_logo || user?.organization_logo || '/images/xeoexperts-logo.jpg'}
              alt={user?.organization || 'XeoExperts'}
              className="w-8 h-8 object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/xeoexperts-logo.jpg';
              }}
            />
          ) : (
            <div className="flex flex-col min-w-0">
              <img
                src={user?.organization_logo || '/images/xeoexperts-logo.jpg'}
                alt={user?.organization || 'XeoExperts'}
                className="h-9 w-auto max-w-[180px] object-contain object-left"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/xeoexperts-logo.jpg';
                }}
              />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 truncate">
                {portalTitleMap[activeNamespace]}
              </p>
            </div>
          )}
        </Link>

        {isDrawer ? (
          <button
            onClick={closeMobileMenu}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={toggleSidebarCollapse}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
          </button>
        )}
      </div>

      {/* QUICK NEW LEAVE REQUEST BUTTON FOR EMPLOYEE / MANAGER / HR */}
      {(isDrawer || !isCollapsed) && activeNamespace !== 'admin' && (userPermissions.length === 0 || userPermissions.includes('leave')) && (
        <div className="px-4 pt-4 pb-2">
          <Link
            href={`/${activeNamespace}/leave`}
            onClick={() => isDrawer && closeMobileMenu()}
            className="w-full py-2.5 px-4 bg-[#0f365e] hover:bg-[#164677] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </Link>
        </div>
      )}

      {/* NAVIGATION MENU ITEMS */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {currentMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isNotificationItem = item.href === '/notifications';
          const hasUnread = isNotificationItem && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isDrawer && closeMobileMenu()}
              title={!isDrawer && isCollapsed ? (hasUnread ? `${item.label} (${unreadCount} unread)` : item.label) : undefined}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 group relative ${isActive
                ? 'bg-slate-100 text-[#0f365e] font-bold border border-[#c3c6cf] shadow-2xs'
                : 'text-slate-600 hover:text-[#0f365e] hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#0f365e]' : 'text-slate-400 group-hover:text-[#0f365e]'}`} />
                  {!isDrawer && isCollapsed && hasUnread && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 bg-rose-600 text-white rounded-full text-[8px] font-black flex items-center justify-center shadow-xs animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {(isDrawer || !isCollapsed) && <span className="truncate">{item.label}</span>}
              </div>

              {(isDrawer || !isCollapsed) && hasUnread && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 min-w-[20px] text-[10px] font-black text-white bg-rose-600 rounded-full shadow-xs animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* USER FOOTER & LOGOUT DRAWER */}
      <div className="p-3 border-t border-[#c3c6cf] bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5 p-1 rounded-lg min-w-0 flex-1">
          <div className="w-7 h-7 rounded-full bg-[#0f365e] text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs">
            {user?.name ? user.name[0] : 'U'}
          </div>
          {(isDrawer || !isCollapsed) && (
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-[9px] text-slate-500 truncate capitalize">{user?.role_display || user?.role || 'Employee'}</p>
            </div>
          )}
        </div>

        {(isDrawer || !isCollapsed) && (
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR (Sticky on md+ screens) */}
      <aside
        className={`hidden md:flex bg-white border-r border-[#c3c6cf] text-slate-700 flex-col h-screen sticky top-0 shrink-0 z-20 transition-all duration-200 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'
          }`}
      >
        {renderNavContent(false)}
      </aside>

      {/* MOBILE OFF-CANVAS DRAWER OVERLAY & PANEL */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={closeMobileMenu}
          />

          {/* Drawer Content */}
          <aside className="relative z-50 w-72 max-w-[85vw] bg-white text-slate-700 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
