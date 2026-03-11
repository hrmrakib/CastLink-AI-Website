import baseAPI from "@/redux/api/api";

const aiChatAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    getAIResponse: builder.mutation({
      query: (body) => ({
        url: "/openai/generate_response/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetAIResponseMutation } = aiChatAPI;
export default aiChatAPI;
