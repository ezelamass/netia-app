import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const visionCards = [
  {
    title: 'Un nuevo modelo de entrenamiento digital',
    description: 'Tecnología, juego y personalización para atletas de todas las edades.',
  },
  {
    title: 'Avatares que enseñan, motivan y conectan',
    description: 'Personajes interactivos con voz propia que transforman la experiencia.',
  },
  {
    title: 'Creado para escalar y adaptarse',
    description: 'Arranca en tenis, pero crece hacia un ecosistema multideporte.',
  },
];

const VisionSection = () => {
  return (
    <section id="nosotros" className="w-full py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20" data-tour="vision">
          {/* Left column */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="inline-block w-fit px-4 py-1.5 rounded-full bg-[#F5F5F5] text-sm font-medium text-muted-foreground mb-6">
              Nuestra visión
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] leading-tight font-heading font-bold text-[#363636] mb-8">
              Queremos que
              <br />
              nuestros deportistas
              <br />
              sean los mejores
            </h2>
            <div>
              <a href="#nosotros">
                <Button className="rounded-full px-7 py-3 text-[16px] font-medium h-auto">
                  Sobre nosotros
                </Button>
              </a>
            </div>
          </div>

          {/* Right column — cards */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {visionCards.map((card, index) => (
              <motion.div
                key={card.title}
                className="min-w-0 bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-start gap-4"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#EDEBFF] flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-[#7A5AF5]" />
                </div>
                <div>
                  <h4 className="text-lg font-heading font-semibold text-[#363636] mb-1">
                    {card.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
