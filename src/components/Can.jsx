/**
 * <Can> — Declarative permission gate
 *
 * Renders children only when the current user's role
 * has the required permission action.
 *
 * Props:
 *   action   {string}          – One of 'create' | 'read' | 'update' | 'delete'
 *   role     {string|string[]} – (optional) Only render for specific role(s)
 *   fallback {ReactNode}       – (optional) Render this instead when permission denied
 *
 * Examples:
 *   <Can action="create">
 *     <button>Add Patient</button>
 *   </Can>
 *
 *   <Can action="delete" fallback={<span>No access</span>}>
 *     <button onClick={handleDelete}>Delete</button>
 *   </Can>
 *
 *   <Can role="admin">
 *     <AdminOnlyPanel />
 *   </Can>
 */

import React from 'react';
import useRBAC from '../hooks/useRBAC';

const Can = ({ action, role: requiredRole, fallback = null, children }) => {
  const { can, hasRole } = useRBAC();

  // Role restriction takes priority if provided
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole)
      ? hasRole(...requiredRole)
      : hasRole(requiredRole);
    return allowed ? children : fallback;
  }

  // Otherwise check by action
  if (action) {
    return can(action) ? children : fallback;
  }

  // No constraint — always render
  return children;
};

export default Can;
