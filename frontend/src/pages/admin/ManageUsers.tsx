import React, { useState, useEffect } from 'react';
import api from '../../api';
import Card from '../../components/Card';
import type { User } from '../../types';
import { useNotification } from '../../context/NotificationContext';

interface ManageUsersProps {
  roleType: 'student' | 'recruiter';
}

const ManageUsers: React.FC<ManageUsersProps> = ({ roleType }) => {
  const { showSuccess, showError } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchUsers();
  }, [roleType]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      // Filter by role prop
      setUsers(data.filter((u: User) => u.role === roleType));
    } catch (err: any) {
      console.error(err);
      showError(`Failed to fetch ${roleType}s list`, 'Fetch Error');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (userId: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = !currentStatus;
      await api.patch(`/admin/users/${userId}/verify`, { isVerified: newStatus });
      fetchUsers();
      showSuccess(`User ${newStatus ? 'verified' : 'unverified'} successfully!`, 'Status Updated');
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to update user verification status', 'Update Error');
    }
  };

  const toggleStatus = async (userId: string, currentStatus: string | undefined) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/admin/users/${userId}/verify`, { status: newStatus });
      fetchUsers();
      showSuccess(`User account ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'Status Updated');
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to update user account status', 'Update Error');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="display-md mb-2 capitalize">Manage {roleType}s</h2>
        <p className="text-[var(--on-surface-variant)] text-lg">Control access and verify accounts across the platform.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface-container-low)]">
                <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)]">Name</th>
                <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)]">Email</th>
                <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)]">Verified</th>
                <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)]">Account Status</th>
                <th className="p-4 label-sm font-semibold border-b border-[var(--surface-container)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center">No {roleType}s found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="border-b border-[var(--surface-container)] hover:bg-[var(--surface)] transition-colors">
                    <td className="p-4 font-bold text-[var(--primary)]">{user.name}</td>
                    <td className="p-4 text-[var(--on-surface-variant)]">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${user.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                       <button 
                         onClick={() => toggleVerification(user._id, user.isVerified)} 
                         className="text-sm font-bold text-[var(--surface-tint)] hover:underline"
                       >
                         {user.isVerified ? 'Revoke' : 'Verify'}
                       </button>
                       <span className="text-[var(--surface-container)]">|</span>
                       <button 
                         onClick={() => toggleStatus(user._id, user.status || 'active')} 
                         className={`text-sm font-bold hover:underline ${user.status === 'active' ? 'text-red-600' : 'text-green-600'}`}
                       >
                         {user.status === 'active' ? 'Deactivate' : 'Activate'}
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ManageUsers;
