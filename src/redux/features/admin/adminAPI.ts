import baseAPI from "@/redux/api/api";

const adminAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query({
      query: () => ({
        url: "/accounts/dashboard/",
      }),
    }),

    getUserByRole: builder.query({
      query: ({ role }) => ({
        url: `/accounts/user/user_list?role=${role}`,
      }),
    }),

    jobManagement: builder.query({
      query: (params) => ({
        url: "/jobs/jobs/",
        params,
      }),
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetUserByRoleQuery,
  useJobManagementQuery,
} = adminAPI;
export default adminAPI;
