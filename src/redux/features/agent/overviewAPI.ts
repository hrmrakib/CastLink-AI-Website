import baseAPI from "@/redux/api/api";

const overviewAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    getAgentOverview: build.query({
      query: () => ({
        url: "/accounts/agent/dashboard/",
      }),
    }),
  }),
});

export const { useGetAgentOverviewQuery } = overviewAPI;
export default overviewAPI;
