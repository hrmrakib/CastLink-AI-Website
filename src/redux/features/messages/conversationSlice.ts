import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LastMessage {
  message: string;
  sender_id: number;
  created_at: string;
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

interface ConversationState {
  conversations: TConversation[];
  activeConversationId: number | null;
}

const initialState: ConversationState = {
  conversations: [],
  activeConversationId: null,
};

const conversationSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    // Set the entire list (e.g., after an API fetch)
    setConversations: (state, action: PayloadAction<TConversation[]>) => {
      state.conversations = action.payload;
    },
    // Update a single conversation (e.g., when a new message arrives via Socket)
    updateConversation: (state, action: PayloadAction<TConversation>) => {
      const index = state.conversations.findIndex(
        (c) => c.conversation_id === action.payload.conversation_id,
      );
      if (index !== -1) {
        state.conversations[index] = action.payload;
      } else {
        state.conversations.unshift(action.payload); // Add to top if new
      }
    },
    setActiveConversation: (state, action: PayloadAction<number | null>) => {
      state.activeConversationId = action.payload;
    },
    clearConversations: (state) => {
      state.conversations = [];
      state.activeConversationId = null;
    },
  },
});

export const {
  setConversations,
  updateConversation,
  setActiveConversation,
  clearConversations,
} = conversationSlice.actions;

// Selectors for getting data
// export const selectAllConversations = (state: RootState) =>
//   state?.conversations?.conversations;
// export const selectActiveId = (state: RootState) =>
//   state.conversations.activeConversationId;
// export const selectActiveConversation = (state: RootState) =>
//   state.conversations.conversations.find(
//     (c) => c.conversation_id === state.conversations.activeConversationId,
//   );

export default conversationSlice.reducer;
