/* eslint-disable @typescript-eslint/no-explicit-any */
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
      query: ({ role, is_active, page, page_size, search }) => {
        // Build the params object dynamically
        const params: any = {};

        if (role) params.role = role;
        if (is_active !== undefined) params.is_active = is_active;
        if (page !== undefined) params.page = page;
        if (page_size !== undefined) params.page_size = page_size;
        if (search) params.search = search;

        return {
          url: `/accounts/user/user_list`,
          params: params,
        };
      },
      providesTags: ["Users"],
    }),

    updateUserStatus: builder.mutation({
      query: ({ userId, is_active }) => ({
        url: `/accounts/user/${userId}/`,
        method: "PATCH",
        body: { is_active },
      }),
      invalidatesTags: ["Users"],
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
  useUpdateUserStatusMutation,
  useApproveOrRejectAgentMutation,
  useApproveOrRejectTalentMutation,
  useDeleteTalentMutation,
} = adminAPI;
export default adminAPI;
