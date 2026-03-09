/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    console.log("Preparing headers for API request", window?.location?.href);

    if (typeof window !== "undefined") {
      const token = localStorage?.getItem("accessToken");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

let isLoggingOut = false;

const customBaseQuery: BaseQueryFn<
  FetchArgs | string,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (typeof window === "undefined") {
    return result;
  }

  const pathname = window?.location?.pathname || "";

  if (result.error && result.error.status === 401) {
    if (!isLoggingOut && pathname !== "/login") {
      isLoggingOut = true;
      localStorage?.removeItem("accessToken");

      toast.error("Session expired. Please login again.");

      if (window?.location?.replace) {
        setTimeout(() => {
          isLoggingOut = false;
          window.location.replace("/login");
        }, 400);
      }
    }
  } else if (result.error && result.error.status === 403) {
    alert("You need to verify your email to use this feature.");
    if (window?.location?.href) window.location.href = "/profile";
  } else if (result.error && result.error.status === 402) {
    alert("You need to upgrade your plan to use this feature.");
    if (window?.location?.href) window.location.href = "/#upgrade-plan";
  }

  return result;
};

export const baseAPI = createApi({
  reducerPath: "api",
  baseQuery: customBaseQuery,
  tagTypes: ["Post"],
  endpoints: () => ({}),
});

export default baseAPI;

export type TList = {
  page?: number;
  limit?: number;
  search?: string;
};
