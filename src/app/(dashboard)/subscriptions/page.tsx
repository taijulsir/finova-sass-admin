'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { CreditCard, Search, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { TbEdit, TbArchive } from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SubscriptionsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, [search, page]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getOrganizations(page, 10, search);
      setOrganizations(response.data?.data || response.data || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubscription = (org: any) => {
    setSelectedSub(org);
    setIsViewModalOpen(true);
  };

  const handleEditSubscription = (e: React.MouseEvent, org: any) => {
    e.stopPropagation();
    toast.info(`Edit subscription for: ${org.name}`);
  };

  const handleArchiveSubscription = (e: React.MouseEvent, org: any) => {
    e.stopPropagation();
    toast.info(`Archive subscription for: ${org.name}`);
    if (isViewModalOpen) {
      setIsViewModalOpen(false);
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="rounded-md border">
            <div className="h-10 bg-muted/50 border-b"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border-b">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-8 w-8 rounded-full ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
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
                  <tr 
                    key={org._id} 
                    className="border-t hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewSubscription(org)}
                  >
                    <td className="p-4 font-medium">{org.name}</td>
                    <td className="p-4 capitalize">{org.plan}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="p-4">{'Monthly'}</td>
                    <td className="p-4">{'2024-03-01'}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="mr-4">{org.plan === 'enterprise' ? '$299' : '$49'}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                          onClick={(e) => handleEditSubscription(e, org)}
                          title="Edit"
                        >
                          <TbEdit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                          onClick={(e) => handleArchiveSubscription(e, org)}
                          title="Archive"
                        >
                          <TbArchive className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewSubscription(org); }}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Add more actions */ }}>
                              Cancel Subscription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
                {organizations?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No subscriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* View Subscription Modal */}
      <Modal
        title="Subscription Details"
        description="View detailed information about this subscription."
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      >
        {selectedSub && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Organization</p>
                <p className="text-base font-semibold">{selectedSub.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  selectedSub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedSub.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Plan</p>
                <p className="text-base capitalize">{selectedSub.plan}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="text-base">{selectedSub.plan === 'enterprise' ? '$299' : '$49'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Billing Cycle</p>
                <p className="text-base">Monthly</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Next Payment</p>
                <p className="text-base">2024-03-01</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                onClick={(e) => handleEditSubscription(e, selectedSub)}
              >
                <TbEdit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button 
                variant="outline" 
                className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 border-amber-200"
                onClick={(e) => handleArchiveSubscription(e, selectedSub)}
              >
                <TbArchive className="mr-2 h-4 w-4" /> Archive
              </Button>
              <Button variant="default" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
