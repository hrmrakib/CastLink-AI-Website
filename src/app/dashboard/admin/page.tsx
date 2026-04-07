"use client";

import { useState } from "react";
import { Info, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useGetOverviewQuery } from "@/redux/features/admin/adminAPI";

interface ApiUser {
  user_id: number;
  email: string;
  phone: string;
  full_name: string;
  profile_pic: string;
  role: string;
  bio: string | null;
  agency_name: string | null;
  company: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  is_verified: boolean;
  is_subscribed: boolean;
  date_joined: string;
  updated_at: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SkeletonCell({ width = "w-24" }: { width?: string }) {
  return <div className={`h-4 ${width} rounded bg-gray-200 animate-pulse`} />;
}

function StatCardSkeleton() {
  return (
    <Card className='border-0 bg-white p-6 shadow-sm'>
      <div className='mb-3 h-4 w-28 rounded bg-gray-200 animate-pulse' />
      <div className='h-8 w-16 rounded bg-gray-200 animate-pulse' />
    </Card>
  );
}

function TableRowSkeleton() {
  return (
    <tr className='border-b border-gray-200'>
      <td className='px-6 py-4'>
        <SkeletonCell width='w-16' />
      </td>
      <td className='px-6 py-4'>
        <SkeletonCell width='w-32' />
      </td>
      <td className='px-6 py-4'>
        <SkeletonCell width='w-48' />
      </td>
      <td className='px-6 py-4'>
        <SkeletonCell width='w-24' />
      </td>
      <td className='px-6 py-4'>
        <div className='flex justify-center gap-3'>
          <div className='h-8 w-8 rounded-full bg-gray-200 animate-pulse' />
          <div className='h-8 w-8 rounded-full bg-gray-200 animate-pulse' />
        </div>
      </td>
    </tr>
  );
}

function MobileCardSkeleton() {
  return (
    <Card className='border border-gray-200 p-4 space-y-3'>
      <div className='flex items-start justify-between'>
        <div className='h-7 w-16 rounded-full bg-gray-200 animate-pulse' />
        <div className='flex gap-2'>
          <div className='h-8 w-8 rounded-full bg-gray-200 animate-pulse' />
          <div className='h-8 w-8 rounded-full bg-gray-200 animate-pulse' />
        </div>
      </div>
      <div className='space-y-2'>
        <div className='h-3 w-20 rounded bg-gray-200 animate-pulse' />
        <div className='h-4 w-32 rounded bg-gray-200 animate-pulse' />
        <div className='h-3 w-12 rounded bg-gray-200 animate-pulse' />
        <div className='h-4 w-48 rounded bg-gray-200 animate-pulse' />
        <div className='h-3 w-20 rounded bg-gray-200 animate-pulse' />
        <div className='h-4 w-24 rounded bg-gray-200 animate-pulse' />
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  const { data, isLoading } = useGetOverviewQuery({});

  const recentUsers: ApiUser[] = (data?.recent_users ?? []).filter(
    (u: ApiUser) => !deletedIds.includes(u.user_id),
  );

  const handleDetailClick = (user: ApiUser) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleDeleteClick = (user: ApiUser) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setDeletedIds((prev) => [...prev, selectedUser.user_id]);
      setDeleteModalOpen(false);
      toast.success(`${selectedUser.full_name} deleted successfully!`);
      setSelectedUser(null);
    }
  };

