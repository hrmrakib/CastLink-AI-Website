import baseAPI from "@/redux/api/api";

const activeJobsAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getActiveJobs: builder.query({
      query: (params) => ({
        url: `/jobs/active_jobs/`,
        method: "GET",
        params,
      }),
    }),

    getActiveJobDetails: builder.query({
      query: (job_id) => ({
        url: `/jobs/active_jobs/${job_id}/`,
        method: "GET",
      }),
    }),
    deleteActiveJob: builder.mutation({
      query: (job_id) => ({
        url: `/jobs/active_jobs/${job_id}/`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetActiveJobsQuery,
  useGetActiveJobDetailsQuery,
  useDeleteActiveJobMutation,
} = activeJobsAPI;
export default activeJobsAPI;
