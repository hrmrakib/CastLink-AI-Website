import baseAPI from "@/redux/api/api";

const eCastingRoomAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    createSession: build.mutation({
      query: () => ({
        url: "/ecasting/session/create/",
        method: "POST",
      }),
    }),

    joinSession: build.query({
      query: (roomId) => ({
        url: `/ecasting/session/join/${roomId}/`,
        method: "GET",
      }),
    }),
  }),
});

export const { useCreateSessionMutation, useLazyJoinSessionQuery } =
  eCastingRoomAPI;
export default eCastingRoomAPI;
