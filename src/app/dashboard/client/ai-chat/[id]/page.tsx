/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Heart,
  Calendar,
  Camera,
  Phone,
  Check,
  Sparkles,
  ScanFace,
  Star,
  ShieldAlert,
  MessageCircleMore,
  Loader,
  Plus,
  X,
  Briefcase,
  User,
} from "lucide-react";
import Image from "next/image";
import ChatModalDetail from "@/components/dashboard/chat/ChatModal";
import { useDispatch, useSelector } from "react-redux";
import {
  useAiChatCreateMutation,
  useAssignRoleMutation,
  useUnassignRoleMutation,
  useBookTalentMutation,
  useECastingRequestMutation,
  useGenerateJobFromMessageMutation,
  useGetAvailableRolesQuery,
  useGetChatBySessionIdQuery,
  usePolasRequestMutation,
  useSelfTapRequestMutation,
  useShortlistTalentMutation,
} from "@/redux/features/ai-chat/aiChatAPI";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addTalentsToModal } from "@/redux/features/ai-chat/aiChatSlice";
import { ChatSkeleton } from "@/components/loading/ChatSkeleton";
import { useCreateConversationMutation } from "@/redux/features/messages/messagesAPI";
import { setConversation } from "@/redux/features/messages/conversationSlice";
import { formatAvailabilityDate } from "@/utils/formatAvailabilityDate";
import { getAIImageUrl, getImageUrl } from "@/lib/imagePath";

interface Message {
  id: number;
  sender: "ai" | "user";
  content: string;
  avatar?: string;
  timestamp?: string;
  talents?: TalentProfile[];
}

interface TalentProfile {
  talent_id: number;
  agent_id?: number;
  images: string[];
  is_active: boolean;
  name: string;
  role: string;
  agent_name: string;
  date_of_birth: string;
  gender: string;
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoe_size: string;
  dress_size: string;
  eye_color: string;
  hair_type: string;
  hair_color: string;
  skin_color: string;
  location: string;
  continent: string;
  country: string;
  is_available?: boolean;
  approval_status?: string;
  is_available_on_request?: boolean;
  available_dates?: string[];
  assigned_roles?: {
    job_id: number;
    job_title: string;
    role: string;
    status: boolean;
  }[];
}

