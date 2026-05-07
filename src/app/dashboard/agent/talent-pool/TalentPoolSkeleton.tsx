const skeletonCards = Array.from({ length: 8 });

export function TalentPoolSkeleton({ columns = 4 }) {
  const gridClass =
    {
      1: "grid-cols-1 sm:grid-cols-8",
      2: "grid-cols-2 sm:grid-cols-6",
      3: "grid-cols-2 sm:grid-cols-5 lg:grid-cols-5",
      4: "grid-cols-2 sm:grid-cols-5 lg:grid-cols-4",
    }[columns] || "grid-cols-2 sm:grid-cols-5 lg:grid-cols-4";

  return (
    <main className='min-h-screen bg-white rounded-xl'>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        @keyframes card-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.008); }
        }
        .sk-shimmer {
          background: linear-linear(90deg, #ececec 0px, #d8d8d8 80px, #ececec 160px);
          background-size: 600px 100%;
          animation: shimmer 1.6s infinite linear;
        }
        .sk-shimmer-dark {
          background: linear-linear(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.14) 80px, rgba(255,255,255,0.04) 160px);
          background-size: 600px 100%;
          animation: shimmer 1.6s infinite linear;
        }
        .sk-card { animation: card-breathe 3.2s ease-in-out infinite; }
        .sk-card:nth-child(2) { animation-delay: 0.4s; }
        .sk-card:nth-child(3) { animation-delay: 0.8s; }
        .sk-card:nth-child(4) { animation-delay: 1.2s; }
        .sk-card:nth-child(5) { animation-delay: 1.6s; }
        .sk-card:nth-child(6) { animation-delay: 2.0s; }
        .sk-card:nth-child(7) { animation-delay: 2.4s; }
        .sk-card:nth-child(8) { animation-delay: 2.8s; }
      `}</style>

      {/* Header */}
      <div className='bg-card rounded-xl'>
        <div className='mx-auto container pt-6'>
          {/* Title */}
          {/* <div className='mb-8'>
            <div className='sk-shimmer h-7 w-40 rounded-md mb-2.5' />
            <div className='sk-shimmer h-4 w-56 rounded' />
          </div> */}

          {/* Controls */}
          <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center pb-6'>
            {/* Left: dropdowns */}
            <div className='flex gap-3'>
              <div className='sk-shimmer h-10 w-32.5 rounded-lg border border-border' />
              <div className='sk-shimmer h-10 w-32.5 rounded-lg border border-border' />
            </div>
            {/* Right: grid icons + slider */}
            <div className='flex items-center gap-4'>
              <div className='hidden sm:flex gap-2'>
                <div className='sk-shimmer h-9 w-9 rounded-md' />
                <div className='sk-shimmer h-9 w-9 rounded-md' />
              </div>
              <div className='sk-shimmer h-2 w-32 rounded-full' />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className='mx-auto container py-8'>
        <div
          className={`grid gap-4 transition-all duration-300 sm:gap-6 ${gridClass}`}
        >
          {skeletonCards.map((_, idx) => (
            <div
              key={idx}
              className='sk-card relative h-80 sm:h-96 overflow-hidden rounded-2xl bg-[#18181883] shadow-lg'
            >
              {/* shimmer wash */}
              <div className='sk-shimmer-dark absolute inset-0 z-1' />

              {/* Top fade */}
              <div className='absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-black/30 to-transparent z-2' />

              {/* Dot menu placeholder */}
              <div className='absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/9 border border-white/[0.14]' />

              {/* Bottom stats */}
              <div className='absolute bottom-0 left-0 right-0 z-5 p-4 sm:p-6 bg-linear-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-1.5'>
                <div className='sk-shimmer-dark h-3.5 w-[62%] rounded mb-1' />
                {[68, 52, 58, 48, 60, 46, 50, 42].map((w, i) => (
                  <div
                    key={i}
                    className='sk-shimmer-dark h-2.5 rounded opacity-65'
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <div className='bg-muted min-h-screen p-6'>
      <TalentPoolSkeleton columns={4} />
    </div>
  );
}
