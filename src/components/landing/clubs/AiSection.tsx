import tino from '@/assets/tino-avatar.avif';
import zahia from '@/assets/zahia-avatar.avif';
import roma from '@/assets/roma-avatar.avif';
import { AIMark } from '@/components/ai';
import { ExampleChat } from '../ExampleChat';
import { Reveal } from './Reveal';

const avatars = [
  { name: 'TINO', role: 'Entrenamiento', img: tino, text: 'Rutinas, hábitos y motivación para entrenar mejor.' },
  { name: 'ZAHIA', role: 'Nutrición y bienestar', img: zahia, text: 'Hidratación, alimentación y descanso, explicados simple.' },
  { name: 'ROMA', role: 'Foco mental', img: roma, text: 'Confianza, manejo de la presión y constancia.' },
];

const AiSection = () => (
  <section className="bg-white py-16 lg:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <p className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-primary">
          <AIMark size={16} /> El diferencial
        </p>
        <h2 className="mt-2 max-w-3xl font-heading text-3xl font-bold text-foreground lg:text-4xl">
          Un club que se siente grande: un asistente de <span className="bg-ai bg-clip-text text-transparent">IA</span> que acompaña a cada deportista
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">Además de administrar, tus deportistas cuentan con asistentes de IA y tus entrenadores con un semáforo que cruza carga, dolor y sueño para cuidar al plantel.</p>
      </Reveal>
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {avatars.map((a, i) => (
          <li key={a.name}>
            <Reveal delay={i * 0.08} className="h-full">
              <article className="flex h-full flex-col items-center rounded-2xl bg-card p-6 text-center shadow-card">
                <img src={a.img} alt={`Avatar ${a.name}`} width={112} height={112} loading="lazy" className="h-28 w-28 rounded-full object-cover" />
                <h3 className="mt-4 font-heading text-xl font-bold">{a.name}</h3>
                <p className="text-sm font-medium text-primary">{a.role}</p>
                <p className="mt-2 text-muted-foreground">{a.text}</p>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
      <Reveal className="mt-12">
        <ExampleChat agent="TINO" />
      </Reveal>
      <p className="mt-6 text-sm text-muted-foreground">Los asistentes no reemplazan a un médico ni a un profesional: orientan y derivan a un adulto cuando hace falta.</p>
    </div>
  </section>
);
export default AiSection;
