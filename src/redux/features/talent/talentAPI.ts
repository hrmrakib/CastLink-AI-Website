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
      providesTags: ["Talents"],
    }),

    getTalentById: build.query({
      query: (id) => ({
        url: `/agent/talents/${id}/`,
      }),
      providesTags: ["Talents"],
    }),

    createTalent: build.mutation({
      query: (data) => ({
        url: "/agent/talents/create/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Talents"],
    }),

    updateTalent: build.mutation({
      query: ({ id, data }) => ({
        url: `/agent/talents/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Talents"],
    }),

    deleteTalent: build.mutation({
      query: (id) => ({
        url: `/agent/talents/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Talents"],
    }),
  }),
});

export const {
  useGetTalentQuery,
  useGetTalentByIdQuery,
  useCreateTalentMutation,
  useUpdateTalentMutation,
  useDeleteTalentMutation,
} = talentAPI;
export default talentAPI;
