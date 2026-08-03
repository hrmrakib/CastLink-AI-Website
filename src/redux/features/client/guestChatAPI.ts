import baseAPI from "@/redux/api/api";

const guestChatAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    identifyGuest: build.mutation({
      query: ({ jobId, name, email }) => ({
        url: `client/talents/shortlisted/${jobId}/identify/`,
        method: "POST",
        body: { name, email },
      }),
    }),

    checkGuestSession: build.query({
      query: ({ jobId, token }) => ({
        url: `client/talents/shortlisted/${jobId}/session/`,
        method: "GET",
        headers: token ? { "X-Guest-Token": `Bearer ${token}` } : undefined,
      }),
    }),

    getFavorites: build.query({
      query: ({ jobId, token }) => ({
        url: `client/talents/shortlisted/${jobId}/favorites/`,
        method: "GET",
        headers: token ? { "X-Guest-Token": `Bearer ${token}` } : undefined,
      }),
      providesTags: (result, error, arg) => [
        { type: "Talents", id: `Favorites-${arg.jobId}` },
      ],
    }),

    addFavorite: build.mutation({
      query: ({ jobId, token, talent_id }) => ({
        url: `client/talents/shortlisted/${jobId}/favorites/`,
        method: "POST",
        headers: token ? { "X-Guest-Token": `Bearer ${token}` } : undefined,
        body: { talent_id },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Talents", id: `Favorites-${arg.jobId}` },
      ],
    }),

    removeFavorite: build.mutation({
      query: ({ jobId, token, talent_id }) => ({
        url: `client/talents/shortlisted/${jobId}/favorites/${talent_id}/`,
        method: "DELETE",
        headers: token ? { "X-Guest-Token": `Bearer ${token}` } : undefined,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Talents", id: `Favorites-${arg.jobId}` },
      ],
    }),

    getComments: build.query({
      query: ({ jobId, token, talent_id }) => ({
        url: `client/talents/shortlisted/${jobId}/talents/${talent_id}/comments/`,
        method: "GET",
        headers: token ? { "X-Guest-Token": `Bearer ${token}` } : undefined,
      }),
      providesTags: (result, error, arg) => [
        { type: "Talents", id: `Comments-${arg.talent_id}` },
      ],
    }),

    addComment: build.mutation({
      query: ({ jobId, token, talent_id, text }) => ({
        url: `client/talents/shortlisted/${jobId}/talents/${talent_id}/comments/`,
        method: "POST",
        headers: token ? { "X-Guest-Token": `Bearer ${token}` } : undefined,
        body: { text },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Talents", id: `Comments-${arg.talent_id}` },
      ],
    }),

    getChatHistory: build.query({
      query: ({ jobId, token }) => ({
        url: `client/talents/shortlisted/${jobId}/chat/messages/`,
        method: "GET",
        headers: token ? { "X-Guest-Token": `Bearer ${token}` } : undefined,
      }),
      providesTags: (result, error, arg) => [
        { type: "Talents", id: `Chat-${arg.jobId}` },
      ],
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