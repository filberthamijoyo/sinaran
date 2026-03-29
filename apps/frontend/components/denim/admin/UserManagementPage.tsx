'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageShell } from '@/components/ui/erp/PageShell';
import { Button } from '@/components/ui/button';
import { Input, FormField } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { authFetch } from '@/lib/authFetch';
import { Plus, Pencil, X } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
type UserRole = 'admin' | 'jakarta' | 'factory';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  stage?: string;
  active: boolean;
  createdAt: string;
}

type SlideoutMode = 'create' | 'edit' | null;

interface FormValues {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  stage: string;
}

/* ─────────────────────────────────────────────────────────
   Design tokens
   ───────────────────────────────────────────────────────── */
const T = {
  contentBg:        'var(--content-bg)',
  border:           'var(--border)',
  cardRadius:       'var(--card-radius)',
  textPrimary:      'var(--text-primary)',
  textSecondary:    'var(--text-secondary)',
  textMuted:        'var(--text-muted)',
  primary:          'var(--primary)',
  success:          'var(--success)',
  info:             'var(--info)',
  denim950:         'var(--denim-950)',
  successText:      'var(--success-text)',
  danger:           'var(--danger)',
} as const;

/* ─────────────────────────────────────────────────────────
   Stage label helpers
   ───────────────────────────────────────────────────────── */
const STAGE_OPTIONS = [
  'warping', 'indigo', 'weaving', 'inspect_gray', 'bbsf', 'inspect_finish', 'sacon',
];

const STAGE_LABELS: Record<string, string> = {
  warping:        'Warping',
  indigo:         'Indigo',
  weaving:         'Weaving',
  inspect_gray:    'Inspect Gray',
  bbsf:            'BBSF',
  inspect_finish:  'Inspect Finish',
  sacon:           'Sacon',
};

function formatStage(raw?: string): string {
  if (!raw) return '—';
  return STAGE_LABELS[raw] ?? raw;
}

function capitalize(raw: string): string {
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/* ─────────────────────────────────────────────────────────
   Date formatting
   ───────────────────────────────────────────────────────── */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}

/* ─────────────────────────────────────────────────────────
   Row border colour by role
   ───────────────────────────────────────────────────────── */
const ROLE_BORDER: Record<UserRole, string> = {
  admin:   '#1D4ED8',
  jakarta: '#0891B2',
  factory: '#059669',
};

const ROLE_BADGE_VARIANT = {
  admin:   'primary' as const,
  jakarta: 'info' as const,
  factory: 'success' as const,
};

const ROLE_LABEL = {
  admin:   'Admin',
  jakarta: 'Jakarta HQ',
  factory: 'Factory',
};

const ROLE_BADGE_STYLE: Record<UserRole, React.CSSProperties> = {
  admin:   { background: '#EFF6FF', color: '#1D4ED8' },
  jakarta: { background: '#F0FDFA', color: '#0891B2' },
  factory: { background: '#ECFDF5', color: '#059669' },
};

/* ─────────────────────────────────────────────────────────
   Toast
   ───────────────────────────────────────────────────────── */
interface Toast { id: number; message: string; type: 'success' | 'error'; }
let toastCounter = 0;

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      zIndex: 100,
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            background: 'var(--denim-950)',
            color: '#EEF3F7',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            minWidth: 260,
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: t.type === 'success' ? 'var(--success)' : 'var(--danger)',
            flexShrink: 0,
          }} />
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Slideout Panel
   ───────────────────────────────────────────────────────── */
