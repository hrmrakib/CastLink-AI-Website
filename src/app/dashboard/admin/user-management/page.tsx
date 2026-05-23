"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Info,
  Loader,
  Loader2,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  useApproveOrRejectAgentMutation,
  useDeleteUserMutation,
  useGetUserByRoleQuery,
  useUpdateUserStatusMutation,
} from "@/redux/features/admin/adminAPI";
import { toast } from "sonner";
import GlobalPagination from "@/components/pagination/GlobalPagination";
import useDebounce from "@/hooks/useDebounce";

interface ApiUser {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  profile_pic: string;
  is_active: boolean;
  is_verified: boolean;
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

const TAB_LABELS: Record<"Client" | "Agent" | "Pending", string> = {
  Client: "Clients",
  Agent: "Agents",
  Pending: "Pending",
};

export default function UserManagement() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({ body: "" });
  const [activeTab, setActiveTab] = useState<"Client" | "Agent" | "Pending">(
    "Pending",
  );
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<ApiUser | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState("");
  // const [searchQuery, setSearchQuery] = useState("");
  const [deletedIds] = useState<number[]>([]);

  const [approveOrRejectAgentMutation, { isLoading: isApproving }] =
    useApproveOrRejectAgentMutation();
  const [deleteUserMutation, { isLoading: isDeleting }] =
    useDeleteUserMutation();

  const limit = 10;

  const searchDebounce = useDebounce(searchInput, 800);

  const [updateUserStatusMutation, { isLoading: isUpdatingStatus }] =
    useUpdateUserStatusMutation();
  const { data, isFetching } = useGetUserByRoleQuery({
    // If Pending, don't pass a role (or pass undefined)
    role: activeTab === "Pending" ? undefined : activeTab,

    // is_active is false only when Pending, otherwise true (or undefined)
    is_active: activeTab === "Pending" ? false : true,
    page: page,
    page_size: limit,
    search: searchDebounce,
  });

  const totalPages = data?.meta?.total_pages ?? 1;

  const users: ApiUser[] = (data?.data ?? []).filter(
    (u: ApiUser) => !deletedIds.includes(u.user_id),
  );

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;

    try {
      const res = await deleteUserMutation(
        deleteConfirmUser?.user_id ?? 0,
      ).unwrap();
      console.log(res);

      if (res?.status) {
        toast.success("Deleted successfully!");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteConfirmUser(null);
    }
  };

