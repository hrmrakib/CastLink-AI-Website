import baseAPI from "@/redux/api/api";


const chatCommentAPI = baseAPI.injectEndpoints({
    endpoints: (build) => ({
        getChatCommentInfo: build.query({
            query: ({ jobId }) => ({
                url: `/agent/jobs/${jobId}/clients/`,
                method: "GET",
            }),
            providesTags: ["Jobs"],
        }),

        getCommentAndActivities: build.mutation({
            query: ({ jobId, guistId }) => ({
                url: `/agent/jobs/${jobId}/clients/${guistId}/`,
                method: "GET",
            }),
        }),
    }),
});

export const { useGetChatCommentInfoQuery, useGetCommentAndActivitiesMutation } = chatCommentAPI;
export default chatCommentAPI;