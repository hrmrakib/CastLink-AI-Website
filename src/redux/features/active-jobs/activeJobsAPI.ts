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

    getJobDetails: builder.query({
      query: (job_id) => ({
        url: `/jobs/${job_id}/`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetActiveJobsQuery, useGetJobDetailsQuery } = activeJobsAPI;
export default activeJobsAPI;
