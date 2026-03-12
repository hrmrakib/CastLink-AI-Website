"use client";

import React, { useState, useMemo } from "react";
import { Info, Trash2, Eye, Plus, Filter, X } from "lucide-react";

type TalentTab = "all" | "vault" | "pending";

interface Talent {
  id: string;
  name: string;
  skills: string[];
  agent: string;
  createdDate: string;
  status: "pending" | "approved" | "vault";
  waist: string;
  hips: string;
  shoeSize: string;
  eyeColour: string;
  hairType: string;
  height: string;
  bust: string;
  dressSize: string;
  hairColour: string;
  location: string;
  continent: string;
  country: string;
  dateOfBirth: string;
  skinColor: string;
  profileImage: string;
  photos: string[];
}

const mockTalents: Talent[] = [
  {
    id: "1",
    name: "Alex Thompson",
    skills: ["React", "Node.js", "MongoDB"],
    agent: "Sarah Johnson",
    createdDate: "2024-03-01",
    status: "pending",
    waist: "Waist",
    hips: "Hips",
    shoeSize: "Shoe Size",
    eyeColour: "Eye Colour",
    hairType: "Silk silky",
    height: "Height",
    bust: "Bust",
    dressSize: "Dress Size",
    hairColour: "Hair Colour",
    location: "Dhaka",
    continent: "Asia",
    country: "Bangladesh",
    dateOfBirth: "16/03/2000",
    skinColor: "White",
    profileImage:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eD9MmlvXWInACebXXowdOfKYKBOnrF.png",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      "https://images.unsplash.com/photo-1507892913342-955acc2b8e8f?w=400",
    ],
  },
  {
    id: "2",
    name: "Sarah Johnson",
    skills: ["Python", "Django", "ML"],
    agent: "Emily Davis",
    createdDate: "2024-03-01",
    status: "approved",
    waist: "Waist",
    hips: "Hips",
    shoeSize: "Shoe Size",
    eyeColour: "Eye Colour",
    hairType: "Silk silky",
    height: "Height",
    bust: "Bust",
    dressSize: "Dress Size",
    hairColour: "Hair Colour",
    location: "Dhaka",
    continent: "Asia",
    country: "Bangladesh",
    dateOfBirth: "16/03/2000",
    skinColor: "White",
    profileImage:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eD9MmlvXWInACebXXowdOfKYKBOnrF.png",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    ],
  },
  {
    id: "3",
    name: "James Kim",
    skills: ["UI/UX Design", "Figma"],
    agent: "Sarah Johnson",
    createdDate: "2024-03-01",
    status: "vault",
    waist: "Waist",
    hips: "Hips",
    shoeSize: "Shoe Size",
    eyeColour: "Eye Colour",
    hairType: "Silk silky",
    height: "Height",
    bust: "Bust",
    dressSize: "Dress Size",
    hairColour: "Hair Colour",
    location: "Dhaka",
    continent: "Asia",
    country: "Bangladesh",
    dateOfBirth: "16/03/2000",
    skinColor: "White",
    profileImage:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eD9MmlvXWInACebXXowdOfKYKBOnrF.png",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    ],
  },
  {
    id: "4",
    name: "Emily Davis",
    skills: ["Python", "Django", "ML"],
    agent: "Emily Davis",
    createdDate: "2024-03-01",
    status: "pending",
    waist: "Waist",
    hips: "Hips",
    shoeSize: "Shoe Size",
    eyeColour: "Eye Colour",
    hairType: "Silk silky",
    height: "Height",
    bust: "Bust",
    dressSize: "Dress Size",
    hairColour: "Hair Colour",
    location: "Dhaka",
    continent: "Asia",
    country: "Bangladesh",
    dateOfBirth: "16/03/2000",
    skinColor: "White",
    profileImage:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eD9MmlvXWInACebXXowdOfKYKBOnrF.png",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    ],
  },
];

