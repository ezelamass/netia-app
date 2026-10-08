import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, ArrowUpRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroVideo from '@/components/landing/HeroVideo';

interface HeroSectionProps {
  onDemoClick?: () => void;
}

const HeroSection = ({ onDemoClick }: HeroSectionProps) => {
  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left column — tour spotlight target (CTAs + headline) */}
          <div className="flex-1 max-w-xl" data-tour="hero-cta">
            {/* Social proof */}
            <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">5.0</span>
              <span>|</span>
              <span>+100 alumnos</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] leading-tight font-heading font-bold text-[#363636] mb-8">
              Ecosistema{' '}
              <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary text-white align-middle">
                <ArrowUpRight className="w-5 h-5" />
              </span>
              <br className="hidden sm:block" />
              digital multideporte
              <br />
              diseñado para chicos
              <br />
              <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-primary text-white align-middle mr-1">
                <Star className="w-4 h-4 fill-white" />
              </span>{' '}
              de 8 a 16 años
            </h1>
            <p className="-mt-4 mb-8 text-lg text-muted-foreground">
              Con tres asistentes de <span className="bg-ai bg-clip-text font-semibold text-transparent">IA</span> que entrenan, cuidan y motivan a cada chico.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/register">
                <Button className="rounded-full px-7 py-3 text-[16px] font-medium h-auto">
                  Inscribite
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="rounded-full px-7 py-3 text-[16px] font-medium h-auto gap-2"
                onClick={onDemoClick}
              >
                <Play className="w-4 h-4" />
                Probar Demo
              </Button>
              <a href="#nosotros">
                <Button
                  variant="outline"
                  className="rounded-full px-7 py-3 text-[16px] font-medium h-auto border-2"
                >
                  Saber mas
                </Button>
              </a>
            </div>
          </div>

          {/* Right column — video institucional */}
          <motion.div
            className="w-full flex-1 lg:max-w-[560px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <HeroVideo />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
