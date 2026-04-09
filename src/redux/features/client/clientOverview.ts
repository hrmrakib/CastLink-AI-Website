import baseAPI from "@/redux/api/api";

const clientOverview = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    getClientOverview: build.query({
      query: () => ({
        url: "/accounts/client/dashboard/",
      }),
    }),
  }),
});

export const { useGetClientOverviewQuery } = clientOverview;
export default clientOverview;
