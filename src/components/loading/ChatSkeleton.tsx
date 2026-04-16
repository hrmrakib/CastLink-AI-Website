export const ChatSkeleton = () => (
  <div className='space-y-8'>
    {/* User message */}
    <div className='flex gap-3 justify-end items-start'>
      <div className='space-y-2 mt-1'>
        <div className='h-4 w-52 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-36 bg-gray-200 rounded-full animate-pulse' />
      </div>
      <div className='w-8 h-8 rounded-full bg-gray-200 shrink-0 animate-pulse' />
    </div>

    {/* AI message */}
    <div className='flex gap-1.5 justify-start items-start'>
      <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 shrink-0 animate-pulse' />
      <div className='space-y-2 mt-1'>
        <div className='h-4 w-64 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-48 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-72 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-56 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-40 bg-gray-200 rounded-full animate-pulse' />
      </div>
    </div>

    {/* User message */}
    <div className='flex gap-3 justify-end items-start'>
      <div className='space-y-2 mt-1'>
        <div className='h-4 w-52 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-36 bg-gray-200 rounded-full animate-pulse' />
      </div>
      <div className='w-8 h-8 rounded-full bg-gray-200 shrink-0 animate-pulse' />
    </div>

    {/* AI message */}
    <div className='flex gap-1.5 justify-start items-start'>
      <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 shrink-0 animate-pulse' />
      <div className='space-y-2 mt-1'>
        <div className='h-4 w-80 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-60 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-72 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-44 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-52 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-36 bg-gray-200 rounded-full animate-pulse' />
      </div>
    </div>

    {/* User message */}
    <div className='flex gap-3 justify-end items-start'>
      <div className='space-y-2 mt-1'>
        <div className='h-4 w-48 bg-gray-200 rounded-full animate-pulse' />
      </div>
      <div className='w-8 h-8 rounded-full bg-gray-200 shrink-0 animate-pulse' />
    </div>

    {/* AI message */}
    <div className='flex gap-1.5 justify-start items-start'>
      <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 shrink-0 animate-pulse' />
      <div className='space-y-2 mt-1'>
        <div className='h-4 w-64 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-56 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-40 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-72 bg-gray-200 rounded-full animate-pulse' />
        <div className='h-4 w-48 bg-gray-200 rounded-full animate-pulse' />
      </div>
    </div>
  </div>
);
