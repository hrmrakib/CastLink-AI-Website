import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Talent {
  talent_id: number;
  images: string[];
  is_active: boolean;
  name: string;
  agent_id?: number;
  agent_name: string;
  date_of_birth: string;
  gender: string;
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoe_size: string;
  dress_size: string;
  eye_color: string;
  hair_type: string;
  hair_color: string;
  skin_color: string;
  location: string;
  continent: string;
  country: string;
}

interface Pagination {
  total_results: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

interface ChatMessage {
  content: string;
  type: "user" | "ai";
  session_id: string;
  timestamp: string;
  conversation: string;
  pagination: Pagination | null;
  talents: Talent[]; // talents belonging to THIS message
  generated_job: unknown | null;
}

interface AiChatState {
  sessionId: string | null;
  messages: ChatMessage[]; // full history, each with its own conversation + talents
  talentListForModal: Talent[];
}

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState: AiChatState = {
  sessionId: null,
  messages: [],
  talentListForModal: [], // separate list to feed the modal, updated with the latest API response's talents
};

// ── Raw API response shape (what comes back from the server) ──────────────────

interface AiChatApiResponse {
  content: string;
  type: "user" | "ai";
  session_id: string;
  timestamp: string;
  conversation: string;
  pagination: Pagination | null;
  data: { talents: Talent[] } | null;
  generated_job: unknown | null;
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const aiChatSlice = createSlice({
  name: "aiChat",
  initialState,
  reducers: {
    // Flatten the API response into a ChatMessage and push it onto messages[]
    addMessageResponse(state, action: PayloadAction<AiChatApiResponse>) {
      const {
        content,
        type,
        session_id,
        timestamp,
        conversation,
        pagination,
        data,
        generated_job,
      } = action.payload;

      state.sessionId = session_id;

      // Each message stores its own conversation text and its own talents list
      state.messages.push({
        content,
        type,
        session_id,
        timestamp,
        conversation,
        pagination: pagination ?? null,
        talents: data?.talents ?? [], // empty array if no talents in this response
        generated_job: generated_job ?? null,
      });
    },

    // Clear everything for a fresh session
    resetChat() {
      return initialState;
    },

    // Add talents to the modal list
    addTalentsToModal(state, action: PayloadAction<Talent[]>) {
      state.talentListForModal = action.payload;
    },
  },
});

export const { addMessageResponse, resetChat, addTalentsToModal } =
  aiChatSlice.actions;

export default aiChatSlice.reducer;
