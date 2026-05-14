import Image from "next/image";
import { LinkedinIcon, TwitterIcon } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  title: string;
  bio: string;
  photo: string;
  linkedin?: string;
  twitter?: string;
}

const team: TeamMember[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    title: "CEO & Co-Founder",
    bio: "10+ years transforming the casting industry through technology and creative vision.",
    photo: "/about1.jpg",
    linkedin: "#",
    twitter: "#",
  },
  {
    id: 2,
    name: "James Okafor",
    title: "CTO & Co-Founder",
    bio: "AI architect and full-stack engineer passionate about building tools that empower creators.",
    photo: "/about2.jpg",
    linkedin: "#",
    twitter: "#",
  },
  {
    id: 3,
    name: "Priya Nambiar",
    title: "Head of Product",
    bio: "UX leader obsessed with crafting seamless experiences for talent, agents, and brands.",
    photo: "/about3.jpg",
    linkedin: "#",
  },
  {
    id: 4,
    name: "Marcus Chen",
    title: "Head of Talent Relations",
    bio: "Former casting director dedicated to fostering global opportunities for underrepresented artists.",
    photo: "/about4.jpg",
    linkedin: "#",
    twitter: "#",
  },
];

export default function AboutSection() {
  return (
    <section className='w-full py-16 md:py-24 px-4 md:px-8 bg-[#F6F7F9]'>
      <div className='container mx-auto'>
        {/* Header */}
        <div className='text-center mb-14 md:mb-20'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-[#1B1B1D] mb-4'>
            Meet the Team Behind Poolio
          </h2>
          <p className='text-[#404145] text-lg max-w-xl mx-auto leading-relaxed'>
            Passionate people building the future of casting — united by a
            mission to make it smarter, faster, and fairer.
          </p>
        </div>

        {/* Team Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 container mx-auto'>
          {team.map((member) => (
            <div
              key={member.id}
              className='group bg-white rounded-2xl border border-[#E7E8EA] overflow-hidden
                         shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1'
            >
              {/* Photo */}
              <div className='relative w-full aspect-square bg-[#E9EFFD] overflow-hidden'>
                <Image
                  src={member.photo || "/placeholder.svg"}
                  alt={`${member.name} – ${member.title}`}
                  fill
                  unoptimized
                  className='object-cover transition-transform duration-500 group-hover:scale-105'
                />
              </div>

              {/* Info */}
              <div className='p-6'>
                <h3 className='text-xl font-bold text-[#000000] mb-1'>
                  {member.name}
                </h3>
                <p className='text-sm font-semibold text-[#2563EB] mb-3'>
                  {member.title}
                </p>

                <div className='w-10 h-px bg-[#E7E8EA] mb-3' />

                <p className='text-sm text-[#404145] leading-relaxed mb-5'>
                  {member.bio}
                </p>

                {/* Social Links */}
                <div className='flex items-center gap-3'>
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='p-2 rounded-lg bg-[#F6F7F9] text-[#404145]
                                 hover:bg-[#2563EB] hover:text-white transition-all duration-200'
                      aria-label={`${member.name} on LinkedIn`}
                    >
                      <LinkedinIcon className='w-4 h-4' />
                    </a>
                  )}
                  {member.twitter && (
                    <a
                      href={member.twitter}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='p-2 rounded-lg bg-[#F6F7F9] text-[#404145]
                                 hover:bg-[#2563EB] hover:text-white transition-all duration-200'
                      aria-label={`${member.name} on Twitter`}
                    >
                      <TwitterIcon className='w-4 h-4' />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
