'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { CreditCard, Search } from 'lucide-react';

export default function SubscriptionsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Reusing getOrganizations with plan filter? Or need getSubscriptions?
  // AdminService.getOrganizations takes params { status, plan, search }
  // We want to see list of subscriptions, which is tied to Org.
  // Ideally backend should have /admin/subscriptions or getOrganizations handles it.
  
  useEffect(() => {
    fetchSubscriptions();
  }, [search]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      // Fetching orgs to show subscription info for now, as subscription is part of org data usually.
      // But separate endpoint /admin/subscriptions would be better if we want history.
      // For MVP, listing orgs and their plans is enough.
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
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">Manage active subscriptions and recurring revenue.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search subscriptions..."
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
                <th className="p-4">Organization</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4">Billing Cycle</th>
                <th className="p-4">Next Payment</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {organizations?.map((org) => ( // Assuming org has subscription details included or just plan
                <tr key={org._id} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-medium">{org.name}</td>
                  <td className="p-4 capitalize">{org.plan}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="p-4">{'Monthly'}</td> {/* Mocked */}
                  <td className="p-4">{'2024-03-01'}</td> {/* Mocked */}
                  <td className="p-4 text-right">{org.plan === 'enterprise' ? '$299' : '$49'}</td> {/* Mocked */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
