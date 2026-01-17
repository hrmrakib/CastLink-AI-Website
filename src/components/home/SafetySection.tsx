import { Star, ShieldCheck, LockKeyhole } from "lucide-react";

export default function SafetySection() {
  const safetyFeatures = [
    {
      icon: ShieldCheck,
      title: "All professional members are verified by our team",
      description: "Verified professionals",
    },
    {
      icon: LockKeyhole,
      title: "Advanced tools to stop scammers in their tracks",
      description: "Security tools",
    },
    {
      icon: Star,
      title: "Community reviews for added peace of mind",
      description: "Community trust",
    },
  ];

  return (
    <section className='w-full py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8'>
      <div className='container mx-auto'>
        {/* Header */}
        <div className='text-center mb-12 md:mb-16 lg:mb-20'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance'>
            Your safety comes first
          </h2>
        </div>

        {/* Feature Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8'>
          {safetyFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className='flex flex-col items-center text-center transition-transform duration-300 hover:scale-105'
              >
                {/* Icon Circle */}
                <div className='mb-6 p-8 rounded-full bg-[#E9EFFD] dark:bg-blue-950'>
                  <Icon className='w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400' />
                </div>

                {/* Text Content */}
                <p className='text-base md:text-lg text-foreground leading-relaxed max-w-xs'>
                  {feature.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
