import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Asterisk } from 'lucide-react';
import { motion } from 'framer-motion';

interface CtaBannerProps {
  onDemoClick?: () => void;
}

const CtaBanner = ({ onDemoClick }: CtaBannerProps) => {
  return (
    <section className="w-full py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative bg-secondary rounded-[2.3rem] py-14 sm:py-20 px-8 sm:px-16 text-center overflow-hidden"
          data-tour="cta-demo"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative elements */}
          <Asterisk className="absolute top-6 right-8 w-12 h-12 sm:w-16 sm:h-16 text-primary opacity-90" strokeWidth={3} />
          <Asterisk className="absolute bottom-8 left-6 w-10 h-10 sm:w-14 sm:h-14 text-primary opacity-80 rotate-12" strokeWidth={3} />

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white mb-8 max-w-lg mx-auto leading-snug">
            Tu entrenamiento merece una experiencia distinta. Sumate ahora
          </h2>

          <div className="flex flex-col items-center gap-3">
            <Link to="/register">
              <Button className="rounded-full px-8 py-3 text-[16px] font-medium h-auto bg-primary hover:bg-primary/90 text-white">
                Empezá
              </Button>
            </Link>
            <button
              onClick={onDemoClick}
              className="text-white/80 text-sm underline hover:text-white transition-colors"
            >
              o probá la demo gratis
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaBanner;
