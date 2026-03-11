import baseAPI from "@/redux/api/api";

const settingAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getTermsAndConditions: builder.query({
      query: () => ({
        url: "/settings/terms_conditions/",
      }),
    }),

    updateTermsAndConditions: builder.mutation({
      query: (data) => ({
        url: "/settings/terms_conditions/",
        method: "PATCH",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetTermsAndConditionsQuery,
  useUpdateTermsAndConditionsMutation,
} = settingAPI;
export default settingAPI;
