import { configureStore } from "@reduxjs/toolkit";
import baseAPI from "./api/api";
import authReducer from "./features/auth/authSlice";
import { aiBaseAPI } from "./features/ai-chat/aiChatAPI";
import aiReducer from "./features/ai-chat/aiChatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    aiChat: aiReducer,
    [baseAPI.reducerPath]: baseAPI.reducer,
    [aiBaseAPI.reducerPath]: aiBaseAPI.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseAPI.middleware, aiBaseAPI.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
