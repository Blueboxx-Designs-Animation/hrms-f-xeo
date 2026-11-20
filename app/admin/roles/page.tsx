'use client';

import React, { useEffect, useState } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { TablePrimitive } from '@/components/ui/TablePrimitive';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { fetchApi } from '@/lib/api';
import { Plus, Trash2, Shield, Edit } from '@/components/ui/Icon';

const AVAILABLE_MODULES = [
  { key: 'dashboard', label: 'Dashboard Overview', desc: 'Main dashboard analytics & overview metrics' },
  { key: 'invoices', label: 'Invoices & Billing', desc: 'Create, edit, view client invoices and payments' },
  { key: 'tasks', label: 'Task Management', desc: 'Task assignments, progress, and submissions' },
  { key: 'attendance', label: 'Attendance Tracking', desc: 'Daily check-in / check-out and attendance logs' },
  { key: 'leave', label: 'Leave Requests', desc: 'Apply, view, and track leave balances' },
  { key: 'payroll', label: 'Payroll & Salary Slips', desc: 'Access salary slips and compensation reports' },
  { key: 'documents', label: 'Document Vault', desc: 'Company and personal document depository' },
  { key: 'timesheets', label: 'Timesheets & Work Logs', desc: 'Project hour logs and client timesheets' },
  { key: 'assets', label: 'Asset Management', desc: 'Hardware, software, and company asset records' },
  { key: 'helpdesk', label: 'Helpdesk & Support', desc: 'Internal ticketing and query resolution' },
  { key: 'performance', label: 'Performance & Goals', desc: 'KPI tracking, goals, and evaluation metrics' },
  { key: 'reports', label: 'Reports & Analytics', desc: 'Statutory headcount, attendance, and leave reports' },
  { key: 'notifications', label: 'Notifications & Alerts', desc: 'System-wide announcements and alerts' },
];

