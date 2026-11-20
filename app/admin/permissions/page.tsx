'use client';

import React, { useEffect, useState } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { TablePrimitive } from '@/components/ui/TablePrimitive';
import { Badge } from '@/components/ui/Badge';
import { fetchApi } from '@/lib/api';
import { Filter, Check, Shield } from '@/components/ui/Icon';
import Link from 'next/link';

interface PermissionItem {
  key: string;
  name: string;
  module: string;
  roles: string[];
}

const DEFAULT_PERMISSIONS: PermissionItem[] = [
  { key: 'users.manage', name: 'Manage System Users & RBAC', module: 'admin', roles: ['admin'] },
  { key: 'organization.settings', name: 'Manage Organization Settings & Branding', module: 'admin', roles: ['admin'] },
  { key: 'audit_logs.view', name: 'View System Audit Logs', module: 'admin', roles: ['admin'] },
  { key: 'invoices.manage', name: 'Create & Manage Client Invoices', module: 'invoices', roles: ['admin'] },
  { key: 'payroll.manage', name: 'Generate & Manage Payroll & Salary Slips', module: 'payroll', roles: ['admin'] },
  { key: 'employees.crud', name: 'HR Employee Records Management', module: 'employees', roles: ['hr', 'admin'] },
  { key: 'recruitment.ats', name: 'Recruitment & Job Openings Pipeline', module: 'recruitment', roles: ['hr', 'admin'] },
  { key: 'leave.approve', name: 'Approve & Reject Leave Requests', module: 'leave', roles: ['hr', 'manager', 'admin'] },
  { key: 'team.view', name: 'View Direct Team Roster & Reports', module: 'team', roles: ['manager', 'team_leader', 'admin'] },
  { key: 'tasks.manage', name: 'Assign & Review Tasks & Submissions', module: 'tasks', roles: ['admin', 'hr', 'manager', 'team_leader'] },
  { key: 'attendance.track', name: 'Attendance Check-In & Tracking', module: 'attendance', roles: ['admin', 'hr', 'manager', 'team_leader', 'employee'] },
  { key: 'leave.apply', name: 'Submit Leave Requests & View Quotas', module: 'leave', roles: ['employee', 'manager', 'hr', 'team_leader', 'admin'] },
  { key: 'timesheets.log', name: 'Submit Project Timesheets & Work Logs', module: 'timesheets', roles: ['employee', 'manager', 'hr', 'team_leader', 'admin'] },
  { key: 'documents.vault', name: 'Access Document Vault', module: 'documents', roles: ['employee', 'manager', 'hr', 'team_leader', 'admin'] },
  { key: 'assets.view', name: 'View Assigned Hardware & Assets', module: 'assets', roles: ['employee', 'manager', 'hr', 'team_leader', 'admin'] },
  { key: 'helpdesk.tickets', name: 'Raise & Track Support Tickets', module: 'helpdesk', roles: ['employee', 'manager', 'hr', 'team_leader', 'admin'] },
];

