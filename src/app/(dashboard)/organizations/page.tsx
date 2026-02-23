'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { Building2, Plus, Search, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { TbEdit, TbArchive } from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArchiveModal } from "@/components/ui-system/archive-modal";
import { Pagination } from "@/components/ui-system/pagination";
import { FilterTabs } from "@/components/ui-system/filter-tabs";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('active');
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [editOrgData, setEditOrgData] = useState<any>({ name: '', status: '', plan: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, [search, page, activeTab]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getOrganizations(page, 10, search, activeTab === 'active');
      setOrganizations(response.data?.data || response.data || []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await AdminService.createOrganization({ name: newOrgName });
      toast.success("Organization created successfully");
      setIsAddModalOpen(false);
      setNewOrgName('');
      fetchOrganizations(); // Refetch list
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to create organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;
    
    setIsSubmitting(true);
    try {
      await AdminService.updateOrganization(selectedOrg._id, editOrgData);
      toast.success("Organization updated successfully");
      setIsEditModalOpen(false);
      fetchOrganizations(); 
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to update organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewOrganization = (org: any) => {
    setSelectedOrg(org);
    setIsViewModalOpen(true);
  };

  const handleEditOrganization = (e: React.MouseEvent, org: any) => {
    e.stopPropagation();
    setSelectedOrg(org);
    setEditOrgData({
      name: org.name,
      status: org.status,
      plan: org.plan
    });
    setIsEditModalOpen(true);
  };

  const handleArchiveOrganization = (e: React.MouseEvent, org: any) => {
    e.stopPropagation();
    setSelectedOrg(org);
    setIsArchiveModalOpen(true);
  };

  const confirmArchive = async () => {
    if (!selectedOrg) return;
    await AdminService.archiveOrganization(selectedOrg._id);
    fetchOrganizations();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">Manage all registered organizations.</p>
        </div>
        
        <Button className="shadow" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Organization
        </Button>
        
        {/* Add Modal */}
        <Modal
          title="Add Organization"
          description="Create a new organization workspace."
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        >
          <form onSubmit={handleAddOrganization}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Acme Corp"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          title="Edit Organization"
          description="Update organization details."
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <form onSubmit={handleUpdateOrganization}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Organization Name</Label>
                <Input
                  id="edit-name"
                  value={editOrgData.name}
                  onChange={(e) => setEditOrgData({...editOrgData, name: e.target.value})}
                  placeholder="Acme Corp"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <select 
                  id="edit-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editOrgData.status}
                  onChange={(e) => setEditOrgData({...editOrgData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-plan">Plan</Label>
                <select 
                  id="edit-plan"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editOrgData.plan}
                  onChange={(e) => setEditOrgData({...editOrgData, plan: e.target.value})}
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Archive Modal */}
        <ArchiveModal
          isOpen={isArchiveModalOpen}
          onClose={() => setIsArchiveModalOpen(false)}
          onConfirm={confirmArchive}
          title="Archive Organization"
          description={`Are you sure you want to archive ${selectedOrg?.name}?`}
        />
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <FilterTabs 
          activeTab={activeTab} 
          onTabChange={(val) => {
            setActiveTab(val);
            setPage(1);
          }} 
        />
        
        <div className="flex items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search organizations..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to first page on search
              }}
            />
          </div>
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
                <Skeleton className="h-4 w-1/4" />
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
                  <tr 
                    key={org._id} 
                    className="border-t hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewOrganization(org)}
                  >
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
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                          onClick={(e) => handleEditOrganization(e, org)}
                          title="Edit"
                        >
                          <TbEdit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                          onClick={(e) => handleArchiveOrganization(e, org)}
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewOrganization(org); }}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Add more actions */ }}>
                              Manage Billing
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
                      No organizations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="pt-4">
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
              className="justify-end"
            />
          </div>
        </div>
      )}

      {/* View Organization Modal */}
      <Modal
        title="Organization Details"
        description="View detailed information about this organization."
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      >
        {selectedOrg && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base font-semibold">{selectedOrg.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  selectedOrg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedOrg.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Plan</p>
                <p className="text-base capitalize">{selectedOrg.plan}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Owner Email</p>
                <p className="text-base">{selectedOrg.ownerId?.email || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p className="text-base">{new Date(selectedOrg.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Organization ID</p>
                <p className="text-xs font-mono bg-muted p-1 rounded">{selectedOrg._id}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                onClick={(e) => handleEditOrganization(e, selectedOrg)}
              >
                <TbEdit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button 
                variant="outline" 
                className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 border-amber-200"
                onClick={(e) => handleArchiveOrganization(e, selectedOrg)}
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