const STANDARD_ROLES = [
  { id: 1, name: 'admin', display_name: 'Admin', description: 'Full system configuration & administrative control', permissions: ['all'] },
  { id: 2, name: 'hr', display_name: 'HR Manager', description: 'Manages employee records, recruitment ATS, and leave', permissions: ['dashboard', 'employees', 'recruitment', 'leave', 'attendance', 'payroll', 'documents', 'tasks', 'timesheets', 'assets', 'helpdesk', 'reports', 'announcements'] },
  { id: 3, name: 'manager', display_name: 'Team Lead / Manager', description: 'Manages team attendance and leave approvals', permissions: ['dashboard', 'team', 'employees', 'tasks', 'performance', 'documents', 'attendance', 'leave', 'timesheets', 'helpdesk', 'reports'] },
  { id: 4, name: 'employee', display_name: 'Employee', description: 'Employee self-service access', permissions: ['dashboard', 'payroll', 'tasks', 'performance', 'attendance', 'leave', 'timesheets', 'assets', 'helpdesk', 'documents'] },
];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<any[]>(STANDARD_ROLES);
  const [loading, setLoading] = useState(true);

  // Add / Edit Role Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [systemKey, setSystemKey] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Delete Role Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/roles');
      if (res && res.roles && Array.isArray(res.roles) && res.roles.length > 0) {
        setRoles(res.roles);
      } else {
        setRoles(STANDARD_ROLES);
      }
    } catch {
      setRoles(STANDARD_ROLES);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingRoleId(null);
    setDisplayName('');
    setSystemKey('');
    setDescription('');
    setSelectedModules(['dashboard', 'invoices']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: any) => {
    setEditingRoleId(role.id);
    setDisplayName(role.display_name || role.name);
    setSystemKey(role.name);
    setDescription(role.description || '');
    const perms = Array.isArray(role.permissions) ? role.permissions : [];
    setSelectedModules(perms);
    setIsModalOpen(true);
  };

  const toggleModule = (moduleKey: string) => {
    if (selectedModules.includes(moduleKey)) {
      setSelectedModules(selectedModules.filter((m) => m !== moduleKey));
    } else {
      setSelectedModules([...selectedModules, moduleKey]);
    }
  };

  const selectAllModules = () => {
    setSelectedModules(AVAILABLE_MODULES.map((m) => m.key));
  };

  const deselectAllModules = () => {
    setSelectedModules([]);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDisplay = displayName.trim();
    if (!trimmedDisplay) return;

    setSubmitting(true);
    try {
      if (editingRoleId) {
        // Update existing role
        const payload: any = {
          display_name: trimmedDisplay,
          description: description.trim() || undefined,
          permissions: selectedModules,
        };

        const res = await fetchApi(`/roles/${editingRoleId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });

        showToast(res.message || `Role "${trimmedDisplay}" updated successfully!`, 'success');
      } else {
        // Create new role
        const payload: any = {
          display_name: trimmedDisplay,
          description: description.trim() || undefined,
          permissions: selectedModules,
        };
        if (systemKey.trim()) {
          payload.name = systemKey.trim().toLowerCase().replace(/\s+/g, '_');
        }

        const res = await fetchApi('/roles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        showToast(res.message || `Role "${trimmedDisplay}" created successfully!`, 'success');
      }

      setIsModalOpen(false);
      setDisplayName('');
      setSystemKey('');
      setDescription('');
      setSelectedModules([]);
      await loadRoles();
    } catch (err: any) {
      showToast(err.message || 'Failed to save role', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setDeleting(true);
    try {
      const res = await fetchApi(`/roles/${roleToDelete.id}`, {
        method: 'DELETE',
      });

      showToast(res.message || `Role "${roleToDelete.display_name}" deleted successfully!`, 'success');
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
      await loadRoles();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete role', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const isStandardRole = (name: string) => {
    const key = (name || '').toLowerCase();
    return ['admin', 'hr', 'manager', 'team_leader', 'employee'].includes(key);
  };

  return (
    <PortalLayout namespace="admin">
      <PageHeader
        title="Role Definitions & Module Access"
        description="Explicit RBAC roles, hierarchy boundaries, and assigned accessible modules"
        action={
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#0f365e] hover:bg-[#164677] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Role</span>
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">
            Loading roles...
          </div>
        ) : (
          <TablePrimitive
            headers={['Role', 'System Key', 'Accessible Modules / Permissions', 'Description', 'Action']}
            rows={roles.map((r) => {
              const perms: string[] = Array.isArray(r.permissions) ? r.permissions : [];
              const isSuper = perms.includes('all') || r.name === 'admin';

              return [
                <Badge key={r.id || r.name} variant="blue">{r.display_name || r.name}</Badge>,
                <span key="key" className="font-mono text-xs text-slate-600 font-semibold">{r.name}</span>,
                <div key="perms" className="flex flex-wrap gap-1 max-w-sm">
                  {isSuper ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      ★ All Modules (Super Admin)
                    </span>
                  ) : perms.length === 0 ? (
                    <span className="text-[10px] text-slate-400 italic">No modules granted</span>
                  ) : (
                    perms.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-semibold text-[#0f365e] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded"
                      >
                        {AVAILABLE_MODULES.find((m) => m.key === p)?.label || p}
                      </span>
                    ))
                  )}
                </div>,
                <span key="desc" className="text-xs text-slate-600 max-w-xs block truncate">{r.description || '—'}</span>,
                <div key="action" className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(r)}
                    className="p-1.5 text-slate-600 hover:text-[#0f365e] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title={`Edit ${r.display_name} modules & permissions`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {isStandardRole(r.name) ? (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                      System Core
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setRoleToDelete(r);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={`Delete ${r.display_name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>,
              ];
            })}
          />
        )}
      </div>

      {/* ADD / EDIT ROLE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoleId ? `Configure Role: ${displayName}` : 'Add New Role'}
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Role Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (!editingRoleId && !systemKey) {
                  setSystemKey(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                }
              }}
              placeholder="e.g. Client, Project Manager, Accountant"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f365e]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              System Key (Code)
            </label>
            <input
              type="text"
              disabled={!!editingRoleId}
              value={systemKey}
              onChange={(e) => setSystemKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              placeholder="e.g. client, project_manager"
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f365e] ${editingRoleId ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Unique identifier used internally for permissions. Cannot be altered after creation.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Role Description Scope
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what responsibilities and permissions this role entails..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f365e]"
            />
          </div>

          {/* MODULE PERMISSION SELECTION */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-800">
                Accessible Modules & Permissions
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllModules}
                  className="text-[10px] font-bold text-[#0f365e] hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={deselectAllModules}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Check only the modules that users with this role are permitted to view and interact with. All unchecked modules will remain hidden.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
              {AVAILABLE_MODULES.map((mod) => {
                const checked = selectedModules.includes(mod.key);
                return (
                  <label
                    key={mod.key}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${checked
                      ? 'bg-white border-[#0f365e] shadow-2xs'
                      : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleModule(mod.key)}
                      className="mt-0.5 rounded text-[#0f365e] focus:ring-[#0f365e] cursor-pointer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold ${checked ? 'text-[#0f365e]' : 'text-slate-800'}`}>
                        {mod.label}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {mod.desc}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !displayName.trim()}
              className="px-4 py-2 bg-[#0f365e] hover:bg-[#164677] text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : editingRoleId ? 'Save Changes' : 'Create Role'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Role">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to permanently delete the custom role{' '}
            <strong className="text-slate-900">{roleToDelete?.display_name}</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
    </PortalLayout>
  );
}
