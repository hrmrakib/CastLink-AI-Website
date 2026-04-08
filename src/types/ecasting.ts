export interface CreateSessionPayload {
  job_id: number;
  talent_ids: number[];
  scheduled_time: string;
}

export interface CreateSessionResponse {
  status: boolean;
  session_id: string;
  join_link: string;
  scheduled_time: string;
}

export interface JoinSessionResponse {
  status: boolean;
  mode: string;
  session_id: string;
  channel: string;
}

export interface AgoraTokenResponse {
  app_id: string;
  channel: string;
  token: string;
}

export interface Participant {
  talent_id: number;
  name: string;
  status: "waiting" | "joined" | "left";
  join_time: string | null;
}

export interface GetParticipantsResponse {
  data: Participant[];
}

export type UserRole = "host" | "audience";

export interface RemoteUser {
  uid: string | number;
  hasVideo: boolean;
  hasAudio: boolean;
  videoTrack?: unknown;
  audioTrack?: unknown;
}

export interface AgoraState {
  joined: boolean;
  loading: boolean;
  error: string | null;
  localVideoTrack: unknown | null;
  localAudioTrack: unknown | null;
  remoteUsers: RemoteUser[];
  isCameraOn: boolean;
  isMicOn: boolean;
}