  return (
    <main className='min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8'>
      {/* Stat Cards */}
      <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title='Total Clients'
              value={String(data?.total_clients ?? 0)}
            />
            <StatCard
              title='Total Agents'
              value={String(data?.total_agents ?? 0)}
            />
            <StatCard
              title='Active Jobs'
              value={String(data?.total_jobs ?? 0)}
            />
            <StatCard
              title='Total Talents'
              value={String(data?.total_talents ?? 0)}
            />
          </>
        )}
      </div>

      <h2 className='mb-6 text-2xl font-bold text-[#1A1A1A]'>Recent Users</h2>

      {/* Recent Users Section */}
      <div className='bg-white rounded-2xl'>
        {/* ── Desktop Table ── */}
        <div className='hidden overflow-x-auto md:block'>
          <table className='w-full'>
            <thead>
              <tr className='bg-[#2563EB] text-white'>
                <th className='px-6 py-4 text-left text-lg font-semibold rounded-tl-2xl'>
                  Role
                </th>
                <th className='px-6 py-4 text-left text-lg font-semibold'>
                  User Name
                </th>
                <th className='px-6 py-4 text-left text-lg font-semibold'>
                  Email
                </th>
                <th className='px-6 py-4 text-left text-lg font-semibold'>
                  Join Date
                </th>
                <th className='px-6 py-4 text-center text-lg font-semibold rounded-tr-2xl'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))
                : recentUsers.map((user) => (
                    <tr
                      key={user.user_id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4 text-[#404145] text-lg'>
                        {user.role}
                      </td>
                      <td className='px-6 py-4 text-[#404145] text-lg'>
                        {user.full_name}
                      </td>
                      <td className='px-6 py-4 text-[#404145] text-lg'>
                        {user.email}
                      </td>
                      <td className='px-6 py-4 text-[#404145] text-lg'>
                        {formatDate(user.date_joined)}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex justify-center gap-3'>
                          <button
                            onClick={() => handleDetailClick(user)}
                            className='rounded-full p-2 text-[#707270] hover:bg-gray-100 transition-colors'
                            aria-label='View details'
                          >
                            <Info size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card View ── */}
        <div className='space-y-4 p-4 md:hidden'>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <MobileCardSkeleton key={i} />
              ))
            : recentUsers.map((user) => (
                <Card key={user.user_id} className='border border-gray-200 p-4'>
                  <div className='mb-3 flex items-start justify-between'>
                    <span className='inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700'>
                      {user.role}
                    </span>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleDetailClick(user)}
                        className='rounded-full p-2 text-[#707270] hover:bg-gray-100 transition-colors'
                        aria-label='View details'
                      >
                        <Info size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className='rounded-full p-2 text-[#707270] hover:bg-red-50 hover:text-red-600 transition-colors'
                        aria-label='Delete user'
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div>
                      <p className='text-xs font-semibold text-gray-500'>
                        USER NAME
                      </p>
                      <p className='text-[#1A1A1A]'>{user.full_name}</p>
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-gray-500'>
                        EMAIL
                      </p>
                      <p className='break-all text-[#1A1A1A]'>{user.email}</p>
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-gray-500'>
                        JOIN DATE
                      </p>
                      <p className='text-[#1A1A1A]'>
                        {formatDate(user.date_joined)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-xl'>User Details</DialogTitle>
            <DialogDescription>
              Complete information about this user
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className='py-2 space-y-0 divide-y divide-gray-100'>
              {/* Profile header */}
              <div className='flex items-center gap-4 pb-4'>
                <div className='h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold shrink-0'>
                  {selectedUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className='text-lg font-semibold text-[#1A1A1A]'>
                    {selectedUser.full_name}
                  </p>
                  <span className='inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700'>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              {/* Detail rows */}
              {[
                { label: "Email", value: selectedUser.email },
                { label: "Phone", value: selectedUser.phone || "—" },
                { label: "Company", value: selectedUser.company || "—" },
                { label: "Agency", value: selectedUser.agency_name || "—" },
                {
                  label: "Location",
                  value:
                    [selectedUser.city, selectedUser.country]
                      .filter(Boolean)
                      .join(", ") || "—",
                },
                {
                  label: "Website",
                  value: selectedUser.website || "—",
                  link: selectedUser.website || undefined,
                },
                { label: "Bio", value: selectedUser.bio || "—" },
                {
                  label: "Verified",
                  value: selectedUser.is_verified ? "Yes" : "No",
                },
                {
                  label: "Subscribed",
                  value: selectedUser.is_subscribed ? "Yes" : "No",
                },
                {
                  label: "Joined",
                  value: formatDate(selectedUser.date_joined),
                },
                {
                  label: "Last Updated",
                  value: formatDate(selectedUser.updated_at),
                },
              ].map(({ label, value, link }) => (
                <div key={label} className='flex justify-between gap-4 py-2.5'>
                  <span className='text-sm font-semibold text-[#707270] shrink-0'>
                    {label}
                  </span>
                  {link ? (
                    <a
                      href={link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-blue-600 hover:underline break-all text-right'
                    >
                      {value}
                    </a>
                  ) : (
                    <span className='text-sm text-[#1A1A1A] break-all text-right'>
                      {value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className='flex justify-end pt-2'>
            <Button onClick={() => setDetailModalOpen(false)} variant='outline'>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Modal ── */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className='font-semibold text-[#1A1A1A]'>
                {selectedUser?.full_name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='flex justify-end gap-3'>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-red-600 hover:bg-red-700 text-white'
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className='border-0 bg-white p-6 shadow-sm hover:shadow-md transition-shadow'>
      <p className='mb-2 text-lg font-medium text-[#707270]'>{title}</p>
      <p className='text-3xl font-bold text-[#1A1A1A]'>{value}</p>
    </Card>
  );
}
