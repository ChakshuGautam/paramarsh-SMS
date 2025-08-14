"use client";

import React, { useState, useEffect } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Role } from '../permissions';

export const RoleSwitcher: React.FC = () => {
  const permissions = usePermissions();
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // Only show in development mode
    setIsDevMode(process.env.NODE_ENV === 'development');
    
    // Get current role from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(
          window.localStorage.getItem('admin.rolesOverride') || '[]'
        );
        if (stored.length > 0) {
          setSelectedRole(stored[0]);
        }
      } catch {}
    }
  }, []);

  const handleRoleChange = (role: Role | '') => {
    if (typeof window === 'undefined') return;
    
    if (role === '') {
      // Clear override
      window.localStorage.removeItem('admin.rolesOverride');
    } else {
      // Set override
      window.localStorage.setItem('admin.rolesOverride', JSON.stringify([role]));
    }
    
    setSelectedRole(role);
    // Reload to apply new permissions
    window.location.reload();
  };

  // Only show in development mode
  if (!isDevMode) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'white',
      border: '2px solid #ddd',
      borderRadius: 8,
      padding: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 9999,
    }}>
      <div style={{ marginBottom: 5, fontWeight: 'bold', fontSize: 12 }}>
        🔐 RBAC Test Mode
      </div>
      <div style={{ fontSize: 11, marginBottom: 5 }}>
        Current: {permissions.roles.join(', ') || 'None'}
      </div>
      <select
        value={selectedRole}
        onChange={(e) => handleRoleChange(e.target.value as Role | '')}
        style={{
          width: '100%',
          padding: '5px',
          fontSize: 12,
          border: '1px solid #ccc',
          borderRadius: 4,
        }}
      >
        <option value="">Use Real Role</option>
        <option value="admin">Admin</option>
        <option value="teacher">Teacher</option>
        <option value="parent">Parent</option>
        <option value="student">Student</option>
      </select>
      <div style={{ fontSize: 10, marginTop: 5, color: '#666' }}>
        ⚠️ Dev only - for testing
      </div>
    </div>
  );
};