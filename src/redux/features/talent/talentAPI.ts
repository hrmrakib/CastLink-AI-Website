import baseAPI from "@/redux/api/api";

const talentAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    getTalent: build.query({
      query: () => ({
        url: "/agent/talents/",
      }),
    }),

    createTalent: build.mutation({
      query: (data) => ({
        url: "/agent/talents/create/",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useGetTalentQuery, useCreateTalentMutation } = talentAPI;
export default talentAPI;
