import { ShieldCheck, Lock, Star, LockKeyhole, CheckCircle2, Users } from "lucide-react";

const safetyFeatures = [
  {
    icon: ShieldCheck,
    iconWrapperStyle: {
      background: "rgba(79, 110, 247, 0.12)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6), 0 4px 12px rgba(79,110,247,0.15)",
    },
    iconColor: "text-[#4F6EF7]",
    cardBg: "#F7F9FF",
    title: "Secure & Encrypted",
    description:
      "Your data is protected with end-to-end encryption, so your personal information stays private and safe.",
    badgeItems: ["SSL Secured", "GDPR Compliant"],
    badgeIcon: LockKeyhole,
    badgeBg: "#E0E7FF",
    badgeTextColor: "#4F6EF7",
  },
  {
    icon: Lock,
    iconWrapperStyle: {
      background: "rgba(22, 163, 74, 0.12)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6), 0 4px 12px rgba(22,163,74,0.15)",
    },
    iconColor: "text-[#16A34A]",
    cardBg: "#F4FEF7",
    title: "Verified & Trusted",
    description:
      "We verify users and talent to ensure authenticity and reduce risk across our platform.",
    badgeItems: ["ID Verification", "Manual Review"],
    badgeIcon: CheckCircle2,
    badgeBg: "#DCFCE7",
    badgeTextColor: "#16A34A",
  },
  {
    icon: Star,
    iconWrapperStyle: {
      background: "rgba(147, 51, 234, 0.12)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6), 0 4px 12px rgba(147,51,234,0.15)",
    },
    iconColor: "text-purple-600",
    cardBg: "#FBF7FF",
    title: "Safe Community",
    description:
      "We actively monitor activity and enforce strict policies to keep our community respectful and safe.",
    badgeItems: ["24/7 Monitoring", "Report & Support"],
    badgeIcon: Users,
    badgeBg: "#EDE9FE",
    badgeTextColor: "#9333EA",
  },
];

export default function SafetySection() {
  return (
    <section
      className="w-full py-20 px-4 md:px-6"
      style={{ background: "#F4F6FB" }}
    >
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Your safety comes first
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base md:text-[17px] leading-relaxed max-w-xl mx-auto">
            We use industry-leading security, strict verification, and transparent policies to protect our community and your data.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {safetyFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const BadgeIcon = feature.badgeIcon;
            return (
              <div
                key={index}
                className="rounded-2xl flex flex-col items-center text-center pt-10 pb-0 px-7 border border-gray-100 dark:border-gray-800"
                style={{ background: feature.cardBg, boxShadow: "0 2px 16px 0 rgba(80,100,180,0.06)" }}
              >
                {/* Icon Circle */}
                <div
                  className="w-18 h-18 rounded-full flex items-center justify-center mb-5 flex-shrink-0"
                  style={feature.iconWrapperStyle}
                >
                  <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                  {feature.description}
                </p>

                {/* Badge Footer */}
                <div
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 mb-6"
                  style={{ background: feature.badgeBg }}
                >
                  <BadgeIcon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: feature.badgeTextColor }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: feature.badgeTextColor }}
                  >
                    {feature.badgeItems[0]}
                  </span>
                  <span
                    className="text-xs font-semibold opacity-50"
                    style={{ color: feature.badgeTextColor }}
                  >
                    •
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: feature.badgeTextColor }}
                  >
                    {feature.badgeItems[1]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
