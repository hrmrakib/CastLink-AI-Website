"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setProfileLoading, setUser } from "@/redux/features/auth/authSlice";
import { useGetUserProfileQuery } from "@/redux/features/user/userAPI";

export default function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const { data, isLoading } = useGetUserProfileQuery({}, { skip: !token });

  console.log({ token, data });

  useEffect(() => {
    dispatch(setProfileLoading(isLoading));
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (data?.data) {
      dispatch(setUser({ user: data.data, token: data.access_token || token }));
    }
  }, [data, token, dispatch]);

  return children;
}
