import baseAPI from "@/redux/api/api";

const guestChatAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    identifyGuest: build.mutation({
      query: ({ jobId, name, email }) => ({
        url: `/client/talents/shortlisted/${jobId}/identify/`,
        method: "POST",
        body: { name, email },
      }),
    }),
    checkGuestSession: build.query({
      query: ({ jobId, token }) => ({
        url: `/client/talents/shortlisted/${jobId}/session/`,
        method: "GET",
        headers: { "X-Guest-Token": token },
      }),
    }),
    getFavorites: build.query({
      query: ({ jobId, token }) => ({
        url: `/client/talents/shortlisted/${jobId}/favorites/`,
        method: "GET",
        headers: { "X-Guest-Token": token },
      }),
      providesTags: ["Talents"], // Or a new tag like "Favorites"
    }),
    addFavorite: build.mutation({
      query: ({ jobId, token, talent_id }) => ({
        url: `/client/talents/shortlisted/${jobId}/favorites/`,
        method: "POST",
        headers: { "X-Guest-Token": token },
        body: { talent_id },
      }),
      invalidatesTags: ["Talents"],
    }),
    removeFavorite: build.mutation({
      query: ({ jobId, token, talent_id }) => ({
        url: `/client/talents/shortlisted/${jobId}/favorites/${talent_id}/`,
        method: "DELETE",
        headers: { "X-Guest-Token": token },
      }),
      invalidatesTags: ["Talents"],
    }),
    getComments: build.query({
      query: ({ jobId, token, talent_id }) => ({
        url: `/client/talents/shortlisted/${jobId}/talents/${talent_id}/comments/`,
        method: "GET",
        headers: { "X-Guest-Token": token },
      }),
      providesTags: (result, error, arg) => [{ type: "Talents", id: `Comments-${arg.talent_id}` }],
    }),
    addComment: build.mutation({
      query: ({ jobId, token, talent_id, text }) => ({
        url: `/client/talents/shortlisted/${jobId}/talents/${talent_id}/comments/`,
        method: "POST",
        headers: { "X-Guest-Token": token },
        body: { text },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Talents", id: `Comments-${arg.talent_id}` }],
    }),
    getChatHistory: build.query({
      query: ({ jobId, token }) => ({
        url: `/client/talents/shortlisted/${jobId}/chat/messages/`,
        method: "GET",
        headers: { "X-Guest-Token": token },
      }),
    }),
  }),
});

export const {
  useIdentifyGuestMutation,
  useCheckGuestSessionQuery,
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useGetChatHistoryQuery,
} = guestChatAPI;

export default guestChatAPI;