function Slideout({
  open,
  onClose,
  mode,
  values,
  onChange,
  onSave,
  isSaving,
  saveError,
  isEdit,
}: {
  open: boolean;
  onClose: () => void;
  mode: SlideoutMode;
  values: FormValues;
  onChange: (field: keyof FormValues, value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  saveError: string;
  isEdit: boolean;
}) {
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Reset state when slideout closes
  useEffect(() => {
    if (!open) {
      setShowResetPassword(false);
      setResetPassword('');
      setResetError('');
      setResetSuccess('');
    }
  }, [open]);

  const handleResetPassword = async () => {
    if (!resetPassword.trim()) return;
    setIsResetting(true);
    setResetError('');
    setResetSuccess('');
    try {
      await authFetch(`/auth/users/${values.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword }),
      });
      setResetSuccess('Password updated');
      setResetPassword('');
      setTimeout(() => setShowResetPassword(false), 1500);
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setIsResetting(false);
    }
  };

  const selectStyle: React.CSSProperties = {
    height: 36,
    borderRadius: 'var(--input-radius)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: T.border,
    background: 'var(--page-bg)',
    padding: '0 12px',
    fontSize: 14,
    fontFamily: 'inherit',
    color: T.textPrimary,
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A96A8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 36,
  };

  const showStage = values.role === 'factory';

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 40,
          }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: 'fixed',
        right: 0, top: 0,
        height: '100vh',
        width: 400,
        background: T.contentBg,
        borderLeft: `1px solid #E5E7EB`,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 250ms ease',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          height: 56,
          borderBottom: `1px solid ${T.border}`,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary }}>
            {mode === 'create' ? 'New User' : 'Edit User'}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              color: T.textMuted, padding: 4,
              borderRadius: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '24px 20px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <FormField label="Name" required>
            <Input
              type="text"
              placeholder="Full name"
              value={values.name}
              onChange={e => onChange('name', e.target.value)}
            />
          </FormField>

          <FormField label="Email" required>
            <Input
              type="email"
              placeholder="email@triputra.com"
              value={values.email}
              disabled={isEdit}
              onChange={e => onChange('email', e.target.value)}
            />
          </FormField>

          {!isEdit && (
            <FormField label="Password" required>
              <Input
                type="password"
                placeholder="Set initial password"
                value={values.password}
                onChange={e => onChange('password', e.target.value)}
              />
            </FormField>
          )}

          <FormField label="Role" required>
            <select
              style={selectStyle}
              value={values.role}
              onChange={e => {
                const r = e.target.value as UserRole;
                onChange('role', r);
                if (r !== 'factory') onChange('stage', '');
              }}
            >
              <option value="admin">Admin</option>
              <option value="jakarta">Jakarta HQ</option>
              <option value="factory">Factory</option>
            </select>
          </FormField>

          {/* Stage — animate in/out */}
          <div style={{
            overflow: 'hidden',
            transition: 'max-height 250ms ease, opacity 250ms ease',
            maxHeight: showStage ? 80 : 0,
            opacity: showStage ? 1 : 0,
          }}>
            {showStage && (
              <FormField label="Stage" required>
                <select
                  style={selectStyle}
                  value={values.stage}
                  onChange={e => onChange('stage', e.target.value)}
                >
                  <option value="">Select stage…</option>
                  {STAGE_OPTIONS.map(s => (
                    <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                  ))}
                </select>
              </FormField>
            )}
          </div>

          {/* Reset Password — edit mode only */}
          {isEdit && (
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
              <button
                onClick={() => setShowResetPassword(v => !v)}
                style={{
                  background: 'none', border: 'none',
                  fontSize: 12, color: T.primary,
                  cursor: 'pointer', padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                {showResetPassword ? 'Cancel reset' : 'Reset Password'}
              </button>

              {showResetPassword && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Input
                    type="password"
                    placeholder="New password"
                    value={resetPassword}
                    onChange={e => setResetPassword(e.target.value)}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={isResetting}
                    onClick={handleResetPassword}
                  >
                    Update Password
                  </Button>
                  {resetError && (
                    <p style={{ fontSize: 12, color: 'var(--danger-text)', margin: 0 }}>{resetError}</p>
                  )}
                  {resetSuccess && (
                    <p style={{ fontSize: 12, color: 'var(--success-text)', margin: 0 }}>{resetSuccess}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {saveError && (
            <p style={{ fontSize: 13, color: 'var(--danger-text)', margin: 0 }}>
              {saveError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          height: 64,
          borderTop: `1px solid ${T.border}`,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          flexShrink: 0,
        }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={isSaving} onClick={onSave}>
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────── */
export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Slideout state
  const [slideoutOpen, setSlideoutOpen] = useState(false);
  const [slideoutMode, setSlideoutMode] = useState<SlideoutMode>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Inline confirm state per row
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  // Form values
  const [formValues, setFormValues] = useState<FormValues>({
    id: '', name: '', email: '', password: '', role: 'factory', stage: '',
  });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await authFetch<{ users: User[] }>('/auth/users');
      setUsers(data.users ?? []);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => {
    setSlideoutMode('create');
    setEditingUser(null);
    setFormValues({ id: '', name: '', email: '', password: '', role: 'factory', stage: '' });
    setSaveError('');
    setSlideoutOpen(true);
  };

  const openEdit = (user: User) => {
    setSlideoutMode('edit');
    setEditingUser(user);
    setFormValues({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      stage: user.stage ?? '',
    });
    setSaveError('');
    setSlideoutOpen(true);
  };

  const handleFormChange = (field: keyof FormValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formValues.name.trim() || !formValues.email.trim()) return;
    if (slideoutMode === 'create' && !formValues.password.trim()) {
      setSaveError('Password is required');
      return;
    }
    if (slideoutMode === 'edit' && formValues.role === 'factory' && !formValues.stage) {
      setSaveError('Stage is required for factory users');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    try {
      if (slideoutMode === 'create') {
        await authFetch('/auth/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formValues.name,
            email: formValues.email,
            password: formValues.password,
            role: formValues.role,
            stage: formValues.role === 'factory' ? formValues.stage : undefined,
          }),
        });
        showToast('User created successfully', 'success');
      } else {
        await authFetch(`/auth/users/${editingUser!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formValues.name,
            role: formValues.role,
            stage: formValues.role === 'factory' ? formValues.stage : undefined,
          }),
        });
        showToast('User updated successfully', 'success');
      }
      setSlideoutOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    setDeactivatingId(user.id);
    try {
      await authFetch(`/auth/users/${user.id}`, {
        method: 'DELETE',
      });
      showToast(user.active ? 'User deactivated' : 'User activated', 'success');
      setConfirmId(null);
      fetchUsers();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed', 'error');
    } finally {
      setDeactivatingId(null);
    }
  };

  const COLS = ['Name', 'Email', 'Role', 'Stage', 'Created', 'Status', 'Actions'];

  const colWidths = ['20%', '24%', '11%', '14%', '11%', '10%', '10%'];

  return (
    <PageShell
      title="User Management"
      subtitle={`${users.length} account${users.length !== 1 ? 's' : ''}`}
      actions={
        <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={openCreate}>
          New User
        </Button>
      }
    >
      <ToastContainer toasts={toasts} />

      {/* Table */}
      <div style={{
        background: T.contentBg,
        border: `1px solid ${T.border}`,
        borderRadius: T.cardRadius,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: colWidths.map(w => w).join(' '),
          borderBottom: `1px solid ${T.border}`,
          background: 'var(--page-bg)',
        }}>
          {COLS.map((col, i) => (
            <div key={col} style={{
              padding: '10px 16px',
              fontSize: 11,
              fontWeight: 600,
              color: T.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {col}
            </div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: colWidths.join(' '),
              borderBottom: i < 4 ? `1px solid ${T.border}` : 'none',
              height: 40,
              alignItems: 'center',
            }}>
              {colWidths.map((w, j) => (
                <div key={j} style={{ padding: '0 16px' }}>
                  <Skeleton style={{ height: 12, width: `${50 + (j * 13) % 40}%`, borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ))
        ) : fetchError ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--danger-text)' }}>{fetchError}</p>
            <Button variant="secondary" size="sm" onClick={fetchUsers} style={{ marginTop: 8 }}>
              Retry
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: T.textMuted }}>No users found</p>
          </div>
        ) : (
          users.map(user => (
            <div
              key={user.id}
              style={{
                display: 'grid',
                gridTemplateColumns: colWidths.join(' '),
                borderBottom: `1px solid ${T.border}`,
                borderLeft: `3px solid ${ROLE_BORDER[user.role]}`,
                height: 40,
                alignItems: 'center',
                background: 'transparent',
                transition: 'background 120ms',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(74,122,155,0.04)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {/* Name */}
              <div style={{ padding: '0 16px', fontSize: 13, fontWeight: 500, color: T.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>

              {/* Email */}
              <div style={{ padding: '0 16px', fontSize: 13, color: T.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>

              {/* Role */}
              <div style={{ padding: '0 16px' }}>
                <span style={{
                  display:       'inline-flex',
                  alignItems:   'center',
                  padding:       '2px 10px',
                  borderRadius:  12,
                  fontSize:      12,
                  fontWeight:    600,
                  ...ROLE_BADGE_STYLE[user.role],
                }}>
                  {ROLE_LABEL[user.role]}
                </span>
              </div>

              {/* Stage */}
              <div style={{ padding: '0 16px', fontSize: 12, color: T.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.role === 'factory' ? formatStage(user.stage) : '—'}
              </div>

              {/* Created */}
              <div style={{ padding: '0 16px', fontSize: 12, color: T.textSecondary }}>
                {formatDate(user.createdAt)}
              </div>

              {/* Status */}
              <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: user.active ? '#10B981' : '#D1D5DB',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 11,
                  color: user.active ? 'var(--success-text)' : T.textMuted,
                }}>
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
                {confirmId === user.id ? (
                  <>
                    <span style={{ fontSize: 11, color: T.textSecondary }}>Confirm?</span>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deactivatingId === user.id}
                      onClick={() => handleToggleActive(user)}
                      style={{ height: 26, padding: '0 8px', fontSize: 11 }}
                    >
                      Yes
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmId(null)}
                      style={{ height: 26, padding: '0 8px', fontSize: 11 }}
                    >
                      No
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openEdit(user)}
                      title="Edit user"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        color: T.textMuted, padding: 4, borderRadius: 4,
                        transition: 'color 120ms',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.primary; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmId(user.id)}
                      title={user.active ? 'Deactivate user' : 'Activate user'}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        color: T.textMuted, padding: 4, borderRadius: 4,
                        transition: 'color 120ms',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.danger; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textMuted; }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 500 }}>
                        {user.active ? 'Off' : 'On'}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slideout */}
      <Slideout
        open={slideoutOpen}
        onClose={() => setSlideoutOpen(false)}
        mode={slideoutMode}
        values={formValues}
        onChange={handleFormChange}
        onSave={handleSave}
        isSaving={isSaving}
        saveError={saveError}
        isEdit={slideoutMode === 'edit'}
      />
    </PageShell>
  );
}
