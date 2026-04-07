import baseAPI from "@/redux/api/api";

const activeJobsAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getActiveJobs: builder.query({
      query: ({ search, status, page, limit }) => ({
        url: `/jobs/`,
        method: "GET",
        params: { search, status, page, limit },
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
