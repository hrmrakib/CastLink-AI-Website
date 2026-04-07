"use client";

import { useState } from "react";
import { Info, Trash2, UserPlus } from "lucide-react";
import { useGetUserByRoleQuery } from "@/redux/features/admin/adminAPI";

interface ApiUser {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  profile_pic: string;
  is_active: boolean;
  date_joined: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
function TableRowSkeleton() {
  return (
    <tr className='border-b border-gray-200 bg-white'>
      {[..."12345"].map((i) => (
        <td key={i} className='px-6 py-4'>
          <div
            className='h-4 rounded bg-gray-200 animate-pulse'
            style={{ width: i === "5" ? 64 : i === "3" ? 160 : 96 }}
          />
        </td>
      ))}
    </tr>
  );
}

function MobileCardSkeleton() {
  return (
    <div className='rounded-lg bg-white p-4 shadow space-y-3'>
      <div className='flex items-start justify-between'>
        <div className='space-y-1.5'>
          <div className='h-3 w-10 rounded bg-gray-200 animate-pulse' />
          <div className='h-4 w-20 rounded bg-gray-200 animate-pulse' />
        </div>
        <div className='flex gap-2'>
          <div className='h-7 w-7 rounded bg-gray-200 animate-pulse' />
          <div className='h-7 w-7 rounded bg-gray-200 animate-pulse' />
        </div>
      </div>
      {[140, 176, 96].map((w) => (
        <div key={w} className='space-y-1'>
          <div className='h-3 w-14 rounded bg-gray-200 animate-pulse' />
          <div
            className='h-4 rounded bg-gray-200 animate-pulse'
            style={{ width: w }}
          />
        </div>
      ))}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<"Client" | "Agent">("Agent");
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<ApiUser | null>(
    null,
  );
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  const { data, isFetching } = useGetUserByRoleQuery({ role: activeTab });

  const users: ApiUser[] = (data?.data ?? []).filter(
    (u: ApiUser) => !deletedIds.includes(u.user_id),
  );

  const handleDeleteUser = () => {
    if (!deleteConfirmUser) return;
    setDeletedIds((prev) => [...prev, deleteConfirmUser.user_id]);
    setDeleteConfirmUser(null);
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
          {(["Client", "Agent"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 font-medium text-lg transition-colors ${
                activeTab === tab
                  ? "bg-white text-[#2563EB] rounded-md shadow-sm"
                  : "text-[#2563EB] hover:text-[#084bdb]"
              }`}
            >
              {tab === "Client" ? "Clients" : "Agents"}
            </button>
          ))}
        </div>

        {/* ── Desktop Table ── */}
        <div className='hidden overflow-x-auto rounded-lg shadow md:block'>
          <table className='w-full'>
            <thead>
              <tr className='bg-[#2563EB] text-white'>
                {["Role", "User Name", "Email", "Join Date", "Action"].map(
                  (h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-lg font-semibold ${h === "Action" ? "text-center" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {isFetching ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className='py-16 text-center text-gray-400'>
                    No {activeTab.toLowerCase()}s found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.user_id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4 text-lg text-gray-900'>
                      {user.role}
                    </td>
                    <td className='px-6 py-4 text-lg text-gray-900'>
                      {user.full_name}
                    </td>
                    <td className='px-6 py-4 text-lg text-gray-900'>
                      {user.email}
                    </td>
                    <td className='px-6 py-4 text-lg text-gray-900'>
                      {formatDate(user.date_joined)}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex justify-center gap-3'>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className='text-gray-600 transition-colors hover:text-[#2563EB]'
                          aria-label='View details'
                        >
                          <Info size={20} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmUser(user)}
                          className='text-gray-600 transition-colors hover:text-red-600'
                          aria-label='Delete user'
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card View ── */}
        <div className='space-y-4 md:hidden'>
          {isFetching ? (
            Array.from({ length: 5 }).map((_, i) => (
              <MobileCardSkeleton key={i} />
            ))
          ) : users.length === 0 ? (
            <div className='py-16 text-center text-gray-400'>
              No {activeTab.toLowerCase()}s found.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.user_id}
                className='rounded-lg bg-white p-4 shadow'
              >
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
                      onClick={() => setDeleteConfirmUser(user)}
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
                    <p className='text-sm text-gray-900'>{user.full_name}</p>
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-gray-500'>EMAIL</p>
                    <p className='break-all text-sm text-gray-900'>
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-gray-500'>
                      JOIN DATE
                    </p>
                    <p className='text-sm text-gray-900'>
                      {formatDate(user.date_joined)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto'>
          <div className='w-full max-w-md rounded-xl bg-white shadow-lg overflow-hidden'>
            {/* Modal header */}
            <div className='bg-[#2563EB] px-6 py-5 text-white text-center'>
              <div className='mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold'>
                {selectedUser.full_name.charAt(0).toUpperCase()}
              </div>
              <h2 className='text-xl font-bold'>{selectedUser.full_name}</h2>
              <span className='mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-sm font-medium'>
                {selectedUser.role}
              </span>
            </div>

            {/* Modal body */}
            <div className='divide-y divide-gray-100 px-6'>
              {[
                { label: "Email", value: selectedUser.email },
                { label: "Phone", value: selectedUser.phone || "—" },
                {
                  label: "Status",
                  value: selectedUser.is_active ? "Active" : "Inactive",
                  badge: true,
                  active: selectedUser.is_active,
                },
                {
                  label: "Joined",
                  value: formatDate(selectedUser.date_joined),
                },
              ].map(({ label, value, badge, active }) => (
                <div
                  key={label}
                  className='flex items-center justify-between py-3 gap-4'
                >
                  <span className='text-sm font-semibold text-gray-500 shrink-0'>
                    {label}
                  </span>
                  {badge ? (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {value}
                    </span>
                  ) : (
                    <span className='text-sm text-gray-900 break-all text-right'>
                      {value}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className='px-6 pb-6 pt-2'>
              <button
                onClick={() => setSelectedUser(null)}
                className='w-full rounded-full bg-[#2563EB] py-2.5 font-semibold text-white transition-colors hover:bg-blue-700'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirmUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
          <div className='w-full max-w-sm rounded-xl bg-white p-6 shadow-lg'>
            <h2 className='mb-2 text-lg font-bold text-gray-900'>
              Confirm Delete
            </h2>
            <p className='mb-6 text-gray-600'>
              Are you sure you want to delete{" "}
              <span className='font-semibold text-gray-900'>
                {deleteConfirmUser.full_name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className='flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
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
