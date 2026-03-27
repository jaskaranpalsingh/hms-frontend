/**
 * Role-Based Access Control Hook
 * 
 * Roles and their permitted actions:
 *   admin   → create, read, update, delete  (full access)
 *   doctor  → read, update                  (view + update patients)
 *   patient → read                          (view own data only)
 *   staff   → read, update                  (similar to doctor for operational pages)
 */

import { useAuth } from '../context/AuthContext';

const roles = {
  admin:   ['create', 'read', 'update', 'delete'],
  doctor:  ['read', 'update'],
  patient: ['read'],
  staff:   ['read', 'update'],
};

/**
 * Returns permission-check utilities for the current user.
 *
 * Usage:
 *   const { can, role, isAdmin, isDoctor, isPatient } = useRBAC();
 *   can('create')   // true if the user's role allows "create"
 *   can('delete')   // false for doctor / patient / staff
 */
const useRBAC = () => {
  const { user } = useAuth();

  const role = user?.role || null;
  const permissions = roles[role] || [];

  /** Check if current user has a specific permission */
  const can = (action) => permissions.includes(action);

  /** Check if current user has one of the given roles */
  const hasRole = (...allowedRoles) => allowedRoles.includes(role);

  return {
    role,
    can,
    hasRole,
    isAdmin:   role === 'admin',
    isDoctor:  role === 'doctor',
    isPatient: role === 'patient',
    isStaff:   role === 'staff',
    permissions,
  };
};

export default useRBAC;
