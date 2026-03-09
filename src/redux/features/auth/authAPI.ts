import baseAPI from "@/redux/api/api";

const AuthenticationAPI = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),

    createAccount: builder.mutation({
      query: (data) => ({
        url: "/user/create-user",
        method: "POST",
        body: data,
      }),
    }),

    verifyOtp: builder.mutation({
      query: (body) => ({
        url: "/accounts/verify-otp/",
        method: "POST",
        body,
      }),
    }),

    sendOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/send-otp",
        method: "POST",
        body,
      }),
    }),

    resendOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body,
      }),
    }),

    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    verifyForgetPasswordOtp: builder.mutation({
      query: (body) => ({
        url: "/auth/forgot-password/otp-verify",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useCreateAccountMutation,
  useVerifyOtpMutation,
  useSendOtpMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyForgetPasswordOtpMutation,
} = AuthenticationAPI;
export default AuthenticationAPI;
