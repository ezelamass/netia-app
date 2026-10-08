import { useState } from 'react';
import { Play } from 'lucide-react';
import { INSTITUTIONAL_VIDEO } from '@/config/media';

/** Muestra el póster y solo descarga el video cuando la persona toca play. Sin autoplay con sonido. */
const HeroVideo = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted shadow-pop">
      {playing ? (
        <video
          className="h-full w-full bg-black object-cover"
          controls
          autoPlay
          playsInline
          preload="auto"
          poster={INSTITUTIONAL_VIDEO.poster}
          aria-label="Video institucional de NETIA"
        >
          <source src={INSTITUTIONAL_VIDEO.src} type="video/mp4" />
          <track kind="subtitles" srcLang="es-AR" label="Español" src={INSTITUTIONAL_VIDEO.captions} default />
        </video>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex h-full w-full items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Ver el video de NETIA (1:20)"
        >
          <img
            src={INSTITUTIONAL_VIDEO.poster}
            alt="Panel de gestión de NETIA"
            width={1280}
            height={720}
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <span className="absolute inset-0 bg-foreground/10 transition-colors group-hover:bg-foreground/20" aria-hidden="true" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-pop transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
            <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" aria-hidden="true" />
          </span>
          <span className="absolute bottom-3 right-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-medium text-background">1:20</span>
        </button>
      )}
    </div>
  );
};

export default HeroVideo;
