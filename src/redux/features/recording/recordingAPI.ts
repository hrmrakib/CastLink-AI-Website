import baseAPI from "@/redux/api/api";

const recordingAPI = baseAPI.injectEndpoints({
  endpoints: (build) => ({
    getRecording: build.query({
      query: (jobId) => ({
        url: `/jobs/jobs/${jobId}/meetings/`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetRecordingQuery } = recordingAPI;
export default recordingAPI;