export default function AdminPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRolesAndMatrix();
  }, []);

  const loadRolesAndMatrix = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/roles');
      if (res && res.roles && Array.isArray(res.roles) && res.roles.length > 0) {
        setRolesList(res.roles);

        // Dynamically augment permissions matrix with custom roles based on their assigned modules
        const matrix = DEFAULT_PERMISSIONS.map((perm) => {
          const grantedRoles = [...perm.roles];
          res.roles.forEach((r: any) => {
            const rKey = r.name.toLowerCase();
            const rPerms: string[] = Array.isArray(r.permissions) ? r.permissions : [];
            
            // If role has 'all' or has this permission's module
            if (rPerms.includes('all') || rPerms.includes(perm.module) || (perm.key.startsWith(rPerms.join(',')))) {
              if (!grantedRoles.includes(rKey)) {
                grantedRoles.push(rKey);
              }
            }
          });
          return {
            ...perm,
            roles: grantedRoles,
          };
        });

        setPermissions(matrix);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = selectedRole === 'all'
    ? permissions
    : permissions.filter((p) => p.roles.includes(selectedRole.toLowerCase()));

  const selectedRoleObj = rolesList.find((r) => r.name.toLowerCase() === selectedRole.toLowerCase());

  const getRoleBadgeVariant = (r: string) => {
    switch (r.toLowerCase()) {
      case 'admin':
        return 'purple';
      case 'hr':
        return 'blue';
      case 'manager':
        return 'yellow';
      case 'team_leader':
        return 'sky';
      case 'employee':
        return 'gray';
      default:
        return 'blue';
    }
  };

  return (
    <PortalLayout namespace="admin">
      <PageHeader
        title="Permission Matrix"
        description="Explicit capability mapping and endpoint policy bindings"
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/roles"
              className="text-xs font-bold text-[#0f365e] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-300 transition-colors"
            >
              Configure Roles
            </Link>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Filter className="w-4 h-4 text-slate-500" />
              <label htmlFor="role-filter" className="text-xs font-bold text-slate-700 whitespace-nowrap">
                Filter by Role:
              </label>
              <select
                id="role-filter"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="text-xs font-bold text-[#0f365e] bg-transparent border-none focus:outline-none cursor-pointer pr-2"
              >
                <option value="all">All Roles (Full Matrix)</option>
                <option value="admin">Admin</option>
                <option value="hr">HR Manager</option>
                <option value="manager">Company Manager</option>
                <option value="team_leader">Team Leader</option>
                <option value="employee">Employee</option>
                {rolesList
                  .filter((r) => !['admin', 'hr', 'manager', 'team_leader', 'employee'].includes(r.name.toLowerCase()))
                  .map((r) => (
                    <option key={r.id || r.name} value={r.name}>
                      {r.display_name || r.name} ({r.name})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        }
      />

      {/* FILTER STATUS PILL */}
      {selectedRole !== 'all' && (
        <div className="mb-4 flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-sky-900 font-semibold">
            <Shield className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              Showing permissions granted to role: <strong className="uppercase font-bold">{selectedRoleObj?.display_name || selectedRole}</strong>
              {selectedRoleObj && (
                <span className="text-slate-500 font-normal ml-2 font-mono text-[11px]">
                  (Key: {selectedRoleObj.name})
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/roles"
              className="text-xs text-sky-700 hover:text-sky-900 font-bold underline cursor-pointer"
            >
              Edit Role Modules
            </Link>
            <span className="text-sky-300">|</span>
            <button
              onClick={() => setSelectedRole('all')}
              className="text-xs text-sky-700 hover:text-sky-900 font-bold underline cursor-pointer"
            >
              Show All Roles
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading permission matrix...
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">
              No permissions currently granted explicitly to role &quot;{selectedRoleObj?.display_name || selectedRole}&quot;.
            </p>
            <p className="text-slate-400 text-[11px] mb-3">
              Go to Role Definitions and check the modules you want this role to access.
            </p>
            <Link
              href="/admin/roles"
              className="inline-flex items-center px-3 py-1.5 bg-[#0f365e] text-white rounded-lg font-bold text-xs hover:bg-[#164677] transition-colors"
            >
              Assign Modules to {selectedRoleObj?.display_name || selectedRole}
            </Link>
          </div>
        ) : (
          <TablePrimitive
            headers={['Permission Key', 'Feature Description', 'Module Scope', 'Explicit Roles Granted']}
            rows={filteredPermissions.map((p) => [
              <span key="key" className="font-mono text-xs text-slate-800 font-bold">{p.key}</span>,
              <span key="name" className="text-xs text-slate-700">{p.name}</span>,
              <Badge key="mod" variant="gray">{p.module}</Badge>,
              <div key="roles" className="flex gap-1.5 flex-wrap">
                {p.roles.map((r) => (
                  <Badge
                    key={r}
                    variant={getRoleBadgeVariant(r)}
                  >
                    {r}
                  </Badge>
                ))}
              </div>,
            ])}
          />
        )}
      </div>
    </PortalLayout>
  );
}
