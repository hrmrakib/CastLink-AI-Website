import baseAPI from "@/redux/api/api";

const messagesAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    createConversation: builder.mutation({
      query: (body) => ({
        url: "/chat/conversation/",
        method: "POST",
        body,
      }),
    }),

    getMyConversations: builder.query({
      query: ({ page, limit, search, message_status }) => ({
        url: `/chat/conversations/`,
        method: "GET",
        params: { page, limit, search, message_status },
      }),
    }),

    // &search=${search || ""}&read=${read || ""}&unRead=${unRead || ""}

    getMessages: builder.query({
      query: ({ conversationId, page, limit, search }) => ({
        url: `/chat/conversations/${conversationId}/messages/`,
        method: "GET",
        params: { page, limit },
      }),
    }),

    fileUploadWithMessage: builder.mutation({
      query: ({ conversationId, body }) => {
        return {
          url: `/chat/conversations/${conversationId}/upload/`,
          method: "POST",
          body,
        };
      },
    }),
  }),
});

export const {
  useCreateConversationMutation,
  useGetMyConversationsQuery,
  useGetMessagesQuery,
  useFileUploadWithMessageMutation,
} = messagesAPI;
export default messagesAPI;
