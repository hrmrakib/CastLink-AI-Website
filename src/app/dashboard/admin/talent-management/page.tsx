/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Trash2, Eye, X, Loader2, Search } from "lucide-react";
import {
  useApproveOrRejectTalentMutation,
  useDeleteTalentMutation,
  useGetTalentsQuery,
} from "@/redux/features/admin/adminAPI";
import { toast } from "sonner";
import GlobalPagination from "@/components/pagination/GlobalPagination";
import useDebounce from "@/hooks/useDebounce";

type TalentTab = "approved" | "pending";

interface TalentImage {
  image_id: number;
  image: string;
  is_primary: boolean;
  uploaded_at: string;
}

interface Talent {
  talent_id: number;
  agent_name: string;
  gender: string;
  name: string;
  height: string | null;
  country: string;
  location: string;
  approval_status: string;
  images: TalentImage[];
  created_at: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const TAB_CONFIG: { key: TalentTab; label: string }[] = [
  { key: "approved", label: "Active Talent" },
  { key: "pending", label: "Pending Talent" },
];

export default function TalentManagement() {
  const [activeTab, setActiveTab] = useState<TalentTab>("approved");
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [emailForm, setEmailForm] = useState({ body: "" });
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const searchDebounce = useDebounce(searchInput, 800);

  const [approveOrRejectTalentMutation, { isLoading: isApproving }] =
    useApproveOrRejectTalentMutation();
  const [deleteTalentMutation, { isLoading: isDeleting }] =
    useDeleteTalentMutation();
  const [page, setPage] = useState(1);

  const limit = 10;

  const { data, isFetching, refetch } = useGetTalentsQuery({
    approval_status: activeTab,
    page: page,
    page_size: limit,
    search: searchDebounce,
  });
  const talents: Talent[] = data?.data ?? [];

  const totalPages = data?.meta?.total_pages ?? 1;

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const res = await deleteTalentMutation(deleteConfirm ?? 0).unwrap();
      console.log(res);

      if (res?.status) {
        toast.success("Deleted successfully!");
        refetch();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleAcceptOrReject = async (
    id: number,
    action: string,
    message?: string,
  ) => {
    try {
      const res = await approveOrRejectTalentMutation({
        talent_id: id,
        action, //reject
        message,
      }).unwrap();

      console.log({ res });

      if (res?.status) {
        toast.success(res?.message);
        refetch();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSelectedTalent(null);
    }
  };

  const handleSendEmail = async () => {
    if (!emailForm.body || !selectedTalent) return;

    await handleAcceptOrReject(
      selectedTalent.talent_id,
      "reject",
      emailForm.body,
    );

    setShowEmailForm(false);
    setEmailForm({ body: "" });
    setSelectedTalent(null);
  };

  const getPrimaryImage = (images: TalentImage[]) => {
    const primary = images.find((img) => img.is_primary) ?? images[0];
    return primary ? `${BASE_URL}${primary.image}` : null;
  };

  return (
    <main className='min-h-screen bg-gray-50'>
      <div className='container mx-auto'>
        {/* Tabs and Controls */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
          <div className='flex gap-2 overflow-x-auto'>
            {TAB_CONFIG.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setPage(1);
                }}
                className={`px-4 py-2 whitespace-nowrap rounded-lg font-medium transition-colors ${
                  activeTab === key
                    ? "bg-[#2563EB] text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className='w-full lg:w-1/3 ml-auto flex flex-col gap-3 sm:flex-row sm:items-center'>
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
                className='w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
              />

              <X
                onClick={() => setSearchInput("")}
                size={16}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-[#2563EB] text-white'>
                  {[
                    "Name",
                    "Agent",
                    "Gender",
                    "Location",
                    "Created Date",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className='px-4 py-4 text-left font-semibold text-lg'
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isFetching ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className='border-t border-gray-200'>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className='px-4 py-4'>
                          <div className='h-4 rounded bg-gray-200 animate-pulse w-24' />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : talents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className='px-4 py-12 text-center text-gray-500'
                    >
                      No talents found
                    </td>
                  </tr>
                ) : (
                  talents.map((talent, idx) => (
                    <tr
                      key={talent.talent_id}
                      className={`border-t border-gray-200 hover:bg-gray-50 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className='px-4 py-4 text-lg font-medium text-gray-900'>
                        {talent.name}
                      </td>
                      <td className='px-4 py-4 text-lg text-gray-700'>
                        {talent.agent_name}
                      </td>
                      <td className='px-4 py-4 text-lg text-gray-700 capitalize'>
                        {talent.gender}
                      </td>
                      <td className='px-4 py-4 text-lg text-gray-700'>
                        {talent.location}, {talent.country}
                      </td>
                      <td className='px-4 py-4 text-lg text-gray-700'>
                        {formatDate(talent.created_at)}
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex items-center gap-3'>
                          <button
                            onClick={() => setSelectedTalent(talent)}
                            className='p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600'
                            title='View'
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(talent.talent_id)}
                            className='p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600'
                            title='Delete'
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
      {selectedTalent && !showEmailForm && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto'>
          <div className='bg-white rounded-xl max-w-2xl w-full my-8 shadow-lg overflow-hidden'>
            {/* Header */}
            <div className='relative bg-[#2563EB] px-6 py-5 text-white text-center'>
              <button
                onClick={() => setSelectedTalent(null)}
                className='absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/20 transition-colors'
              >
                <X size={20} />
              </button>
              <div className='mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold overflow-hidden'>
                {getPrimaryImage(selectedTalent.images) ? (
                  <img
                    src={getPrimaryImage(selectedTalent.images)!}
                    alt={selectedTalent.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  selectedTalent.name.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className='text-xl font-bold'>{selectedTalent.name}</h2>
              <span className='mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-sm font-medium capitalize'>
                {selectedTalent.gender}
              </span>
            </div>

            {/* Body */}
            <div className='divide-y divide-gray-100 px-6'>
              {[
                { label: "Agent", value: selectedTalent.agent_name },
                { label: "Height", value: selectedTalent.height ?? "—" },
                { label: "Location", value: selectedTalent.location },
                { label: "Country", value: selectedTalent.country },
                {
                  label: "Created",
                  value: formatDate(selectedTalent.created_at),
                },
                {
                  label: "Status",
                  value: selectedTalent.approval_status,
                  badge: true,
                },
              ].map(({ label, value, badge }) => (
                <div
                  key={label}
                  className='flex items-center justify-between py-3 gap-4'
                >
                  <span className='text-sm font-semibold text-gray-500 shrink-0'>
                    {label}
                  </span>
                  {badge ? (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        value === "approved"
                          ? "bg-green-100 text-green-700"
                          : value === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      {value}
                    </span>
                  ) : (
                    <span className='text-sm text-gray-900 text-right'>
                      {value}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Photos */}
            {selectedTalent.images.length > 0 && (
              <div className='px-6 py-4 border-t'>
                <p className='text-sm font-semibold text-gray-500 mb-3'>
                  Photos
                </p>
                <div className='flex gap-2 overflow-x-auto'>
                  {selectedTalent.images.map((img) => (
                    <img
                      key={img.image_id}
                      src={`${BASE_URL}${img.image}`}
                      alt='talent'
                      className='h-20 w-20 object-cover rounded-lg shrink-0'
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {activeTab === "pending" ? (
              <div className='p-6 border-t bg-gray-50 grid grid-cols-2 gap-3'>
                <button
                  onClick={() =>
                    handleAcceptOrReject(selectedTalent.talent_id, "approve")
                  }
                  disabled={isApproving}
                  className='flex items-center justify-center gap-1.5 py-2.5 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Approve{" "}
                  {isApproving ? <Loader2 className='animate-spin' /> : ""}
                </button>

                <button
                  disabled={isApproving}
                  onClick={() => setShowEmailForm(true)}
                  className='py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className='px-6 pb-6 pt-4'>
                <button
                  onClick={() => setSelectedTalent(null)}
                  className='w-full rounded-full bg-[#2563EB] py-2.5 font-semibold text-white transition-colors hover:bg-blue-700'
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Email Modal ── */}
      {selectedTalent && showEmailForm && (
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
              <p className='text-lg font-semibold text-gray-700'>
                To: {selectedTalent.name}
              </p>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Body
                </label>
                <textarea
                  value={emailForm.body}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, body: e.target.value })
                  }
                  placeholder='Enter message'
                  rows={6}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
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
                disabled={!emailForm.body || isApproving}
                onClick={handleSendEmail}
                className='flex-1 px-4 py-2 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteConfirm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-sm w-full p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-2'>
              Confirm Delete
            </h2>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to delete this talent? This action cannot be
              undone.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setDeleteConfirm(null)}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors'
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className='flex items-center justify-center gap-1 flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Delete {isDeleting ? <Loader2 className='animate-spin' /> : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
