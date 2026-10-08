import tino from '@/assets/tino-team.webp';
import zahia from '@/assets/zahia-team.webp';
import roma from '@/assets/roma-team.webp';
import { AIMark } from '@/components/ai';
import { ExampleChat } from '../ExampleChat';
import { Reveal } from './Reveal';

const avatars = [
  { name: 'Tino', role: 'Coach técnico', img: tino, bg: 'bg-[#EBF4FF]', chip: 'bg-blue-50 text-primary', text: 'Rutinas, hábitos y motivación para entrenar mejor.' },
  { name: 'Zahia', role: 'Nutricionista', img: zahia, bg: 'bg-[#E8FBF5]', chip: 'bg-emerald-50 text-emerald-600', text: 'Hidratación, alimentación y descanso, explicados simple.' },
  { name: 'Roma', role: 'Psicóloga deportiva', img: roma, bg: 'bg-[#F3EFFE]', chip: 'bg-purple-50 text-[#7A5AF5]', text: 'Confianza, manejo de la presión y constancia.' },
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
              <article className={`flex h-full flex-col items-center rounded-2xl p-6 ${a.bg}`}>
                <img src={a.img} alt={`${a.name}, ${a.role}`} width={224} height={224} loading="lazy" className="h-48 w-48 object-contain drop-shadow-md sm:h-56 sm:w-56" />
                <div className="mt-4 w-full text-left">
                  <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${a.chip}`}>{a.role}</span>
                  <h3 className="mt-1 font-heading text-xl font-bold text-foreground">{a.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{a.text}</p>
                </div>
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
