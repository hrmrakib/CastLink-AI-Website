"use server";

import { cookies } from "next/headers";

// Define a function to save the token in cookies
export const saveTokens = async (token: string): Promise<void> => {
  (await cookies()).set("token", token, {
    httpOnly: true, // Recommended: Prevents client-side JS from accessing the token
    secure: process.env.NODE_ENV === "production", // Only sends over HTTPS in production
    sameSite: "lax",
    path: "/", // Ensures the cookie is available across your entire site
    maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
  });
};

// Define a function to get the current user (token) from cookies
export const getCurrentUser = async (): Promise<string | undefined> => {
  const token = (await cookies()).get("token")?.value;
  return token;
};

// Define a function to logout by deleting the token from cookies
export const logout = async (): Promise<void> => {
  (await cookies()).delete("token");
};
