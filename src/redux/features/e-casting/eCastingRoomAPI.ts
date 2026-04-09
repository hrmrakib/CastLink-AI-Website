/* eslint-disable @typescript-eslint/no-explicit-any */
import baseAPI from "@/redux/api/api";

const eCastingRoomAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    createSession: build.mutation<any, void>({
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

export const { useCreateSessionMutation, useJoinSessionQuery } =
  eCastingRoomAPI;
export default eCastingRoomAPI;
