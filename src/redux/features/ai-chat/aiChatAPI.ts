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
  endpoints: () => ({}),
});

const aiChatAPI = aiBaseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getAIResponse: builder.mutation({
      query: (body) => ({
        url: "/openai/generate_response/",
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

    getDeaftJobs: builder.query({
      query: ({ search }) => ({
        url: `/api/chat/drafts`,
        method: "GET",
      }),
    }),

    deleteDraftJob: builder.mutation({
      query: (draft_id) => ({
        url: `/api/chat/delete-draft-id?draft_id=${draft_id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAIResponseMutation,
  useAiChatCreateMutation,
  useGetDeaftJobsQuery,
  useDeleteDraftJobMutation,
} = aiChatAPI;
export default aiChatAPI;
