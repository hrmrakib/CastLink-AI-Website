"use client";

import { useState } from "react";
import { Info, Trash2, UserPlus } from "lucide-react";

interface User {
  id: string;
  role: "Client" | "Agent";
  name: string;
  email: string;
  joinDate: string;
  website?: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    role: "Client",
    name: "Jony",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
    website: "https.www.com",
  },
  {
    id: "2",
    role: "Agent",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
    website: "https.www.com",
  },
  {
    id: "3",
    role: "Agent",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
    website: "https.www.com",
  },
  {
    id: "4",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
    website: "https.www.com",
  },
  {
    id: "5",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
    website: "https.www.com",
  },
  {
    id: "6",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
    website: "https.www.com",
  },
  {
    id: "7",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
    website: "https.www.com",
  },
  {
    id: "8",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
    website: "https.www.com",
  },
  {
    id: "9",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
    website: "https.www.com",
  },
  {
    id: "10",
    role: "Client",
    name: "User",
    email: "name@gmail.com",
    joinDate: "1 Jan, 2025",
    website: "https.www.com",
  },
];

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<"Client" | "Agent">("Client");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [users, setUsers] = useState(mockUsers);

  const filteredUsers = users.filter((user) => user.role === activeTab);

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
    setDeleteConfirmId(null);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto container'>
        {/* Header */}
        <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <h1 className='text-2xl font-bold text-gray-900'>Recent Users</h1>
          <button className='flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-white transition-colors hover:bg-blue-700'>
            <UserPlus size={20} />
            <span className='hidden sm:inline'>Add User</span>
            <span className='sm:hidden'>Add</span>
          </button>
        </div>

        {/* Tabs */}
        <div className='mb-6 flex gap-4'>
          <button
            onClick={() => setActiveTab("Client")}
            className={`px-6 py-2.5 font-medium text-lg transition-colors ${
              activeTab === "Client"
                ? "bg-white text-[#2563EB] rounded-md shadow-sm"
                : "text-[#2563EB] hover:text-[#084bdb]"
            }`}
          >
            Client
          </button>
          <button
            onClick={() => setActiveTab("Agent")}
            className={`px-6 py-2.5 font-medium text-lg transition-colors ${
              activeTab === "Agent"
                ? "bg-white text-[#2563EB] rounded-md shadow-sm"
                : "text-[#2563EB] hover:text-[#084bdb]"
            }`}
          >
            Agents
          </button>
        </div>

        {/* Table - Desktop */}
        <div className='hidden overflow-x-auto rounded-lg shadow md:block'>
          <table className='w-full'>
            <thead>
              <tr className='bg-[#2563EB] text-white'>
                <th className='px-6 py-4 text-left text-lg font-semibold'>
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
                <th className='px-6 py-4 text-center text-lg font-semibold'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {filteredUsers.map((user) => (
                <tr key={user.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 text-lg text-gray-900'>
                    {user.role}
                  </td>
                  <td className='px-6 py-4 text-lg text-gray-900'>
                    {user.name}
                  </td>
                  <td className='px-6 py-4 text-lg text-gray-900'>
                    {user.email}
                  </td>
                  <td className='px-6 py-4 text-lg text-gray-900'>
                    {user.joinDate}
                  </td>
                  <td className='flex justify-center gap-3 px-6 py-4'>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className='text-gray-600 transition-colors hover:text-[#2563EB]'
                      aria-label='View details'
                    >
                      <Info size={20} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(user.id)}
                      className='text-gray-600 transition-colors hover:text-red-600'
                      aria-label='Delete user'
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className='space-y-4 md:hidden'>
          {filteredUsers.map((user) => (
            <div key={user.id} className='rounded-lg bg-white p-4 shadow'>
              <div className='mb-3 flex items-start justify-between'>
                <div className='flex-1'>
                  <p className='text-xs font-semibold text-gray-500'>ROLE</p>
                  <p className='text-sm font-medium text-gray-900'>
                    {user.role}
                  </p>
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className='text-gray-600 transition-colors hover:text-[#2563EB]'
                    aria-label='View details'
                  >
                    <Info size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(user.id)}
                    className='text-gray-600 transition-colors hover:text-red-600'
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
                  <p className='text-sm text-gray-900'>{user.name}</p>
                </div>
                <div>
                  <p className='text-xs font-semibold text-gray-500'>EMAIL</p>
                  <p className='text-sm text-gray-900'>{user.email}</p>
                </div>
                <div>
                  <p className='text-xs font-semibold text-gray-500'>
                    JOIN DATE
                  </p>
                  <p className='text-sm text-gray-900'>{user.joinDate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50 overflow-y-auto'>
          <div className='w-full max-w-md rounded-xl bg-white p-6 shadow-lg'>
            <h2 className='mb-6 text-center text-2xl font-bold text-gray-900'>
              User Details
            </h2>

            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium text-gray-700'>User Name :</p>
                <p className='text-sm text-gray-900'>{selectedUser.name}</p>
              </div>

              <div>
                <p className='text-sm font-medium text-gray-700'>Email :</p>
                <p className='text-sm text-gray-900'>{selectedUser.email}</p>
              </div>

              <div>
                <p className='text-sm font-medium text-gray-700'>Website :</p>
                <p className='text-sm text-gray-900'>{selectedUser.website}</p>
              </div>

              <div>
                <p className='text-sm font-medium text-gray-700'>Role</p>
                <p className='text-sm text-gray-900'>{selectedUser.role}</p>
              </div>

              <div>
                <p className='text-sm font-medium text-gray-700'>Date :</p>
                <p className='text-sm text-gray-900'>{selectedUser.joinDate}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className='mt-6 w-full rounded-full bg-[#2563EB] py-2.5 text-white font-semibold transition-colors hover:bg-blue-700'
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50 overflow-y-auto'>
          <div className='w-full max-w-sm rounded-xl bg-white p-6 shadow-lg'>
            <h2 className='mb-4 text-lg font-bold text-gray-900'>
              Confirm Delete
            </h2>
            <p className='mb-6 text-gray-700'>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>

            <div className='flex gap-3'>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className='flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmId)}
                className='flex-1 rounded-lg bg-red-600 py-2 font-medium text-white transition-colors hover:bg-red-700'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
