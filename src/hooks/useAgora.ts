"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgoraState, RemoteUser, UserRole } from "@/types/ecasting";

// Agora types (sdk loaded dynamically)
type IAgoraRTCClient = import("agora-rtc-sdk-ng").IAgoraRTCClient;
type ICameraVideoTrack = import("agora-rtc-sdk-ng").ICameraVideoTrack;
type IMicrophoneAudioTrack = import("agora-rtc-sdk-ng").IMicrophoneAudioTrack;
type IRemoteVideoTrack = import("agora-rtc-sdk-ng").IRemoteVideoTrack;
type IRemoteAudioTrack = import("agora-rtc-sdk-ng").IRemoteAudioTrack;

interface JoinConfig {
  appId: string;
  channel: string;
  token: string;
  role: UserRole;
}

interface UseAgoraReturn extends AgoraState {
  join: (config: JoinConfig) => Promise<void>;
  leave: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleMic: () => Promise<void>;
}

const initialState: AgoraState = {
  joined: false,
  loading: false,
  error: null,
  localVideoTrack: null,
  localAudioTrack: null,
  remoteUsers: [],
  isCameraOn: true,
  isMicOn: true,
};

export function useAgora(): UseAgoraReturn {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioRef = useRef<IMicrophoneAudioTrack | null>(null);

  const [state, setState] = useState<AgoraState>(initialState);

  const updateState = (partial: Partial<AgoraState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  const join = useCallback(
    async ({ appId, channel, token, role }: JoinConfig) => {
      updateState({ loading: true, error: null });

      try {
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

        const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        clientRef.current = client;

        // Set role before joining
        await client.setClientRole(role);

        // ── Remote user joined ──────────────────────────────────────────────
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          setState((prev) => {
            const exists = prev.remoteUsers.find((u) => u.uid === user.uid);
            const updated: RemoteUser = {
              uid: user.uid,
              hasVideo:
                mediaType === "video" ? true : (exists?.hasVideo ?? false),
              hasAudio:
                mediaType === "audio" ? true : (exists?.hasAudio ?? false),
              videoTrack:
                mediaType === "video" ? user.videoTrack : exists?.videoTrack,
              audioTrack:
                mediaType === "audio" ? user.audioTrack : exists?.audioTrack,
            };
            return {
              ...prev,
              remoteUsers: exists
                ? prev.remoteUsers.map((u) =>
                    u.uid === user.uid ? updated : u,
                  )
                : [...prev.remoteUsers, updated],
            };
          });

          if (mediaType === "audio") {
            (user.audioTrack as IRemoteAudioTrack)?.play();
          }

          if (mediaType === "video") {
            // Play is triggered in VideoTile via useEffect watching the track
          }
        });

        // ── Remote user unpublished ─────────────────────────────────────────
        client.on("user-unpublished", (user, mediaType) => {
          setState((prev) => ({
            ...prev,
            remoteUsers: prev.remoteUsers.map((u) =>
              u.uid === user.uid
                ? {
                    ...u,
                    hasVideo: mediaType === "video" ? false : u.hasVideo,
                    hasAudio: mediaType === "audio" ? false : u.hasAudio,
                    videoTrack:
                      mediaType === "video" ? undefined : u.videoTrack,
                    audioTrack:
                      mediaType === "audio" ? undefined : u.audioTrack,
                  }
                : u,
            ),
          }));
        });

        // ── Remote user left ────────────────────────────────────────────────
        client.on("user-left", (user) => {
          setState((prev) => ({
            ...prev,
            remoteUsers: prev.remoteUsers.filter((u) => u.uid !== user.uid),
          }));
        });

        // ── Join channel ────────────────────────────────────────────────────
        await client.join(appId, channel, token, null);

        if (role === "host") {
          const [audioTrack, videoTrack] =
            await AgoraRTC.createMicrophoneAndCameraTracks(
              { encoderConfig: "music_standard" },
              { encoderConfig: "720p_2" },
            );

          localAudioRef.current = audioTrack;
          localVideoRef.current = videoTrack;

          await client.publish([audioTrack, videoTrack]);

          updateState({
            joined: true,
            loading: false,
            localVideoTrack: videoTrack,
            localAudioTrack: audioTrack,
            isCameraOn: true,
            isMicOn: true,
          });
        } else {
          updateState({ joined: true, loading: false });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to join stream";
        updateState({ loading: false, error: message });
      }
    },
    [],
  );

  const leave = useCallback(async () => {
    localVideoRef.current?.close();
    localAudioRef.current?.close();
    await clientRef.current?.leave();
    clientRef.current = null;
    localVideoRef.current = null;
    localAudioRef.current = null;
    setState(initialState);
  }, []);

  const toggleCamera = useCallback(async () => {
    const track = localVideoRef.current;
    if (!track) return;
    const next = !state.isCameraOn;
    await track.setEnabled(next);
    updateState({ isCameraOn: next });
  }, [state.isCameraOn]);

  const toggleMic = useCallback(async () => {
    const track = localAudioRef.current;
    if (!track) return;
    const next = !state.isMicOn;
    await track.setEnabled(next);
    updateState({ isMicOn: next });
  }, [state.isMicOn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localVideoRef.current?.close();
      localAudioRef.current?.close();
      clientRef.current?.leave();
    };
  }, []);

  return { ...state, join, leave, toggleCamera, toggleMic };
}
