import baseAPI from "@/redux/api/api";

const shortlistsJobAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    getShortlistsJob: build.query({
      query: () => ({ url: "/client/talents/shortlisted/", method: "GET" }),
    }),

    getSingleShortlistJob: build.query({
      query: (id) => ({
        url: `/client/talents/shortlisted/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetShortlistsJobQuery, useGetSingleShortlistJobQuery } =
  shortlistsJobAPI;
export default shortlistsJobAPI;
