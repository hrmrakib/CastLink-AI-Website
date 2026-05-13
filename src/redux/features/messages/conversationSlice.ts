import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LastMessage {
  attachment: string | null;
  created_at: string;
  message_id: number;
  message_type: string;
  sender_id: number;
  text: string;
}

export type TConversation = {
  conversation_id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_email: string;
  other_user_profile_pic: string;
  last_message: LastMessage;
  unread_count: number;
  updated_at: string;
  created_at: string;
};

const initialState: TConversation = {
  conversation_id: 0,
  other_user_id: 0,
  other_user_name: "",
  other_user_email: "",
  other_user_profile_pic: "",
  last_message: {
    attachment: null,
    created_at: "",
    message_id: 0,
    message_type: "",
    sender_id: 0,
    text: "",
  },
  unread_count: 0,
  updated_at: "",
  created_at: "",
};

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setConversation: (state, action: PayloadAction<TConversation>) => {
      return action.payload; // Correct way to replace the entire state object
    },

    clearConversation: () => {
      return initialState; // Reset back to the empty object structure
    },
  },
});

export const { setConversation, clearConversation } = conversationSlice.actions;

export default conversationSlice.reducer;