  const handleAcceptOrReject = async (
    id: number,
    action: string,
    message?: string,
  ) => {
    try {
      const res = await approveOrRejectAgentMutation({
        user_id: id,
        action,
        message,
      }).unwrap();

      if (res?.message) {
        toast.success(res?.message || "Approved successfully!");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSelectedUser(null);
    }
  };

  const handleSendEmail = async () => {
    if (!emailForm.body || !selectedUser) return;

    // await handleAcceptOrReject(selectedUser.user_id, "reject", emailForm.body);
    try {
      const res = await approveOrRejectAgentMutation({
        user_id: selectedUser.user_id,
        action: "reject",
        message: emailForm.body,
      }).unwrap();

      console.log({ res });

      if (res?.message) {
        toast.success(res?.message || "Rejected and email sent successfully!");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setShowEmailForm(false);
      setEmailForm({ body: "" });
      setSelectedUser(null);
    }
  };

  const handleToggleStatus = async (user: ApiUser) => {
    try {
      const res = await updateUserStatusMutation({
        userId: user.user_id,
        is_active: !user.is_active,
      }).unwrap();
      if (res?.success) {
        toast.success(res?.message || "Status updated!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status.");
    } finally {
      setSelectedUser(null);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto container'>
        {/* Header */}
        <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <h1 className='text-2xl font-bold text-gray-900'>All Users</h1>
        </div>

        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2'>
          {/* Tabs */}
          <div className='mb-6 flex gap-4'>
            {(["Client", "Agent", "Pending"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                  setSearchInput("");
                }}
                className={`relative px-6 py-2.5 font-medium text-lg transition-colors ${
                  activeTab === tab
                    ? "bg-white text-[#2563EB] rounded-md shadow-lg"
                    : "text-[#2563EB] hover:text-[#084bdb] border border-gray-200 rounded-xl"
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className='w-full lg:w-1/4 ml-auto flex flex-col gap-3 sm:flex-row sm:items-center'>
            <div className='relative flex-1 items-end'>
              <Search
                size={16}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
              />
              <input
                type='text'
                placeholder='Search jobs...'
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                // onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className='w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
              />
              <X
                onClick={() => setSearchInput("")}
                size={16}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'
              />
            </div>
            {/* <button
              onClick={handleSearch}
              className='rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700'
            >
              Search
            </button> */}
          </div>
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
                    <td className='flex items-center gap-1 px-6 py-4 text-lg text-gray-900'>
                      {user.full_name}{" "}
                      <span title='Verified'>
                        {user.is_verified && (
                          <BadgeCheck className='text-green-500' size={20} />
                        )}
                      </span>
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

        {!isFetching && totalPages > 1 && (
          <GlobalPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(page) => {
              setPage(page);
              setSearchInput("");
            }}
          />
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto'>
          <div className='w-full max-w-md rounded-xl bg-white shadow-lg overflow-hidden'>
            {/* Modal header */}
            <div className='relative bg-[#2563EB] px-6 py-5 text-white text-center'>
              <button
                onClick={() => setSelectedUser(null)}
                className='absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/20 transition-colors'
                aria-label='Close'
              >
                <X size={20} />
              </button>
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
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
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

            {/* Action buttons — only for Pending tab */}
            {activeTab === "Pending" ? (
              <div className='p-6 border-t bg-gray-50 grid grid-cols-2 gap-3'>
                <button
                  disabled={!selectedUser || isApproving}
                  onClick={() =>
                    handleAcceptOrReject(selectedUser?.user_id, "approve")
                  }
                  className='flex items-center justify-center gap-1.5 py-2.5 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Approve{" "}
                  {isApproving ? <Loader2 className='animate-spin' /> : ""}
                </button>
                <button
                  disabled={!selectedUser || isApproving}
                  onClick={() => setShowEmailForm(true)}
                  className='py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className='p-6 border-t bg-gray-50 grid grid-cols-2 gap-3'>
                <button
                  onClick={() => handleToggleStatus(selectedUser)}
                  disabled={isUpdatingStatus}
                  className={`flex items-center justify-center gap-1.5 py-2.5 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedUser.is_active
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {selectedUser.is_active ? "Deactivate" : "Activate"}
                  {isUpdatingStatus && (
                    <Loader2 size={16} className='animate-spin' />
                  )}
                </button>
                <button
                  disabled={!selectedUser || isUpdatingStatus}
                  onClick={() => setSelectedUser(null)}
                  className='py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors'
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Form Modal */}
      {selectedUser && showEmailForm && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-md w-full'>
            <div className='flex justify-between items-center p-6 border-b'>
              <h2 className='text-xl font-bold text-gray-900'>
                Rejection Reason
              </h2>
              <button
                onClick={() => {
                  setShowEmailForm(false);
                  setEmailForm({ body: "" });
                }}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X size={24} />
              </button>
            </div>

            <div className='p-6 space-y-4'>
              <label className='block text-lg font-semibold text-gray-700'>
                To: {selectedUser.full_name}
              </label>

              <div>
                <label className='block text-lg font-semibold text-gray-700 mb-2'>
                  Body:
                </label>
                <textarea
                  value={emailForm.body}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, body: e.target.value })
                  }
                  placeholder='Enter reason for rejection'
                  rows={6}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                />
              </div>
            </div>

            <div className='p-6 border-t bg-gray-50 flex gap-3'>
              <button
                onClick={() => {
                  setShowEmailForm(false);
                  setEmailForm({ body: "" });
                }}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={!emailForm.body || isApproving}
                className='flex-1 px-4 py-2 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5'
              >
                Reject{" "}
                {isApproving ? (
                  <Loader size={16} className='animate-spin' />
                ) : (
                  ""
                )}
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
                disabled={isDeleting}
                onClick={() => setDeleteConfirmUser(null)}
                className='flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteUser}
                className='flex items-center justify-center gap-1.5 flex-1 rounded-lg bg-red-600 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed'
              >
                Delete {isDeleting ? <Loader2 className='animate-spin' /> : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
