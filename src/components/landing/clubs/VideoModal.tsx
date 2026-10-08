import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { INSTITUTIONAL_VIDEO } from '@/config/media';

/** El <video> se monta solo al abrir: no descarga nada hasta que se pide. Sin autoplay con sonido. */
const VideoModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl p-2 sm:p-4">
      <DialogTitle className="sr-only">Video institucional de NETIA</DialogTitle>
      {open && INSTITUTIONAL_VIDEO.src && (
        <video controls preload="none" poster={INSTITUTIONAL_VIDEO.poster} className="w-full rounded-lg" playsInline>
          <source src={INSTITUTIONAL_VIDEO.src} type="video/mp4" />
          <track kind="subtitles" srcLang="es-AR" label="Español" src={INSTITUTIONAL_VIDEO.captions} default />
        </video>
      )}
    </DialogContent>
  </Dialog>
);
export default VideoModal;
