import baseAPI from "@/redux/api/api";

const settingAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getTermsAndConditions: builder.query({
      query: () => ({
        url: "/settings/terms_conditions/",
      }),
      providesTags: ["Settings"],
    }),
    updateTermsAndConditions: builder.mutation({
      query: (data) => ({
        url: "/settings/terms_conditions/",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    getPrivacyPolicies: builder.query({
      query: () => ({
        url: "/settings/privacy_policies/",
      }),
      providesTags: ["Settings"],
    }),
    updatePrivacyPolicies: builder.mutation({
      query: (data) => ({
        url: "/settings/privacy_policies/",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    getAboutUs: builder.query({
      query: () => ({
        url: "/settings/about_us/",
      }),
      providesTags: ["Settings"],
    }),
    updateAboutUs: builder.mutation({
      query: (data) => ({
        url: "/settings/about_us/",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetTermsAndConditionsQuery,
  useUpdateTermsAndConditionsMutation,
  useGetPrivacyPoliciesQuery,
  useUpdatePrivacyPoliciesMutation,
  useGetAboutUsQuery,
  useUpdateAboutUsMutation,
} = settingAPI;
export default settingAPI;
