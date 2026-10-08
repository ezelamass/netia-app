import tino from '@/assets/tino-avatar.avif';
import zahia from '@/assets/zahia-avatar.avif';
import roma from '@/assets/roma-avatar.avif';
import { Reveal } from './Reveal';

const avatars = [
  { name: 'TINO', role: 'Entrenamiento', img: tino, text: 'Rutinas, hábitos y motivación para entrenar mejor.' },
  { name: 'ZAHIA', role: 'Nutrición y bienestar', img: zahia, text: 'Hidratación, alimentación y descanso, explicados simple.' },
  { name: 'ROMA', role: 'Foco mental', img: roma, text: 'Confianza, manejo de la presión y constancia.' },
];

const AiSection = () => (
  <section className="bg-[#0B1B3A] py-16 text-white lg:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-wide text-secondary">El diferencial</p>
        <h2 className="mt-2 max-w-3xl font-heading text-3xl font-bold lg:text-4xl">Un club que se siente grande: un asistente que acompaña a cada deportista</h2>
        <p className="mt-4 max-w-2xl text-white/75">Además de administrar, tus deportistas cuentan con asistentes de IA y tus entrenadores con un semáforo que cruza carga, dolor y sueño para cuidar al plantel.</p>
      </Reveal>
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {avatars.map((a, i) => (
          <li key={a.name}>
            <Reveal delay={i * 0.08} className="h-full">
              <article className="flex h-full flex-col items-center rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                <img src={a.img} alt={`Avatar ${a.name}`} width={112} height={112} loading="lazy" className="h-28 w-28 rounded-full object-cover" />
                <h3 className="mt-4 font-heading text-xl font-bold">{a.name}</h3>
                <p className="text-sm text-secondary">{a.role}</p>
                <p className="mt-2 text-white/75">{a.text}</p>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-white/60">Los asistentes no reemplazan a un médico ni a un profesional: orientan y derivan a un adulto cuando hace falta.</p>
    </div>
  </section>
);
export default AiSection;
