import baseAPI from "@/redux/api/api";

const userAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    getUserProfile: build.query({
      query: () => ({
        url: "/accounts/user/profile/",
      }),
    }),
  }),
});

export const { useGetUserProfileQuery } = userAPI;
export default userAPI;
