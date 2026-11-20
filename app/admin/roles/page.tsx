'use client';

import React, { useEffect, useState } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { TablePrimitive } from '@/components/ui/TablePrimitive';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { fetchApi } from '@/lib/api';
import { Plus, Trash2, Shield } from '@/components/ui/Icon';

const STANDARD_ROLES = [
  { id: 1, name: 'admin', display_name: 'Admin', description: 'Full system configuration & administrative control' },
  { id: 2, name: 'hr', display_name: 'HR Manager', description: 'Manages employee records, recruitment ATS, and leave' },
  { id: 3, name: 'manager', display_name: 'Team Lead / Manager', description: 'Manages team attendance and leave approvals' },
  { id: 4, name: 'employee', display_name: 'Employee', description: 'Employee self-service access' },
];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<any[]>(STANDARD_ROLES);
  const [loading, setLoading] = useState(true);

  // Add Role Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [systemKey, setSystemKey] = useState('');
  const [description, setDescription] = useState('');
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
      // Fallback to local default if endpoint is loading or unseeded
      setRoles(STANDARD_ROLES);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDisplay = displayName.trim();
    if (!trimmedDisplay) return;

    setSubmitting(true);
    try {
      const payload: any = {
        display_name: trimmedDisplay,
        description: description.trim() || undefined,
      };
      if (systemKey.trim()) {
        payload.name = systemKey.trim().toLowerCase().replace(/\s+/g, '_');
      }

      const res = await fetchApi('/roles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      showToast(res.message || `Role "${trimmedDisplay}" created successfully!`, 'success');
      setIsModalOpen(false);
      setDisplayName('');
      setSystemKey('');
      setDescription('');
      await loadRoles();
    } catch (err: any) {
      showToast(err.message || 'Failed to create new role', 'error');
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
        title="Role Definitions"
        description="Explicit RBAC roles, hierarchy boundaries, and description scopes"
        action={
          <button
            onClick={() => setIsModalOpen(true)}
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
            headers={['Role', 'System Key', 'Description', 'Action']}
            rows={roles.map((r) => [
              <Badge key={r.id || r.name} variant="blue">{r.display_name || r.name}</Badge>,
              <span key="key" className="font-mono text-xs text-slate-600 font-semibold">{r.name}</span>,
              <span key="desc" className="text-xs text-slate-700">{r.description || '—'}</span>,
              <div key="action">
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
            ])}
          />
        )}
      </div>

      {/* ADD NEW ROLE MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Role">
        <form onSubmit={handleAddRole} className="space-y-4">
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
                if (!systemKey) {
                  // auto-suggest system key
                  setSystemKey(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                }
              }}
              placeholder="e.g. Sales Executive, QA Specialist, Project Coordinator"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f365e]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              System Key (Code)
            </label>
            <input
              type="text"
              value={systemKey}
              onChange={(e) => setSystemKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              placeholder="e.g. sales_executive, qa_specialist"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f365e]"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Used internally for RBAC and access identification. Auto-generated if left blank.
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
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f365e]"
            />
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
              <span>{submitting ? 'Creating...' : 'Save & Create Role'}</span>
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