export default function TalentManagement() {
  const [activeTab, setActiveTab] = useState<TalentTab>("all");
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [talents, setTalents] = useState(mockTalents);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [emailForm, setEmailForm] = useState({ subject: "", body: "" });
  const [showEmailForm, setShowEmailForm] = useState(false);

  const filteredTalents = useMemo(() => {
    if (activeTab === "all") return talents;
    if (activeTab === "vault")
      return talents.filter((t) => t.status === "vault");
    if (activeTab === "pending")
      return talents.filter((t) => t.status === "pending");
    return talents;
  }, [activeTab, talents]);

  const handleDelete = (id: string) => {
    setTalents(talents.filter((t) => t.id !== id));
    setDeleteConfirm(null);
  };

  const handleSendEmail = () => {
    if (selectedTalent && emailForm.subject && emailForm.body) {
      console.log("Email sent to:", selectedTalent.name, emailForm);
      setEmailForm({ subject: "", body: "" });
      setShowEmailForm(false);
      setSelectedTalent(null);
    }
  };

  return (
    <main className='min-h-screen bg-gray-50'>
      {/* Main Content */}
      <div className='container mx-auto'>
        {/* Tabs and Controls */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
          <div className='flex gap-2 overflow-x-auto'>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 whitespace-nowrap rounded-lg font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              All Talent
            </button>
            <button
              onClick={() => setActiveTab("vault")}
              className={`px-4 py-2 whitespace-nowrap rounded-lg font-medium transition-colors ${
                activeTab === "vault"
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Talent vault
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 whitespace-nowrap rounded-lg font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Pending Talent
            </button>
          </div>

          <div className='flex gap-2'>
            <button className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium'>
              <Filter size={18} />
              <span className='hidden sm:inline'>Filter</span>
            </button>
            <button className='flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'>
              <Plus size={18} />
              <span className='hidden sm:inline'>Add Talent</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-[#2563EB] text-white'>
                  <th className='px-4 py-4 text-left font-semibold text-sm'>
                    Name
                  </th>
                  <th className='px-4 py-4 text-left font-semibold text-sm'>
                    Skills
                  </th>
                  <th className='px-4 py-4 text-left font-semibold text-sm'>
                    Agent
                  </th>
                  <th className='px-4 py-4 text-left font-semibold text-sm'>
                    Created Date
                  </th>
                  <th className='px-4 py-4 text-left font-semibold text-sm'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTalents.map((talent, idx) => (
                  <tr
                    key={talent.id}
                    className={`border-t border-gray-200 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className='px-4 py-4 text-sm font-medium text-gray-900'>
                      {talent.name}
                    </td>
                    <td className='px-4 py-4 text-sm text-gray-700'>
                      <div className='line-clamp-2'>
                        {talent.skills.join(", ")}
                      </div>
                    </td>
                    <td className='px-4 py-4 text-sm text-gray-700'>
                      {talent.agent}
                    </td>
                    <td className='px-4 py-4 text-sm text-gray-700'>
                      {talent.createdDate}
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-3'>
                        {/* <button
                          onClick={() => setSelectedTalent(talent)}
                          className='p-2 hover:bg-blue-100 rounded-lg transition-colors text-[#2563EB]'
                          title='View details'
                        >
                          <Info size={18} />
                        </button> */}
                        <button
                          onClick={() => setDeleteConfirm(talent.id)}
                          className='p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600'
                          title='Delete'
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => setSelectedTalent(talent)}
                          className='p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600'
                          title='View'
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTalents.length === 0 && (
            <div className='px-4 py-12 text-center text-gray-500'>
              No talents found
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTalent && !showEmailForm && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto'>
          <div className='bg-white rounded-lg max-w-4xl w-full my-8'>
            <div className='flex justify-between items-center p-6 border-b'>
              <h2 className='text-2xl font-bold text-gray-900'>
                Talent Profile
              </h2>
              <button
                onClick={() => setSelectedTalent(null)}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X size={24} />
              </button>
            </div>

            <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-96 md:max-h-96 overflow-y-auto'>
              {/* Left Column - Details */}
              <div className='space-y-4 text-sm'>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>Name:</span>
                  <span className='text-gray-600'>{selectedTalent.name}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>Waist:</span>
                  <span className='text-gray-600'>{selectedTalent.waist}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>Hips:</span>
                  <span className='text-gray-600'>{selectedTalent.hips}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>
                    Shoe Size:
                  </span>
                  <span className='text-gray-600'>
                    {selectedTalent.shoeSize}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>
                    Eye Colour:
                  </span>
                  <span className='text-gray-600'>
                    {selectedTalent.eyeColour}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>
                    Hair Type:
                  </span>
                  <span className='text-gray-600'>
                    {selectedTalent.hairType}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>Height:</span>
                  <span className='text-gray-600'>{selectedTalent.height}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>Bust:</span>
                  <span className='text-gray-600'>{selectedTalent.bust}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>
                    Dress Size:
                  </span>
                  <span className='text-gray-600'>
                    {selectedTalent.dressSize}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>
                    Hair Colour:
                  </span>
                  <span className='text-gray-600'>
                    {selectedTalent.hairColour}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>Location:</span>
                  <span className='text-gray-600'>
                    {selectedTalent.location}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>
                    Continent:
                  </span>
                  <span className='text-gray-600'>
                    {selectedTalent.continent}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>Country:</span>
                  <span className='text-gray-600'>
                    {selectedTalent.country}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>Date:</span>
                  <span className='text-gray-600'>
                    {selectedTalent.dateOfBirth}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='font-semibold text-gray-700'>
                    Skin color:
                  </span>
                  <span className='text-gray-600'>
                    {selectedTalent.skinColor}
                  </span>
                </div>
              </div>

              {/* Right Column - Image */}
              <div className='flex flex-col gap-4'>
                <img
                  src={selectedTalent.profileImage}
                  alt={selectedTalent.name}
                  className='w-full h-60 object-cover rounded-lg'
                />
                <div className='flex gap-2 overflow-x-auto'>
                  {selectedTalent.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Photo ${idx + 1}`}
                      className='h-20 w-20 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80'
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='p-6 border-t bg-gray-50 grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <button className='px-6 py-3 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors'>
                Approve
              </button>
              <button className='px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors'>
                Reject
              </button>
              <button
                onClick={() => setShowEmailForm(true)}
                className='px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors'
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Form Modal */}
      {selectedTalent && showEmailForm && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-md w-full'>
            <div className='flex justify-between items-center p-6 border-b'>
              <h2 className='text-xl font-bold text-gray-900'>Send Email</h2>
              <button
                onClick={() => {
                  setShowEmailForm(false);
                  setEmailForm({ subject: "", body: "" });
                }}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X size={24} />
              </button>
            </div>

            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  To: {selectedTalent.name}
                </label>
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Subject:
                </label>
                <input
                  type='text'
                  value={emailForm.subject}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, subject: e.target.value })
                  }
                  placeholder='Enter subject'
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Body:
                </label>
                <textarea
                  value={emailForm.body}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, body: e.target.value })
                  }
                  placeholder='Enter message'
                  rows={6}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                />
              </div>
            </div>

            <div className='p-6 border-t bg-gray-50 flex gap-3'>
              <button
                onClick={() => {
                  setShowEmailForm(false);
                  setEmailForm({ subject: "", body: "" });
                }}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                className='flex-1 px-4 py-2 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors'
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-sm w-full'>
            <div className='p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>
                Confirm Delete
              </h2>
              <p className='text-gray-600 mb-6'>
                Are you sure you want to delete this talent? This action cannot
                be undone.
              </p>
            </div>

            <div className='p-6 border-t bg-gray-50 flex gap-3'>
              <button
                onClick={() => setDeleteConfirm(null)}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className='flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
