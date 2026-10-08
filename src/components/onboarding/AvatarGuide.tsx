import { motion } from 'framer-motion';
import { AGENTS } from '@/lib/avatars';
import { cn } from '@/lib/utils';

type AvatarType = 'tino' | 'zahia' | 'roma';

interface AvatarGuideProps {
  avatar: AvatarType;
  message: string;
  className?: string;
}

const avatarImages: Record<AvatarType, string> = {
  tino: AGENTS.TINO.image,
  zahia: AGENTS.ZAHIA.image,
  roma: AGENTS.ROMA.image,
};

const avatarColors: Record<AvatarType, string> = {
  tino: 'from-tino to-tino/80',
  zahia: 'from-zahia to-zahia/80',
  roma: 'from-roma to-roma/80',
};

const avatarNames: Record<AvatarType, string> = {
  tino: 'TINO',
  zahia: 'ZAHIA',
  roma: 'ROMA',
};

export const AvatarGuide = ({ avatar, message, className }: AvatarGuideProps) => {
  return (
    <motion.div
      className={cn('flex items-start gap-3', className)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Avatar image */}
      <motion.div
        className={cn(
          'relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-br shrink-0',
          avatarColors[avatar]
        )}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <img
          src={avatarImages[avatar]}
          alt={avatarNames[avatar]}
          className="w-full h-full rounded-full object-cover"
        />
        
        {/* Pulse ring */}
        <motion.div
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-br opacity-50',
            avatarColors[avatar]
          )}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      </motion.div>

      {/* Message bubble */}
      <motion.div
        className="relative glass rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <p className="text-sm text-foreground leading-relaxed">{message}</p>
        
        {/* Avatar name tag */}
        <span
          className={cn(
            'absolute -top-2 left-2 px-2 py-0.5 text-xs font-bold text-white rounded-full bg-gradient-to-r',
            avatarColors[avatar]
          )}
        >
          {avatarNames[avatar]}
        </span>
      </motion.div>
    </motion.div>
  );
};
