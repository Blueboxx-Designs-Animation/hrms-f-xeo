'use client';

import React, { useEffect, useState } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { TablePrimitive } from '@/components/ui/TablePrimitive';
import { Badge } from '@/components/ui/Badge';
import { fetchApi } from '@/lib/api';
import { Filter, Check, Shield } from '@/components/ui/Icon';

interface PermissionItem {
  key: string;
  name: string;
  roles: string[];
}

const DEFAULT_PERMISSIONS: PermissionItem[] = [
  { key: 'users.manage', name: 'Manage System Users', roles: ['admin'] },
  { key: 'organization.settings', name: 'Manage Organization Settings', roles: ['admin'] },
  { key: 'audit_logs.view', name: 'View System Audit Logs', roles: ['admin'] },
  { key: 'employees.crud', name: 'HR Employee Management', roles: ['hr'] },
  { key: 'leave.approve', name: 'Approve Leave Requests', roles: ['hr', 'manager'] },
  { key: 'team.view', name: 'View Direct Team Roster', roles: ['manager'] },
  { key: 'self_service.access', name: 'Employee Self-Service Access', roles: ['employee', 'manager', 'hr', 'admin'] },
];

export default function AdminPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>(DEFAULT_PERMISSIONS);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const res = await fetchApi('/roles');
      if (res && res.roles && Array.isArray(res.roles) && res.roles.length > 0) {
        setRolesList(res.roles);
      }
    } catch {
      // fallback
    }
  };

  const filteredPermissions = selectedRole === 'all'
    ? permissions
    : permissions.filter((p) => p.roles.includes(selectedRole));

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
      default:
        return 'gray';
    }
  };

  return (
    <PortalLayout namespace="admin">
      <PageHeader
        title="Permission Matrix"
        description="Explicit capability mapping and endpoint policy bindings"
        action={
          <div className="flex items-center gap-2">
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
                  .filter((r) => !['admin', 'hr', 'manager', 'team_leader', 'employee'].includes(r.name))
                  .map((r) => (
                    <option key={r.id || r.name} value={r.name}>
                      {r.display_name || r.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        }
      />

      {/* FILTER STATUS PILL */}
      {selectedRole !== 'all' && (
        <div className="mb-4 flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 text-xs">
          <div className="flex items-center gap-2 text-sky-900 font-semibold">
            <Shield className="w-4 h-4 text-sky-600" />
            <span>
              Showing permissions specifically granted to role: <strong className="uppercase font-bold">{selectedRole}</strong>
            </span>
          </div>
          <button
            onClick={() => setSelectedRole('all')}
            className="text-xs text-sky-700 hover:text-sky-900 font-bold underline cursor-pointer"
          >
            Show All Roles
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredPermissions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No permissions currently granted explicitly to role &quot;{selectedRole}&quot;.
          </div>
        ) : (
          <TablePrimitive
            headers={['Permission Key', 'Feature Description', 'Explicit Roles Granted']}
            rows={filteredPermissions.map((p) => [
              <span key="key" className="font-mono text-xs text-slate-800 font-bold">{p.key}</span>,
              <span key="name" className="text-xs text-slate-700">{p.name}</span>,
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
