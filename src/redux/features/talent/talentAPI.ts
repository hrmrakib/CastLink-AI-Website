import baseAPI from "@/redux/api/api";

const talentAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    getTalent: build.query({
      query: (params) => {
        const cleanedParams = Object.fromEntries(
          Object.entries(params || {}).filter(
            ([_, value]) => value !== undefined && value !== null,
          ),
        );

        return {
          url: "/agent/talents/",
          params: cleanedParams,
        };
      },
    }),

    getTalentById: build.query({
      query: (id) => ({
        url: `/agent/talents/${id}/`,
      }),
    }),

    createTalent: build.mutation({
      query: (data) => ({
        url: "/agent/talents/create/",
        method: "POST",
        body: data,
      }),
    }),

    updateTalent: build.mutation({
      query: ({ id, data }) => ({
        url: `/agent/talents/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetTalentQuery,
  useGetTalentByIdQuery,
  useCreateTalentMutation,
  useUpdateTalentMutation,
} = talentAPI;
export default talentAPI;
