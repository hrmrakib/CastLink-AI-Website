// Replace with your ZEGO project credentials
export const ZegoCallConfig = {
  appId: 1741106316,
  appSign: "908e90a278829c489c7c1552ad8298f880dd411f1252e3d8e3848f38b7d9dda8",
  callResourceId: "zegouikit_call",
} as const;

export interface ZegoUser {
  userId: string | number;
  fullName: string;
  email: string;
}

export interface ZegoCallServiceState {
  isInitialized: boolean;
  isInCall: boolean;
  error: string | null;
}
