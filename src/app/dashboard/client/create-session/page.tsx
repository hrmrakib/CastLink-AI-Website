"use client";

import { useCreateSessionMutation } from "@/redux/features/e-casting/eCastingRoomAPI";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const [createSession] = useCreateSessionMutation();
  const router = useRouter();

  const handleCreate = async () => {
    try {
      const res = await createSession({
        job_id: 82,
        talent_ids: [1],
        scheduled_time: "2026-03-11T05",
      }).unwrap();

      router.push(`/dashboard/client/active-jobs/join/${res.session_id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='flex h-screen items-center justify-center'>
      <button
        onClick={handleCreate}
        className='bg-blue-500 px-6 py-3 text-white rounded-xl'
      >
        Create Session
      </button>
    </div>
  );
}