interface AvailableRole {
  id: number;
  job_role: string;
  assign_status: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";
// Max talent cards to show before the "+N more" overlay

export default function AIDynamicPage() {
  const dispatch = useDispatch();
  const params = useParams();
  const id = params.id;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<TalentProfile | null>(
    null,
  );
  const [jobSaving, setJobSaving] = useState(false);
  const [selectedTalentIndex, setSelectedTalentIndex] = useState(0);
  const router = useRouter();
  const [maxVisibleTalent, setMaxVisibleTalent] = useState(4);
  const [isTalentExpand, setIsTalentExpand] = useState(false);

  const [isSkipping, setIsSkipping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [jobModal, setJobModal] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const sessionId = useSelector((state: any) => state.aiChat.sessionId);

  const [availabilityModal, setAvailabilityModal] = useState(false);
  const [selectedAvailabilityTalent, setSelectedAvailabilityTalent] =
    useState<TalentProfile | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    action: (() => void) | null;
    label: string;
  }>({ open: false, action: null, label: "" });

  // Assign role modal state
  const [assignRoleModal, setAssignRoleModal] = useState<{
    open: boolean;
    talent: TalentProfile | null;
  }>({ open: false, talent: null });
  const [assigningRoleId, setAssigningRoleId] = useState<number | null>(null);

  const withConfirm = (action: () => void, label: string) => {
    setConfirmModal({ open: true, action, label });
  };

  const { user } = useAuth();

  const [polasRequestMutation, { isLoading: polasLoading }] =
    usePolasRequestMutation();
  const [selfTapRequestMutation, { isLoading: selfTapLoading }] =
    useSelfTapRequestMutation();
  const [eCastingRequestMutation, { isLoading: eCastingLoading }] =
    useECastingRequestMutation();
  const [shortlistTalentMutation, { isLoading: shortlistLoading }] =
    useShortlistTalentMutation();
  const [bookTalentMutation, { isLoading: bookLoading }] =
    useBookTalentMutation();
  const [generatingCastingLoading, setGeneratingCastingLoading] =
    useState(false);

  const [generateJobFromMessageMutation] = useGenerateJobFromMessageMutation();
  const [aiChatCreateMutation, { isLoading: aiChatCreateLoading }] =
    useAiChatCreateMutation();
  const [createConversationMutation] = useCreateConversationMutation();
  const [loadingConversationId, setLoadingConversationId] = useState<
    number | null
  >(null);
  const [jobRole, setJobRole] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Invalid image format. Supported: .jpg, .jpeg, .png, .webp");
      e.target.value = "";
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setJobTitle("");
    setJobDescription("");
    setIsSkipping(false);
    setJobModal(false);
    setJobRole([]);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const {
    data,
    isLoading: isLoadingChat,
    refetch,
  } = useGetChatBySessionIdQuery(id);

  const jobId = data?.data?.job_id;

  const { data: availableRole } = useGetAvailableRolesQuery(jobId, {
    skip: !jobId,
  });
  const roles: AvailableRole[] = availableRole ?? [];
  // const test: string[] = JSON.parse(roles[0]?.job_role ?? "[]");

  const [assignRoleMutation] = useAssignRoleMutation();
  const [unassignRoleMutation] = useUnassignRoleMutation();

  const handleUnassignRole = async (jobRoleId: number) => {
    if (!assignRoleModal.talent) return;
    
    try {
      setAssigningRoleId(jobRoleId);
      const res = await unassignRoleMutation({
        job_role_id: jobRoleId,
        job_id: jobId,
        talent_id: assignRoleModal.talent.talent_id,
      }).unwrap();

      if (res?.status_message) {
        toast.success(res.status_message);
      } else {
        toast.success("Role unassigned successfully!");
      }
      
      setAssignRoleModal((prev) => {
        if (!prev.talent) return prev;
        const updatedAssignedRoles = (prev.talent.assigned_roles || []).map(r => 
          String(r.role) === String(jobRoleId) || String(r.role) === String(roles.find(role => role.id === jobRoleId)?.job_role) ? { ...r, status: false } : r
        );
        return {
          ...prev,
          talent: {
            ...prev.talent,
            assigned_roles: updatedAssignedRoles,
          }
        };
      });

      setMessages((prevMessages) => 
        prevMessages.map((msg) => {
          if (!msg.talents) return msg;
          return {
            ...msg,
            talents: msg.talents.map((t) => 
              t.talent_id === assignRoleModal.talent!.talent_id
                ? { ...t, assigned_roles: (t.assigned_roles || []).map(r => String(r.role) === String(jobRoleId) || String(r.role) === String(roles.find(role => role.id === jobRoleId)?.job_role) ? { ...r, status: false } : r) }
                : t
            )
          };
        })
      );
    } catch (error: any) {
      toast.error(error?.data?.status_message || "Failed to unassign role");
    } finally {
      setAssigningRoleId(null);
    }
  };

  const isGeneratedJob = data?.data?.generate_job;

  useEffect(() => {
    const rawMessages = data?.data?.messages;

    if (!rawMessages) return;

    const allTalents = rawMessages
      .filter((msg: any) => msg.saved_filters?.suggested_talents_list?.length)
      .flatMap((msg: any) => msg.saved_filters.suggested_talents_list);

    if (allTalents.length > 0) {
      dispatch(addTalentsToModal(allTalents));
    }

    const normalized: Message[] = rawMessages.map((msg: any, idx: number) => {
      const talentList: TalentProfile[] =
        msg.sender === "ai" && msg.saved_filters?.suggested_talents_list
          ? msg.saved_filters.suggested_talents_list
          : (msg.talents ?? []);

      return {
        id: idx,
        sender: msg.sender,
        content: msg.content,
        avatar: msg.sender === "ai" ? "/ai.svg" : undefined,
        talents: talentList,
      };
    });

    setMessages(normalized);
  }, [data?.data?.messages, id, dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const talentListForModal = useSelector(
    (state: any) => state.aiChat.talentListForModal ?? [],
  );

  const handleOpenModal = (talent: TalentProfile, index: number) => {
    if (index === 3 && isTalentExpand === false) {
      setMaxVisibleTalent(Infinity);
      setIsTalentExpand(true);
      return;
    }

    setSelectedTalent(talent);

    const globalIndex = talentListForModal.findIndex(
      (t: TalentProfile) => t.talent_id === talent.talent_id,
    );
    setSelectedTalentIndex(globalIndex >= 0 ? globalIndex : 0);
    setIsOpen(true);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await aiChatCreateMutation({
        session_id: sessionId ?? id,
        message: inputValue,
      }).unwrap();

      if (res?.session_id) {
        const aiMessage: Message = {
          id: Date.now() + 1,
          sender: "ai",
          content: res.conversation ?? "Here are the results I found.",
          avatar: "/man.png",
          talents: res.data?.talents ?? [],
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: "ai",
        content: "Something went wrong. Please try again.",
        avatar: "/man.png",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      refetch();
      textareaRef.current?.focus();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 180) + "px";
    }
  };

  const handlePolasRequest = async (talendId: number) => {
    try {
      const res = await polasRequestMutation({
        session_id: id,
        talent_id: talendId,
      }).unwrap();

      if (res?.status_message) {
        toast.success(res.status_message);
      }
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleTalentBooking = async (talendId: number) => {
    try {
      const res = await bookTalentMutation({
        session_id: id,
        talent_id: talendId,
      }).unwrap();

      if (res?.status_message) {
        toast.success(res.status_message);
      }
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleECastingRequest = async (talendId: number) => {
    try {
      const res = await eCastingRequestMutation({
        session_id: id,
        talent_id: talendId,
      }).unwrap();

      if (res?.status_message) {
        toast.success(res.status_message);
      }
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleselftapRequest = async (talendId: number) => {
    try {
      const res = await selfTapRequestMutation({
        session_id: id,
        talent_id: talendId,
      }).unwrap();

      if (res?.status_message) {
        toast.success(res.status_message);
      }
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleShortListTalent = async (talendId: number) => {
    try {
      const res = await shortlistTalentMutation({
        session_id: id,
        talent_id: talendId,
      }).unwrap();

      if (res?.status_message) {
        toast.success(res.status_message);
      }
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  // Opens the assign-role modal; guards against missing job first
  const handleOpenAssignRoleModal = (
    e: React.MouseEvent,
    talent: TalentProfile,
  ) => {
    e.stopPropagation();
    if (!jobId) {
      toast.error(
        "No job created yet. Please save a job first before assigning roles.",
      );
      return;
    }
    setAssignRoleModal({ open: true, talent });
  };

  const handleAssignRole = async (roleId: number) => {
    if (!assignRoleModal.talent) return;

    try {
      setAssigningRoleId(roleId);

      const res = await assignRoleMutation({
        job_id: jobId,
        talent_id: assignRoleModal.talent.talent_id,
        id: roleId,
      }).unwrap();

      if (res?.status_message) {
        toast.success(res.status_message);
      } else {
        toast.success("Role assigned successfully!");
      } 
      
      const newRole = {
        job_id: jobId,
        job_title: data?.data?.title || "",
        role: String(roleId),
        status: true,
      };

      setAssignRoleModal((prev) => {
        if (!prev.talent) return prev;
        const targetRoleName = roles.find(r => r.id === roleId)?.job_role;
        const existingRoles = prev.talent.assigned_roles || [];
        const isExisting = existingRoles.some(r => String(r.role) === String(roleId) || String(r.role) === String(targetRoleName));
        const updatedAssignedRoles = isExisting 
          ? existingRoles.map(r => (String(r.role) === String(roleId) || String(r.role) === String(targetRoleName)) ? { ...r, status: true } : r)
          : [...existingRoles, newRole];

        return {
          ...prev,
          talent: {
            ...prev.talent,
            assigned_roles: updatedAssignedRoles,
          }
        };
      });

      setMessages((prevMessages) => 
        prevMessages.map((msg) => {
          if (!msg.talents) return msg;
          return {
            ...msg,
            talents: msg.talents.map((t) => {
              if (t.talent_id === assignRoleModal.talent!.talent_id) {
                const targetRoleName = roles.find(r => r.id === roleId)?.job_role;
                const existingRoles = t.assigned_roles || [];
                const isExisting = existingRoles.some(r => String(r.role) === String(roleId) || String(r.role) === String(targetRoleName));
                const updatedAssignedRoles = isExisting 
                  ? existingRoles.map(r => (String(r.role) === String(roleId) || String(r.role) === String(targetRoleName)) ? { ...r, status: true } : r)
                  : [...existingRoles, newRole];
                return { ...t, assigned_roles: updatedAssignedRoles };
              }
              return t;
            })
          };
        })
      );
    } catch (error: any) {
      toast.error(
        error?.data?.status_message ?? "Failed to assign role. Try again.",
      );
    } finally {
      setAssigningRoleId(null);
    }
  };

  const runGenerateCasting = async () => {
    try {
      setGeneratingCastingLoading(true);
      const formData = new FormData();

      formData.append("session_id", String(id));
      formData.append("title", jobTitle);
      formData.append("description", jobDescription);
      formData.append("generate_job", String(true));

      if (Array.isArray(jobRole)) {
        jobRole.forEach((role) => {
          formData.append(
            "casting_roles",
            typeof role === "object" ? JSON.stringify(role) : role,
          );
        });
      } else {
        formData.append(
          "casting_roles",
          typeof jobRole === "object" ? JSON.stringify(jobRole) : jobRole,
        );
      }

      if (avatarFile) {
        formData.append("photo", avatarFile);
      }
      const res = await generateJobFromMessageMutation(formData).unwrap();

      if (res?.status_message) {
        toast.success(res?.status_message || "Job created successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate casting.");
    } finally {
      setGeneratingCastingLoading(false);
    }
  };

  const handleJobSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle) return;

    setJobSaving(true);
    try {
      setJobModal(false);
      await runGenerateCasting();
    } finally {
      setJobSaving(false);
    }
  };

  const handleGenerateCasting = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSkipping && jobTitle === "" && jobDescription === "") {
      setJobModal(true);
      return;
    }

    setIsSkipping(false);
    await runGenerateCasting();

    setIsSkipping(false);
    setJobTitle("");
    setJobDescription("");
  };

  const handleCreateConversion = async (id: number) => {
    try {
      setLoadingConversationId(id);
      const res = await createConversationMutation({
        user_id: id,
      }).unwrap();

      if (res?.status) {
        const c_id = res?.data?.conversation_id;

        const message = {
          conversation_id: c_id,
          other_user_id: 0,
          other_user_name: "",
          other_user_email: "",
          other_user_profile_pic: "",
          last_message: {
            attachment: null,
            created_at: "",
            message_id: 0,
            message_type: "",
            sender_id: 0,
            text: "",
          },
          unread_count: 0,
          updated_at: "",
          created_at: "",
        };
        dispatch(setConversation(message));

        router.push("/dashboard/client/message");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Fail to create new chat!");
    } finally {
      setLoadingConversationId(null);
    }
  };

  const handleAddRole = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const cleanRole = currentRole.trim();
    if (jobRole.includes(cleanRole)) {
      toast.error("Role already exists!");
    }
    if (cleanRole && !jobRole.includes(cleanRole)) {
      setJobRole((prev) => [...prev, cleanRole]);
      setCurrentRole("");
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setJobRole((prev) => prev.filter((r) => r !== roleToRemove));
  };

  return (
    <main className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Chat Messages Area */}
      <div className='bg-white flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-8 max-w-6xl mx-auto w-full rounded-2xl'>
        {isLoadingChat ? (
          <ChatSkeleton />
        ) : (
          <>
            {messages?.length > 0 &&
              messages?.map((message) => (
                <div key={message.id} className='flex flex-col space-y-6'>
                  {/* Message bubble */}
                  {message.sender === "user" ? (
                    <div className='flex gap-3 justify-end items-start'>
                      <div className='bg-[#2563EB] text-white rounded-3xl px-4 py-2 max-w-xs sm:max-w-md text-sm sm:text-base shadow-sm'>
                        {message.content}
                      </div>
                      <img
                        src={
                          user?.profile_pic
                            ? `${user.profile_pic}`
                            : "/placeholder.svg"
                        }
                        alt='User Avatar'
                        width={80}
                        height={80}
                        className='w-8 h-8 sm:w-8 sm:h-8 rounded-full shrink-0 object-cover'
                      />
                    </div>
                  ) : (
                    <div className='flex gap-1.5 justify-start items-start'>
                      <div className=''>
                        <Image
                          src={"/ai.svg"}
                          alt='AI Avatar'
                          width={800}
                          height={800}
                          className='w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0 object-cover'
                        />
                      </div>
                      <div className='text-gray-800 rounded-3xl px-4 py-3 max-w-xs sm:max-w-md text-sm sm:text-base whitespace-pre-line'>
                        {message.content}
                      </div>
                    </div>
                  )}

                  {/* Talent Profiles Grid — only for AI messages with talents */}
                  {message.sender === "ai" &&
                    message.talents &&
                    message.talents.length > 0 && (
                      <div className='md:col-span-3'>
                        <div className='grid grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-4'>
                          {message.talents
                            .slice(0, maxVisibleTalent)
                            .map((profile, idx) => {
                              const imageUrl = profile.images?.[0] || "";

                              const hasDates = profile?.available_dates && profile.available_dates.length > 0;
                              const futureDatesCount = hasDates ? profile.available_dates!.filter(d => !formatAvailabilityDate(d).isPast).length : 0;
                              const shouldShowAvailable = hasDates ? (futureDatesCount > 0) : (profile?.is_available && !profile?.is_available_on_request);

                              const hiddenCount =
                                message.talents!.length - maxVisibleTalent;
                              const isLastVisible =
                                idx === maxVisibleTalent - 1 && hiddenCount > 0;

                              return (
                                <div
                                  key={profile.talent_id}
                                  className='space-y-3'
                                  onClick={() => handleOpenModal(profile, idx)}
                                >
                                  {/* Profile Card */}
                                  <div className='relative bg-[#404145] rounded-lg overflow-hidden group cursor-pointer'>
                                    <Image
                                      src={getImageUrl(imageUrl)}
                                      alt={profile.name} 
                                      width={600}
                                      height={600}
                                      unoptimized
                                      className='w-full h-120 object-cover object-top'
                                    />

                                    {isLastVisible && (
                                      <div className='absolute inset-0 bg-black/70 flex items-center justify-center'>
                                        <span className='text-white text-4xl font-bold'>
                                          +{hiddenCount}
                                        </span>
                                      </div>
                                    )}

                                    {/* Status badges — top-left */}
                                    <div className='absolute top-2  group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 text-white text-sm space-y-3 z-20'>
                                      <div className='flex items-center gap-3 font-semibold text-sm mb-1'>
                                        {profile?.approval_status ===
                                        "approved" ? (
                                          <div
                                            className='w-6 h-6 text-xl text-blue-400 fill-blue-700'
                                            title='Verified'
                                          >
                                            <Star
                                              size={24}
                                              strokeWidth={1}
                                              className='fill-blue-400'
                                            />
                                          </div>
                                        ) : (
                                          <div
                                            className='w-6 h-6 text-xl'
                                            title='Not Verified'
                                          >
                                            <ShieldAlert
                                              size={24}
                                              strokeWidth={1}
                                              className='opacity-50 fill-blue-400'
                                            />
                                          </div>
                                        )}

                                        {shouldShowAvailable && (
                                            <div
                                              className='flex items-center justify-center w-6 h-6'
                                              title={
                                                hasDates
                                                  ? `${futureDatesCount} Available Date${futureDatesCount > 1 ? "s" : ""}`
                                                  : "Available"
                                              }
                                            >
                                              <span
                                                className="w-5 h-5 rounded-full bg-green-400"
                                                aria-hidden='true'
                                              />
                                            </div>
                                          )}

                                        {profile?.is_available_on_request && (
                                          <div
                                            className='flex items-center justify-center w-6 h-6'
                                            title={
                                              profile?.is_available_on_request
                                                ? "Available on request"
                                                : "Not Available on request"
                                            }
                                          >
                                            <span
                                              className={`w-5 h-5 rounded-full ${
                                                profile?.is_available_on_request
                                                  ? "bg-yellow-400"
                                                  : "bg-red-500"
                                              }`}
                                              aria-hidden='true'
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Profile Details — visible on hover */}
                                    <div className='absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 text-white text-sm space-y-3'>
                                      <p className='font-semibold text-sm mb-1'>
                                        Talent Name: {profile.name}
                                      </p>
                                      <p>Height: {profile.height} cm</p>
                                      <p>Bust: {profile.bust} cm</p>
                                      <p>Waist: {profile.waist} cm</p>
                                      <p>Hips: {profile.hips} cm</p>
                                      <p>Shoe Size: {profile.shoe_size}</p>
                                      <p>Hair: {profile.hair_color}</p>
                                      <p>Eyes: {profile.eye_color}</p>
                                      <p>Agent: {profile.agent_name}</p>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div
                                    className='flex flex-wrap justify-evenly gap-2 sm:gap-3 mt-4'
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={() =>
                                        withConfirm(
                                          () =>
                                            handleShortListTalent(
                                              profile?.talent_id,
                                            ),
                                          "Shortlist",
                                        )
                                      }
                                      disabled={shortlistLoading}
                                      className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400'
                                      aria-label='Like'
                                      title='Shortlists'
                                    >
                                      <Heart size={20} fill='currentColor' />
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAvailabilityTalent(profile);
                                        setAvailabilityModal(true);
                                      }}
                                      className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                                      aria-label='Schedule'
                                      title='Availability'
                                    >
                                      <Calendar size={20} />
                                    </button>

                                    {/* <button
                                      onClick={() =>
                                        withConfirm(
                                          () =>
                                            handleselftapRequest(
                                              profile?.talent_id,
                                            ),
                                          "Selftaps",
                                        )
                                      }
                                      disabled={selfTapLoading}
                                      className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400'
                                      aria-label='Photo'
                                      title='Selftapes Request'
                                    >
                                      <Camera size={20} />
                                    </button> */}

                                    {/* <button
                                      onClick={() =>
                                        withConfirm(
                                          () =>
                                            handleECastingRequest(
                                              profile?.talent_id,
                                            ),
                                          "E-casting",
                                        )
                                      }
                                      disabled={eCastingLoading}
                                      className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400'
                                      aria-label='Call'
                                      title='E-Casting Request'
                                    >
                                      <Phone size={20} />
                                    </button> */}

                                    <button
                                      onClick={() =>
                                        withConfirm(
                                          () =>
                                            handleTalentBooking(
                                              profile?.talent_id,
                                            ),
                                          "Booking",
                                        )
                                      }
                                      disabled={bookLoading}
                                      className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400'
                                      aria-label='Approve'
                                      title='Book'
                                    >
                                      <Check size={20} />
                                    </button>

                                    {/* <button
                                      onClick={() =>
                                        withConfirm(
                                          () =>
                                            handlePolasRequest(
                                              profile?.talent_id,
                                            ),
                                          "Polas",
                                        )
                                      }
                                      disabled={polasLoading}
                                      className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400'
                                      aria-label='Approve'
                                      title='Polas Request'
                                    >
                                      <ScanFace size={20} />
                                    </button> */}

                                    {/* Message agent button */}
                                    <button
                                      onClick={() =>
                                        handleCreateConversion(
                                          profile?.agent_id as number,
                                        )
                                      }
                                      disabled={
                                        loadingConversationId ===
                                        profile?.agent_id
                                      }
                                      className='p-2 md:p-3.5 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 transition-colors text-[#ffffff] hover:text-gray-100 border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer'
                                      aria-label='Direct message to agent'
                                      title='Direct message to agent'
                                    >
                                      {loadingConversationId ===
                                      profile?.agent_id ? (
                                        <Loader
                                          className='animate-spin'
                                          size={20}
                                        />
                                      ) : (
                                        <MessageCircleMore size={20} />
                                      )}
                                    </button>

                                    {/* Assign Role button */}
                                    <button
                                      onClick={(e) =>
                                        handleOpenAssignRoleModal(e, profile)
                                      }
                                      className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 cursor-pointer'
                                      aria-label='Assign role'
                                      title='Assign Role'
                                    >
                                      <Briefcase size={20} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                  {message.sender === "ai" &&
                    !isGeneratedJob &&
                    message.talents &&
                    message.talents.length > 0 && (
                      <button
                        type='submit'
                        onClick={handleGenerateCasting}
                        disabled={generatingCastingLoading}
                        className='order-1 md:order-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 font-medium transition flex items-center justify-center gap-2'
                      >
                        <Sparkles className='w-4 h-4' />
                        {generatingCastingLoading ? "Saving..." : "Save Job"}
                      </button>
                    )}
                </div>
              ))}

            {messages?.length === 0 &&
              (aiChatCreateLoading || isLoadingChat) && (
                <div className='flex gap-3 justify-center items-center h-[calc(80vh-64px)]'>
                  <div className='flex items-center justify-center gap-3 mt-4'>
                    <p className='text-[#404145] font-semibold'>
                      No messages yet
                    </p>
                  </div>
                </div>
              )}

            {/* Loading indicator */}
            {(aiChatCreateLoading || isLoadingChat) && (
              <div className='flex gap-3 justify-start items-start'>
                <div className='flex items-center justify-center gap-3 mt-4'>
                  <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#2563EB]'></div>
                  <p className='text-[#404145]'>AI is thinking...</p>
                </div>
              </div>
            )}

            {isLoadingChat && (
              <div className='flex gap-3 justify-start items-start'>
                <div className='flex items-center justify-center gap-3 mt-4'>
                  <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#2563EB]'></div>
                  <p className='text-[#404145]'>Receiving AI response ...</p>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className='bg-transparent sticky bottom-0 p-4 sm:p-6 z-50'>
        <div className='max-w-6xl mx-auto'>
          <div className='relative w-full'>
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !aiChatCreateLoading) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="I'm looking for 3 African male models with dreadlocks for a fashion shoot in Berlin..."
              className='
                w-full resize-none overflow-hidden
                bg-white border border-gray-300 rounded-3xl
                px-4 pr-16 py-4
                text-sm sm:text-base
                placeholder:text-gray-500
                focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent
              '
            />
            <button
              onClick={handleSendMessage}
              disabled={aiChatCreateLoading || !inputValue.trim()}
              className='
                absolute bottom-3 right-2
                w-12 h-12
                bg-[#2563EB] text-white
                rounded-full
                flex items-center justify-center
                hover:bg-[#2563EB] transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm
              '
              aria-label='Send message'
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Talent detail modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='min-w-[55vw] bg-white max-w-6xl max-h-screen p-0 overflow-hidden'>
          {selectedTalent && (
            <ChatModalDetail
              initialIndex={selectedTalentIndex}
              sessionId={id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Job avatar, title & description modal */}
      <Dialog
        open={jobModal}
        onOpenChange={(open) => {
          if (!open) setIsSkipping(false);
          setJobModal(open);
        }}
      >
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Add Job Info</DialogTitle>
            <DialogDescription>
              Enter the job title and description, then click Save to continue.
            </DialogDescription>
          </DialogHeader>

          <form className='space-y-4' onSubmit={handleJobSave}>
            <FieldGroup>
              {/* --- AVATAR UPLOAD SECTION --- */}
              <Field className='flex flex-col items-center justify-center sm:flex-row sm:justify-start gap-4 pb-2'>
                <div className='relative w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 group hover:border-blue-500 transition-colors'>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt='Avatar preview'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <User className='w-8 h-8 text-gray-400' />
                  )}
                  <label
                    htmlFor='avatar-upload'
                    className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-medium'
                  >
                    Change
                  </label>
                </div>

                <div className='flex flex-col gap-1 items-center sm:items-start'>
                  <Label
                    htmlFor='avatar-upload'
                    className='text-sm font-semibold cursor-pointer text-blue-600 hover:text-blue-700'
                  >
                    Upload Company/Job Image
                  </Label>
                  <span className='text-xs text-gray-500'>
                    JPG, JPEG, PNG, WEBP up to 5MB
                  </span>
                  <input
                    id='avatar-upload'
                    type='file'
                    accept='.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'
                    className='hidden'
                    onChange={handleAvatarChange}
                  />
                  {avatarPreview && (
                    <button
                      type='button'
                      className='text-xs text-red-500 hover:underline mt-1'
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                    >
                      Remove image
                    </button>
                  )}
                </div>
              </Field>
              {/* --- END OF AVATAR UPLOAD SECTION --- */}

              <Field>
                <Label htmlFor='title' className='text-sm font-semibold'>
                  Job Title
                </Label>
                <Input
                  id='title'
                  name='title'
                  placeholder='e.g. Senior Fashion Model'
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  className='h-11 border border-gray-300'
                />
              </Field>

              <Field>
                <Label htmlFor='role' className='text-sm font-semibold'>
                  Add Role(s)
                </Label>
                <div className='flex gap-2 w-full items-center'>
                  <Input
                    id='role'
                    name='role'
                    placeholder='e.g. Fashion Model (Press Enter or click +)'
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRole();
                      }
                    }}
                    className='h-11 border border-gray-300 flex-1'
                  />
                  <Button
                    type='button'
                    size='icon'
                    onClick={handleAddRole}
                    disabled={!currentRole.trim()}
                    className='h-11 w-11 bg-[#2563EB] text-white hover:bg-blue-700 transition shrink-0'
                  >
                    <Plus className='w-5 h-5' />
                  </Button>
                </div>

                {jobRole.length > 0 && (
                  <div className='flex flex-wrap gap-1.5 mt-3.5'>
                    {jobRole.map((role) => (
                      <span
                        key={role}
                        className='inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100 transition-all'
                      >
                        {role}
                        <button
                          type='button'
                          onClick={() => handleRemoveRole(role)}
                          className='text-blue-400 hover:text-blue-900 transition-colors cursor-pointer'
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>

              <Field>
                <Label
                  htmlFor='job-description'
                  className='text-sm font-semibold'
                >
                  Job Description
                </Label>
                <Textarea
                  id='job-description'
                  name='description'
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder='Describe the job requirements, expectations, and any relevant details...'
                  required
                  className='min-h-32 border border-gray-300 resize-none'
                />
              </Field>
            </FieldGroup>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                className='mr-5'
                onClick={() => {
                  setIsSkipping(true);
                  setJobModal(false);
                  runGenerateCasting();
                }}
              >
                Skip
              </Button>
              <DialogClose asChild>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => handleCancel()}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type='submit' disabled={jobSaving || !jobTitle}>
                {jobSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Availability modal */}
      <Dialog open={availabilityModal} onOpenChange={setAvailabilityModal}>
        <DialogContent className='sm:max-w-sm lg:max-w-lg max-h-[80vh] flex flex-col'>
          <DialogHeader className='shrink-0'>
            <DialogTitle>Available Dates</DialogTitle>
            <DialogDescription>
              {selectedAvailabilityTalent?.name}&apos;s available dates for
              booking.
            </DialogDescription>
          </DialogHeader>

          <div className='py-2 space-y-2 overflow-y-auto flex-1 min-h-0'>
            {selectedAvailabilityTalent?.available_dates &&
            selectedAvailabilityTalent.available_dates.length > 0 ? (
              selectedAvailabilityTalent.available_dates.map((dateStr) => {
                const { day, date, isPast } = formatAvailabilityDate(dateStr);
                return (
                  <div
                    key={dateStr}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                      isPast
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : "border-blue-100 bg-blue-50"
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <Calendar
                        size={15}
                        className={`shrink-0 ${isPast ? "text-gray-400" : "text-[#2563EB]"}`}
                      />
                      <div className='flex flex-col'>
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            isPast ? "text-gray-400" : "text-[#2563EB]"
                          }`}
                        >
                          {day}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            isPast
                              ? "text-gray-400 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {date}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border shadow-sm ${
                        isPast
                          ? "text-gray-400 bg-white border-gray-200"
                          : "text-green-600 bg-white border-green-100"
                      }`}
                    >
                      {isPast ? "Past" : "Available"}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className='flex flex-col items-center justify-center py-10 text-center gap-2'>
                <Calendar size={32} className='text-gray-300' />
                <p className='text-sm text-gray-500'>
                  No available dates listed.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className='shrink-0'>
            <DialogClose asChild>
              <Button variant='outline'>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm action modal ── */}
      <Dialog
        open={confirmModal.open}
        onOpenChange={(open) => {
          if (!open) setConfirmModal({ open: false, action: null, label: "" });
        }}
      >
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Confirm request</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              <span className='font-semibold text-gray-800'>
                {confirmModal.label}
              </span>{" "}
              this model?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-4 pt-2'>
            <DialogClose asChild>
              <Button variant='outline'>No</Button>
            </DialogClose>
            <Button
              className='bg-[#2563EB] hover:bg-[#155aee] text-white'
              onClick={() => {
                confirmModal.action?.();
                setConfirmModal({ open: false, action: null, label: "" });
              }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Assign Role modal ── */}
      <Dialog
        open={assignRoleModal.open}
        onOpenChange={(open) => {
          if (!open) setAssignRoleModal({ open: false, talent: null });
        }}
      >
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Select a role to assign to{" "}
              <span className='font-semibold text-gray-800'>
                {assignRoleModal.talent?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className='py-2 space-y-2'>
            {roles.length > 0 ? (
              roles.map((role, i) => {
                const isAssigned = assignRoleModal.talent?.assigned_roles?.some(
                  (r) =>
                    (String(r.role) === String(role.id) ||
                    String(r.role) === String(role.job_role)) &&
                    r.status === true
                );

                return (
                <div
                  key={i}
                  className='flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-gray-50'
                >
                  <div className='flex items-center gap-2'>
                    <Briefcase size={16} className='text-[#2563EB] shrink-0' />
                    <span className='text-sm font-medium text-gray-800'>
                      {role.job_role}
                    </span>
                  </div>
                  {isAssigned ? (
                    <Button
                      size='sm'
                      disabled={assigningRoleId === role.id}
                      onClick={() => handleUnassignRole(role.id)}
                      variant='outline'
                      className='text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs h-8 px-3'
                    >
                      {assigningRoleId === role.id ? (
                        <Loader className='animate-spin w-3 h-3' />
                      ) : (
                        "Unassign"
                      )}
                    </Button>
                  ) : (
                    <Button
                      size='sm'
                      disabled={assigningRoleId === role.id}
                      onClick={() => handleAssignRole(role.id)}
                      className='bg-[#2563EB] hover:bg-blue-700 text-white text-xs h-8 px-3'
                    >
                      {assigningRoleId === role.id ? (
                        <Loader className='animate-spin w-3 h-3' />
                      ) : (
                        "Assign"
                      )}
                    </Button>
                  )}
                </div>
              )})
            ) : (
              <p className='text-sm text-gray-500 text-center py-6'>
                No roles available for this job.
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
