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

interface User {
  id: string;
  role: "Client" | "Agent";
  name: string;
  email: string;
  joinDate: string;
}

const initialUsers: User[] = [
  {
    id: "1",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
  },
  {
    id: "2",
    role: "Agent",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
  },
  {
    id: "3",
    role: "Agent",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
  },
  {
    id: "4",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
  },
  {
    id: "5",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
  },
  {
    id: "6",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
  },
  {
    id: "7",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
  },
  {
    id: "8",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
  },
  {
    id: "9",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
  },
];

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const getRoleCount = (role: "Client" | "Agent") => {
    return users.filter((u) => u.role === role).length;
  };

  const handleDetailClick = (user: User) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setDeleteModalOpen(false);
      toast.success("User deleted successfully!");
      setSelectedUser(null);
    }
  };

  return (
    <main className='min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8'>
      {/* Stat Cards */}
      <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard title='Total Clients' value={`${getRoleCount("Client")}`} />
        <StatCard title='Total Agents' value={`${getRoleCount("Agent")}`} />
        <StatCard title='Active Jobs' value='8' />
        <StatCard title='Total Talents' value={users.length.toString()} />
      </div>

      <h2 className='mb-6 text-2xl font-bold text-[#1A1A1A]'>Recent Users</h2>

      {/* Recent Users Section */}
      <div className='bg-white rounded-2xl'>
        {/* Desktop Table */}
        <div className='hidden overflow-x-auto md:block'>
          <table className='w-full'>
            <thead>
              <tr className='bg-[#2563EB] text-white'>
                <th className='px-6 py-4 text-left text-sm font-semibold  rounded-tl-2xl'>
                  Role
                </th>
                <th className='px-6 py-4 text-left text-sm font-semibold'>
                  User Name
                </th>
                <th className='px-6 py-4 text-left text-sm font-semibold'>
                  Email
                </th>
                <th className='px-6 py-4 text-left text-sm font-semibold'>
                  Join Date
                </th>
                <th className='px-6 py-4 text-center text-sm font-semibold rounded-tr-2xl'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className='hover:bg-gray-50 transition-colors'
                >
                  <td className='px-6 py-4 text-gray-700'>{user.role}</td>
                  <td className='px-6 py-4 text-gray-700'>{user.name}</td>
                  <td className='px-6 py-4 text-gray-700'>{user.email}</td>
                  <td className='px-6 py-4 text-gray-700'>{user.joinDate}</td>
                  <td className='px-6 py-4'>
                    <div className='flex justify-center gap-3'>
                      <button
                        onClick={() => handleDetailClick(user)}
                        className='rounded-full p-2 text-[#707270] hover:bg-gray-100 transition-colors'
                        aria-label='View details'
                      >
                        <Info size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className='rounded-full p-2 text-[#707270] hover:bg-red-50 hover:text-red-600 transition-colors'
                        aria-label='Delete user'
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className='space-y-4 md:hidden'>
          {users.map((user) => (
            <Card key={user.id} className='border border-gray-200 p-4'>
              <div className='mb-3 flex items-start justify-between'>
                <div>
                  <span className='inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700'>
                    {user.role}
                  </span>
                </div>
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
                  <p className='text-[#1A1A1A]'>{user.name}</p>
                </div>
                <div>
                  <p className='text-xs font-semibold text-gray-500'>EMAIL</p>
                  <p className='break-all text-[#1A1A1A]'>{user.email}</p>
                </div>
                <div>
                  <p className='text-xs font-semibold text-gray-500'>
                    JOIN DATE
                  </p>
                  <p className='text-[#1A1A1A]'>{user.joinDate}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View complete information about this user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className='space-y-4 py-4'>
              <div className='grid gap-2'>
                <label className='text-sm font-semibold text-[#707270]'>
                  Role
                </label>
                <p className='text-[#1A1A1A]'>{selectedUser.role}</p>
              </div>
              <div className='grid gap-2'>
                <label className='text-sm font-semibold text-[#707270]'>
                  Name
                </label>
                <p className='text-[#1A1A1A]'>{selectedUser.name}</p>
              </div>
              <div className='grid gap-2'>
                <label className='text-sm font-semibold text-[#707270]'>
                  Email
                </label>
                <p className='break-all text-[#1A1A1A]'>{selectedUser.email}</p>
              </div>
              <div className='grid gap-2'>
                <label className='text-sm font-semibold text-[#707270]'>
                  Join Date
                </label>
                <p className='text-[#1A1A1A]'>{selectedUser.joinDate}</p>
              </div>
            </div>
          )}
          <div className='flex justify-end'>
            <Button onClick={() => setDetailModalOpen(false)} variant='outline'>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action
              cannot be undone.
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
      <p className='mb-2 text-sm font-medium text-[#707270]'>{title}</p>
      <p className='text-3xl font-bold text-[#1A1A1A]'>{value}</p>
    </Card>
  );
}
