import { ShieldCheck, Calendar, Lock, Eye, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const ParentalControlSection = () => {
  return (
    <section className="w-full py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center" data-tour="parental">
          {/* Left — Title + Seal */}
          <div className="flex-1 flex flex-col items-center lg:items-start">
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] leading-tight font-heading font-bold text-[#363636] mb-10 text-center lg:text-left">
              Sello de Control
              <br />
              Parental Activo.
            </h2>

            {/* Fancy Seal */}
            <motion.div
              className="relative w-48 h-48 sm:w-56 sm:h-56"
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
            >
              {/* Outer decorative ring with dashes */}
              <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-secondary/40 animate-[spin_30s_linear_infinite]" />

              {/* Scalloped edge effect */}
              <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-secondary via-orange-400 to-secondary shadow-xl">
                {/* Inner content */}
                <div className="w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Subtle radial shine */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25)_0%,transparent_60%)]" />

                  {/* Top curved text */}
                  <span className="text-white/90 text-[9px] sm:text-[11px] font-semibold tracking-[0.25em] uppercase mb-1 relative z-10">
                    Control Parental
                  </span>

                  {/* Center logo circle */}
                  <motion.div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-md flex items-center justify-center relative z-10"
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <span className="text-secondary text-3xl sm:text-4xl font-heading font-extrabold">
                      N
                    </span>
                  </motion.div>

                  {/* Bottom badge */}
                  <div className="flex items-center gap-1.5 mt-2 relative z-10">
                    <ShieldCheck className="w-4 h-4 text-white drop-shadow-sm" />
                    <span className="text-white text-[10px] sm:text-xs font-semibold tracking-wide">
                      Protected Today
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating shield icons */}
              <motion.div
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Lock className="w-4 h-4 text-secondary" />
              </motion.div>
              <motion.div
                className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <Eye className="w-3.5 h-3.5 text-secondary" />
              </motion.div>
              <motion.div
                className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <Bell className="w-3 h-3 text-secondary" />
              </motion.div>
            </motion.div>
          </div>

          {/* Right — Blog preview */}
          <div className="flex-1 flex flex-col gap-6">
            <motion.div
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h3 className="text-lg font-heading font-semibold text-[#363636] mb-3">
                Netia: un ecosistema digital para transformar el deporte
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>19 ago 2025</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParentalControlSection;
