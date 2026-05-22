import {
  Briefcase,
  BriefcaseConveyorBelt,
  CalendarClock,
  MessageSquareLock,
  ScanFace,
} from "lucide-react";

const features = [
  {
    id: 1,
    title: "Prompt-based job creation",
    description: "Turn simple prompts into clear,structured casting briefs.",
    icon: BriefcaseConveyorBelt,
    colorClass: "bg-blue-600",
  },
  {
    id: 2,
    title: "AI smart talent matching",
    description: "Let Al find you a perfect match for your project",
    icon: ScanFace,
    colorClass: "bg-blue-700",
  },
  {
    id: 3,
    title: "Communication",
    description: "Keep all your communication in one place",
    icon: MessageSquareLock,
    colorClass: "bg-blue-800",
  },
  {
    id: 4,
    title: "Availability tracking",
    description: "Check Availability and Book",
    icon: CalendarClock,
    colorClass: "bg-purple-600",
  },
];

export default function PowerfulFeature() {
  return (
    <section id='features' className='w-full py-16 md:py-24 px-4'>
      <div className='container mx-auto'>
        {/* Header */}
        <div className='text-center mb-16 md:mb-20'>
          <h2 className='text-2xl md:text-[32px] font-bold text-[#1B1B1D] mb-4 text-balance'>
            Powerful Features
          </h2>
          <p className='text-lg md:text-xl text-[#404145] text-balance'>
            Everything you need for modern casting management
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className='flex flex-col items-center text-center group'
              >
                {/* Icon Container */}
                <div
                  className={`${feature.colorClass} rounded-xl p-4 mb-6 transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className='w-8 h-8 text-white' />
                </div>

                {/* Title */}
                <h3 className='text-lg md:text-xl font-bold text-[#1B1B1D] mb-3'>
                  {feature.title}
                </h3>

                {/* Description */}
                <p className='text-sm md:text-base text-[#404145] leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
