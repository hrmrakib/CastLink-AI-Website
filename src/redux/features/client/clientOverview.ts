import baseAPI from "@/redux/api/api";

const clientOverview = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    getClientOverview: build.query({
      query: () => ({
        url: "/accounts/agent/dashboard/",
      }),
    }),
  }),
});

export const { useGetClientOverviewQuery } = clientOverview;
export default clientOverview;
