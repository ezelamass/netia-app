import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Lock, Mail, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

const sportsQuotes = [
  "El único modo de hacer un gran trabajo es amar lo que haces - Steve Jobs",
  "El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el coraje de continuar - Winston Churchill",
  "No cuentes los días, haz que los días cuenten - Muhammad Ali",
  "La diferencia entre lo imposible y lo posible está en la determinación - Tommy Lasorda",
  "El talento gana juegos, pero el trabajo en equipo y la inteligencia ganan campeonatos - Michael Jordan",
  "Cuanto más duro trabajo, más suerte tengo - Gary Player",
  "El dolor es temporal, el orgullo es para siempre - Anónimo",
  "No te detengas cuando estés cansado, detente cuando hayas terminado - Anónimo",
];

type RegisterRole = 'player' | 'parent';

const roleLabels: Record<RegisterRole, string> = {
  player: 'Jugador',
  parent: 'Familia',
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<RegisterRole>('player');
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const randomQuote = sportsQuotes[Math.floor(Math.random() * sportsQuotes.length)];
    setCurrentQuote(randomQuote);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated]);

  const validateForm = () => {
    const newErrors = { name: '', email: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!name) { newErrors.name = 'El nombre es requerido'; isValid = false; }
    else if (name.length < 2) { newErrors.name = 'El nombre debe tener al menos 2 caracteres'; isValid = false; }

    if (!email) { newErrors.email = 'El email es requerido'; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { newErrors.email = 'Email inválido'; isValid = false; }

    if (!password) { newErrors.password = 'La contraseña es requerida'; isValid = false; }
    else if (password.length < 6) { newErrors.password = 'La contraseña debe tener al menos 6 caracteres'; isValid = false; }

    if (!confirmPassword) { newErrors.confirmPassword = 'Confirma tu contraseña'; isValid = false; }
    else if (password !== confirmPassword) { newErrors.confirmPassword = 'Las contraseñas no coinciden'; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(email, password, name, selectedRole);
      toast.success('¡Cuenta creada exitosamente! Revisa tu email para confirmar 🎉');
    } catch (error: any) {
      const message = error?.message?.includes('already registered')
        ? 'Este email ya está registrado'
        : 'Error al crear la cuenta';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-netia-blue via-primary to-netia-orange p-4 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-netia-orange rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-netia-blue rounded-full blur-3xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-white p-4 rounded-2xl shadow-2xl">
            <img src="/logo.png" alt="NETIA" className="w-20 h-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-heading font-bold text-white mb-2">Únete a NETIA</h1>
          <p className="text-white/90 text-lg font-medium">Comienza tu viaje deportivo hoy 🚀</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="glass-card p-8 rounded-3xl shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-medium">Nombre completo</Label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-3.5 h-5 w-5 text-white/60" />
                <Input id="name" type="text" placeholder="Tu nombre" value={name}
                  onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: '' }); }}
                  className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all h-12 rounded-xl" />
              </div>
              {errors.name && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-300 text-sm">{errors.name}</motion.p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-white/60" />
                <Input id="email" type="email" placeholder="tu@email.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }}
                  className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all h-12 rounded-xl" />
              </div>
              {errors.email && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-300 text-sm">{errors.email}</motion.p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-white/60" />
                <Input id="password" type="password" placeholder="••••••••" value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
                  className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all h-12 rounded-xl" />
              </div>
              {errors.password && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-300 text-sm">{errors.password}</motion.p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white font-medium">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-white/60" />
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: '' }); }}
                  className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all h-12 rounded-xl" />
              </div>
              {errors.confirmPassword && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-300 text-sm">{errors.confirmPassword}</motion.p>}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-terms"
                  checked={acceptedTerms}
                  onCheckedChange={v => setAcceptedTerms(v === true)}
                  className="mt-0.5 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                />
                <label htmlFor="accept-terms" className="text-sm text-white/90 leading-relaxed cursor-pointer">
                  Acepto los{' '}
                  <a href="/TERMINOS_Y_CONDICIONES.pdf" target="_blank" rel="noopener noreferrer" download className="underline font-semibold text-white hover:text-white/80">
                    Términos y Condiciones
                  </a>
                </label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept-privacy"
                  checked={acceptedPrivacy}
                  onCheckedChange={v => setAcceptedPrivacy(v === true)}
                  className="mt-0.5 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                />
                <label htmlFor="accept-privacy" className="text-sm text-white/90 leading-relaxed cursor-pointer">
                  Acepto la{' '}
                  <a href="/Politica_de_Privacidad_NETIA.pdf" target="_blank" rel="noopener noreferrer" download className="underline font-semibold text-white hover:text-white/80">
                    Política de Privacidad
                  </a>
                </label>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={isLoading || !acceptedTerms || !acceptedPrivacy}
                className="w-full bg-white text-netia-blue hover:bg-white/90 font-semibold h-12 rounded-xl text-base shadow-lg transition-all">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-netia-blue border-t-transparent rounded-full animate-spin" />
                    Creando cuenta...
                  </div>
                ) : 'Crear cuenta'}
              </Button>
            </motion.div>


            <p className="text-center text-sm text-white/80">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-white font-semibold hover:underline transition-all">Inicia sesión</Link>
            </p>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }} className="mt-8 text-center">
          <p className="text-white/80 text-sm italic max-w-md mx-auto px-4">"{currentQuote}"</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
