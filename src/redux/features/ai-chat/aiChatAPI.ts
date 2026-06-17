import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const aiBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_AI_API_URL,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = localStorage?.getItem("access_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

export const aiBaseAPI = createApi({
  reducerPath: "aiApi",
  baseQuery: aiBaseQuery,
  tagTypes: ["ActiveJobs"],
  endpoints: () => ({}),
});

const aiChatAPI = aiBaseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getChatBySessionId: builder.query({
      query: (session_id) => ({
        url: `/api/chat/session-id?session_id=${session_id}`,
        method: "GET",
      }),
    }),

    getAIResponse: builder.mutation({
      query: (body) => ({
        url: "/openai/generate_response/",
        method: "POST",
        body,
      }),
    }),

    getAvailableRoles: builder.query({
      query: (jobId) => ({
        url: `/api/jobs/available-roles?job_id=${jobId}`,
        method: "GET",
      }),
    }),

    assignRole: builder.mutation({
      query: (body) => ({
        url: `/api/jobs/assign-role`,
        method: "POST",
        body,
      }),
    }),

    aiChatCreate: builder.mutation({
      query: (body) => ({
        url: "/api/chat",
        method: "POST",
        body,
      }),
    }),

    generateJobFromMessage: builder.mutation({
      query: (body) => ({
        url: "/api/jobs/generate",
        method: "POST",
        body,
      }),
    }),

    getDeaftJobs: builder.query({
      query: ({ search }) => ({
        url: `/api/chat/drafts?search=${search || ""}`,
        method: "GET",
      }),
    }),

    deleteDraftJob: builder.mutation({
      query: (draft_id) => ({
        url: `/api/chat/delete-draft-id?draft_id=${draft_id}`,
        method: "DELETE",
      }),
    }),

    continueDraftJob: builder.query({
      query: ({ draft_id }) => ({
        url: `/api/chat/continue-draft-id?draft_id=${draft_id}`,
        method: "GET",
      }),
    }),

    selfTapRequest: builder.mutation({
      query: (body) => ({
        url: "/api/jobs/request-selftape",
        method: "POST",
        body,
      }),
    }),

    eCastingRequest: builder.mutation({
      query: (body) => ({
        url: "/api/jobs/request-ecasting",
        method: "POST",
        body,
      }),
    }),

    shortlistTalent: builder.mutation({
      query: (body) => ({
        url: "/api/talents/shortlist",
        method: "POST",
        body,
      }),
    }),

    bookTalent: builder.mutation({
      query: (body) => ({
        url: "/api/talents/book",
        method: "POST",
        body,
      }),
    }),

    polasRequest: builder.mutation({
      query: (body) => ({
        url: "/api/jobs/request-polas",
        method: "POST",
        body,
      }),
    }),

    polasUpload: builder.mutation({
      query: (data) => ({
        url: "/api/jobs/polas/upload",
        method: "POST",
        body: data,
      }),
    }),

    selftapUpload: builder.mutation({
      query: (data) => ({
        url: "/api/jobs/selftape/upload",
        method: "POST",
        body: data,
      }),
    }),

    // delete active job
    deleteActiveJob: builder.mutation({
      query: (job_id) => ({
        url: `/api/jobs/delete-job-id?job_id=${job_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ActiveJobs"],
    }),

    // delete shortlist
    deleteShortlist: builder.mutation({
      query: ({ job_id, talent_id }) => ({
        url: `/api/talents/delete-shortlist?job_id=${job_id}&talent_id=${talent_id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetChatBySessionIdQuery,
  useGetAIResponseMutation,
  useAiChatCreateMutation,
  useGenerateJobFromMessageMutation,
  useGetDeaftJobsQuery,
  useDeleteDraftJobMutation,
  useContinueDraftJobQuery,
  useSelfTapRequestMutation,
  useECastingRequestMutation,
  useShortlistTalentMutation,
  useBookTalentMutation,
  usePolasRequestMutation,
  usePolasUploadMutation,
  useSelftapUploadMutation,
  useDeleteActiveJobMutation,
  useDeleteShortlistMutation,
  useGetAvailableRolesQuery,
  useAssignRoleMutation,
} = aiChatAPI;
export default aiChatAPI;
