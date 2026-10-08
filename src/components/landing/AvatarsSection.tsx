import { motion } from 'framer-motion';
import tinoAvatar from '@/assets/tino-avatar.png';
import zahiaAvatar from '@/assets/zahia-avatar.png';
import romaAvatar from '@/assets/roma-avatar.png';

const avatars = [
  {
    name: 'Tino',
    role: 'Coach técnico',
    image: tinoAvatar,
    bgColor: 'bg-[#EBF4FF]',
    roleColor: 'text-primary',
    roleBg: 'bg-blue-50',
  },
  {
    name: 'Zahia',
    role: 'Nutricionista',
    image: zahiaAvatar,
    bgColor: 'bg-[#E8FBF5]',
    roleColor: 'text-emerald-600',
    roleBg: 'bg-emerald-50',
  },
  {
    name: 'Roma',
    role: 'Psicóloga Deportiva',
    image: romaAvatar,
    bgColor: 'bg-[#F3EFFE]',
    roleColor: 'text-[#7A5AF5]',
    roleBg: 'bg-purple-50',
  },
];

const AvatarsSection = () => {
  return (
    <section id="avatares" className="w-full py-12 sm:py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#F5F5F5] text-sm font-medium text-muted-foreground mb-4 sm:mb-5">
            Avatares
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[40px] leading-tight font-heading font-bold text-[#363636]">
            Tu Netia Team 24 / 7
          </h2>
        </div>

        {/* Avatar cards — tour spotlight target */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto" data-tour="avatars">
          {avatars.map((avatar, index) => (
            <motion.div
              key={avatar.name}
              className={`${avatar.bgColor} rounded-2xl overflow-hidden flex flex-col items-center pt-5 sm:pt-6 pb-5 sm:pb-6 px-4 cursor-pointer`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              whileHover={{ scale: 1.03 }}
            >
              {/* Avatar image */}
              <div className="w-full flex justify-center mb-3 sm:mb-4">
                <img
                  src={avatar.image}
                  alt={`${avatar.name} — ${avatar.role}`}
                  className="w-40 h-40 sm:w-56 sm:h-56 object-contain drop-shadow-md"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="text-left w-full px-2">
                <span className={`inline-block text-xs font-medium ${avatar.roleColor} ${avatar.roleBg} px-2 py-0.5 rounded mb-1`}>
                  {avatar.role}
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-[#363636]">
                  {avatar.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AvatarsSection;
