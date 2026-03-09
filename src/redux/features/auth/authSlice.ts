/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";

type TUser = {
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  googleId: string;
  appleId: string;
  stripeAccountId: string;
  isStripeConnected: boolean;
  _id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  bio: string;
  post: number;
  interested: any[];
  role: "USER" | "ADMIN" | string;
  image: string;
  follower: number;
  following: number;
  isDeleted: boolean;
  verified: boolean;
  paypalAccount: string;
  income: number;
};

type TAuthState = {
  userToggle: boolean;
  user: TUser | null;
  token: string | null;
  profileLoading?: boolean;
};

const initialState: TAuthState = {
  userToggle: false,
  user: null,
  token: null,
  profileLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userTrack: (state) => {
      state.userToggle = !state.userToggle;
    },

    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
    },

    setProfileLoading: (state, action) => {
      state.profileLoading = action.payload;
    },
  },
});

export const { userTrack, setUser, logout, setProfileLoading } =
  authSlice.actions;
export default authSlice.reducer;
