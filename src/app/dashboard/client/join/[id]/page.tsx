/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  useLazyAgoraTokenQuery,
  useLazyJoinSessionQuery,
} from "@/redux/features/e-casting/eCastingRoomAPI";

export default function JoinPage({ params }: any) {
  const { id } = params;

  const localRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);

  const [joinSession] = useLazyJoinSessionQuery();
  const [getToken] = useLazyAgoraTokenQuery();

  useEffect(() => {
    const init = async () => {
      try {
        // ✅ STEP 1: Join session (get channel)
        const joinRes = await joinSession(id).unwrap();
        const channelFromJoin = joinRes.channel;

        // ✅ STEP 2: Get token
        const tokenRes = await getToken(id).unwrap();

        const { app_id, token, channel } = tokenRes;

        // 🔥 SAFETY CHECK
        if (channel !== channelFromJoin) {
          console.warn("Channel mismatch!", channel, channelFromJoin);
        }

        // ✅ STEP 3: Agora client
        const client = AgoraRTC.createClient({
          mode: "rtc",
          codec: "vp8",
        });

        // ✅ STEP 4: Join Agora
        await client.join(app_id, channel, token, null);

        // ✅ STEP 5: Create tracks
        const [micTrack, camTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();

        // ✅ STEP 6: Publish
        await client.publish([micTrack, camTrack]);

        // 🎥 Local video
        camTrack.play(localRef.current!);

        // 👥 Remote users
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          if (mediaType === "video") {
            user.videoTrack!.play(remoteRef.current!);
          }

          if (mediaType === "audio") {
            user.audioTrack!.play();
          }
        });

        // ❌ Clean up
        return () => {
          client.leave();
          micTrack.close();
          camTrack.close();
        };
      } catch (err) {
        console.error("Agora Init Error:", err);
      }
    };

    init();
  }, [id]);

  return (
    <div className='h-screen grid grid-cols-2 gap-4 bg-black p-4'>
      <div ref={localRef} className='bg-gray-800 rounded-xl' />
      <div ref={remoteRef} className='bg-gray-800 rounded-xl' />
    </div>
  );
}
