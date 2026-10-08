import { motion } from 'framer-motion';

const stats = [
  { value: '100%', label: 'Satisfacción' },
  { value: '25+', label: 'Años de experiencia' },
  { value: '1400+', label: 'Alumnos' },
  { value: '3', label: 'Avatares expertos' },
];

const StatsSection = () => {
  return (
    <section className="w-full py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="bg-[#FAFAFA] rounded-2xl py-10 px-6 sm:px-10"
          data-tour="stats"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-0">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex items-center">
                {index > 0 && (
                  <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-300 mx-8 lg:mx-12" />
                )}
                <div className="text-center min-w-[120px]">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#1C274C]">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
