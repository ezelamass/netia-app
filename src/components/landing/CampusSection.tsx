import { Moon, Dumbbell, Apple } from 'lucide-react';
import { motion } from 'framer-motion';

const campusCards = [
  {
    icon: Moon,
    title: 'Descanso y recuperación',
    description: 'El rendimiento también se entrena en los momentos de pausa.',
  },
  {
    icon: Dumbbell,
    title: 'Entrenamiento físico y técnico',
    description: 'Movete, mejorá tu técnica y superá tus límites día a día.',
  },
  {
    icon: Apple,
    title: 'Alimentación inteligente',
    description: 'Comé como un atleta. Pensá tu nutrición como parte del entrenamiento.',
  },
];

const CampusSection = () => {
  return (
    <section id="campus" className="w-full py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#F5F5F5] text-sm font-medium text-muted-foreground mb-5">
            Campus
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] leading-tight font-heading font-bold text-[#363636] max-w-2xl mx-auto">
            El espacio donde entrenás, te cuidás y evolucionás como atleta.
          </h2>
        </div>

        {/* Cards grid — tour spotlight target */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto" data-tour="campus">
          {campusCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: index * 0.12 }}
              >
                <div className="w-10 h-10 rounded-lg bg-[#F0F0FF] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#6B6B9E]" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-[#363636] mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CampusSection;
