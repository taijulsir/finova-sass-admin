'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { Building2, Plus, Search } from 'lucide-react';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, [search]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getOrganizations(1, 10, search);
      setOrganizations(response.data?.data || response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">Manage all registered organizations.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 shadow">
          <Plus className="mr-2 h-4 w-4" /> Add Organization
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search organizations..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm text-left">
            <thead className="text-muted-foreground bg-muted/50 font-medium">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Created At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations?.map((org) => (
                <tr key={org._id} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-medium">{org.name}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="p-4 capitalize">{org.plan}</td>
                  <td className="p-4">{org.ownerId?.email || 'N/A'}</td>
                  <td className="p-4">{new Date(org.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
