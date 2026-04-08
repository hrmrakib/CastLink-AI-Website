"use client";

/**
 * useZegoCall
 *
 * React hook that wraps ZegoCallService, mirroring the lifecycle of
 * Flutter's Get.find<UserController>() + ZegoCallService pattern.
 *
 * Usage:
 *   const { isInitialized, joinCall, leaveCall, error } = useZegoCall(user);
 */

import { useCallback, useEffect, useRef, useState } from "react";
// import { ZegoCallService } from "@/lib/zego/ZegoCallService";
import { ZegoUser } from "@/config/ZegoCallConfig";
import { ZegoCallService } from "@/lib/ZegoCallService";

type CallScenario = "OneONoneCall" | "GroupCall" | "VideoConference";

interface UseZegoCallReturn {
  isInitialized: boolean;
  isInCall: boolean;
  error: string | null;
  joinCall: (
    container: HTMLElement,
    roomId: string,
    scenario?: CallScenario,
    onCallEnd?: () => void,
  ) => Promise<void>;
  leaveCall: () => void;
}

export function useZegoCall(user: ZegoUser | null): UseZegoCallReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Init on mount (when user is available)
  useEffect(() => {
    if (!user || initializedRef.current) return;

    initializedRef.current = true;
    ZegoCallService.initForCurrentUser(user)
      .then(() => setIsInitialized(true))
      .catch((err: Error) => {
        setError(err.message);
        initializedRef.current = false;
      });

    return () => {
      ZegoCallService.uninit();
      setIsInitialized(false);
      initializedRef.current = false;
    };
  }, [user]);

  const joinCall = useCallback(
    async (
      container: HTMLElement,
      roomId: string,
      scenario: CallScenario = "OneONoneCall",
      onCallEnd?: () => void,
    ) => {
      try {
        setError(null);
        await ZegoCallService.joinCall(container, roomId, scenario, () => {
          setIsInCall(false);
          onCallEnd?.();
        });
        setIsInCall(true);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to join call";
        setError(msg);
      }
    },
    [],
  );

  const leaveCall = useCallback(() => {
    ZegoCallService.uninit();
    setIsInCall(false);
    setIsInitialized(false);
    initializedRef.current = false;
  }, []);

  return { isInitialized, isInCall, error, joinCall, leaveCall };
}
