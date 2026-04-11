import baseAPI from "@/redux/api/api";

const adminAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query({
      query: () => ({
        url: "/accounts/dashboard/",
      }),
      providesTags: ["Users", "Jobs"],
    }),

    getUserByRole: builder.query({
      query: ({ role, is_verified }) => ({
        url: `/accounts/user/user_list`,
        params: {
          role,
          ...(is_verified !== undefined && { is_verified }),
        },
      }),
      providesTags: ["Users"],
    }),

    jobManagement: builder.query({
      query: (params) => ({
        url: "/jobs/active_jobs/",
        params,
      }),
      providesTags: ["Jobs"],
    }),

    getTalents: builder.query({
      query: (params) => ({
        url: "/admin/talents/",
        params,
      }),
      providesTags: ["Users"],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/accounts/user/${userId}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    approveOrRejectAgent: builder.mutation({
      query: (body) => ({
        url: `/accounts/admin/agents/action/`,
        method: "PATCH",
        body,
      }),

      invalidatesTags: ["Users"],
    }),

    approveOrRejectTalent: builder.mutation({
      query: (body) => ({
        url: `/admin/talents/action/`,
        method: "PATCH",
        body,
      }),

      invalidatesTags: ["Users"],
    }),

    deleteTalent: builder.mutation({
      query: (talentId) => ({
        url: `/admin/talents/${talentId}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetUserByRoleQuery,
  useJobManagementQuery,
  useGetTalentsQuery,
  useDeleteUserMutation,
  useApproveOrRejectAgentMutation,
  useApproveOrRejectTalentMutation,
  useDeleteTalentMutation,
} = adminAPI;
export default adminAPI;
