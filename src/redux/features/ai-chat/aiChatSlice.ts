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

// Matches data.saved_filters on GET /chat/{session_id} messages
interface SavedFilters {
  title: string;
  description: string;
  location: string;
  gender: string;
  skin_color: string;
  shoot_date: string[];
  budget: string;
  job_type: string;
  role: string;
  suggested_talents_list: Talent[];
  total_results: number;
}

interface ChatMessage {
  content: string;
  type: "user" | "ai";
  session_id: string;
  timestamp: string;
  conversation: string;
  pagination: Pagination | null;
  talents: Talent[];
  generated_job: unknown | null;
}

interface AiChatState {
  sessionId: string | null;
  messages: ChatMessage[];
  talentListForModal: Talent[];
}

const initialState: AiChatState = {
  sessionId: null,
  messages: [],
  talentListForModal: [],
};

// ── Raw API response shapes ───────────────────────────────────────────────────
// POST /chat/create  → talents live in data.talents
// GET  /chat/{id}    → talents live in saved_filters.suggested_talents_list

interface AiChatApiResponse {
  session_id: string;
  conversation: string;
  timestamp: string;
  pagination: Pagination | null;
  generated_job: unknown | null;
  // mutation response
  data: { talents: Talent[] } | null;
  // GET query response (last message carries saved_filters)
  saved_filters?: SavedFilters | null;
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const aiChatSlice = createSlice({
  name: "aiChat",
  initialState,
  reducers: {
    addMessageResponse(state, action: PayloadAction<AiChatApiResponse>) {
      const {
        session_id,
        conversation,
        timestamp,
        pagination,
        data,
        saved_filters,
        generated_job,
      } = action.payload;

      state.sessionId = session_id;

      // Resolve talents from whichever source the response provides
      const talents =
        data?.talents ?? saved_filters?.suggested_talents_list ?? [];

      state.messages.push({
        content: conversation ?? "",
        type: "ai",
        session_id,
        timestamp,
        conversation,
        pagination: pagination ?? null,
        talents,
        generated_job: generated_job ?? null,
      });

      // Keep modal talent list in sync with the latest response
      if (talents.length) {
        state.talentListForModal = talents;
      }
    },

    resetChat() {
      return initialState;
    },

    addTalentsToModal(state, action: PayloadAction<Talent[]>) {
      state.talentListForModal = action.payload;
    },
  },
});

export const { addMessageResponse, resetChat, addTalentsToModal } =
  aiChatSlice.actions;

export default aiChatSlice.reducer;

// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface Talent {
//   talent_id: number;
//   images: string[];
//   is_active: boolean;
//   name: string;
//   agent_id?: number;
//   agent_name: string;
//   date_of_birth: string;
//   gender: string;
//   height: string;
//   bust: string;
//   waist: string;
//   hips: string;
//   shoe_size: string;
//   dress_size: string;
//   eye_color: string;
//   hair_type: string;
//   hair_color: string;
//   skin_color: string;
//   location: string;
//   continent: string;
//   country: string;
// }

// interface Pagination {
//   total_results: number;
//   page: number;
//   per_page: number;
//   has_next: boolean;
// }

// interface ChatMessage {
//   content: string;
//   type: "user" | "ai";
//   session_id: string;
//   timestamp: string;
//   conversation: string;
//   pagination: Pagination | null;
//   talents: Talent[]; // talents belonging to THIS message
//   generated_job: unknown | null;
// }

// interface AiChatState {
//   sessionId: string | null;
//   messages: ChatMessage[]; // full history, each with its own conversation + talents
//   talentListForModal: Talent[];
// }

// // ── Initial State ─────────────────────────────────────────────────────────────

// const initialState: AiChatState = {
//   sessionId: null,
//   messages: [],
//   talentListForModal: [], // separate list to feed the modal, updated with the latest API response's talents
// };

// // ── Raw API response shape (what comes back from the server) ──────────────────

// interface AiChatApiResponse {
//   content: string;
//   type: "user" | "ai";
//   session_id: string;
//   timestamp: string;
//   conversation: string;
//   pagination: Pagination | null;
//   data: { talents: Talent[] } | null;
//   generated_job: unknown | null;
// }

// // ── Slice ─────────────────────────────────────────────────────────────────────

// const aiChatSlice = createSlice({
//   name: "aiChat",
//   initialState,
//   reducers: {
//     // Flatten the API response into a ChatMessage and push it onto messages[]
//     addMessageResponse(state, action: PayloadAction<AiChatApiResponse>) {
//       const {
//         content,
//         type,
//         session_id,
//         timestamp,
//         conversation,
//         pagination,
//         data,
//         generated_job,
//       } = action.payload;

//       state.sessionId = session_id;

//       // Each message stores its own conversation text and its own talents list
//       state.messages.push({
//         content,
//         type,
//         session_id,
//         timestamp,
//         conversation,
//         pagination: pagination ?? null,
//         talents: data?.talents ?? [], // empty array if no talents in this response
//         generated_job: generated_job ?? null,
//       });
//     },

//     // Clear everything for a fresh session
//     resetChat() {
//       return initialState;
//     },

//     // Add talents to the modal list
//     addTalentsToModal(state, action: PayloadAction<Talent[]>) {
//       state.talentListForModal = action.payload;
//     },
//   },
// });

// export const { addMessageResponse, resetChat, addTalentsToModal } =
//   aiChatSlice.actions;

// export default aiChatSlice.reducer;
