import { useState, useRef } from 'react';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AGENTS } from '@/lib/avatars';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageCropper } from './ImageCropper';
import { toast } from 'sonner';

interface ProfileAvatarProps {
  avatarUrl?: string;
  fullName: string;
  preferredAvatar: 'TINO' | 'ZAHIA' | 'ROMA';
  isEditing?: boolean;
  onAvatarChange?: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

// Imágenes por agente
const AVATAR_IMAGES = {
  TINO: AGENTS.TINO.image,
  ZAHIA: AGENTS.ZAHIA.image,
  ROMA: AGENTS.ROMA.image,
};

const AVATAR_OPTIONS = [
  { id: 'TINO', name: 'TINO', image: AGENTS.TINO.image },
  { id: 'ZAHIA', name: 'ZAHIA', image: AGENTS.ZAHIA.image },
  { id: 'ROMA', name: 'ROMA', image: AGENTS.ROMA.image },
];

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-28 h-28',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ProfileAvatar = ({
  avatarUrl,
  fullName,
  preferredAvatar,
  isEditing = false,
  onAvatarChange,
  size = 'lg',
}: ProfileAvatarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('avatars');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const defaultAvatarImage = AVATAR_IMAGES[preferredAvatar];
  
  // Check if current avatar is a custom photo (base64 or external URL)
  const isCustomPhoto = avatarUrl && !Object.values(AVATAR_IMAGES).includes(avatarUrl);

  const handleSelectAvatar = (avatarId: string) => {
    const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
    if (avatar && onAvatarChange) {
      onAvatarChange(avatar.image);
    }
    setIsOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('La imagen es muy grande. Máximo 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor seleccioná una imagen válida.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    if (onAvatarChange) {
      onAvatarChange(croppedImageUrl);
    }
    setSelectedImage(null);
    setIsOpen(false);
    toast.success('Foto de perfil actualizada');
  };

  const handleCropCancel = () => {
    setSelectedImage(null);
  };

  const handleRemovePhoto = () => {
    if (onAvatarChange) {
      onAvatarChange('');
    }
    setIsOpen(false);
    toast.success('Foto eliminada');
  };

  const avatarContent = (
    <div
      className={cn(
        "relative rounded-full overflow-hidden border-4 border-background shadow-lg",
        sizeClasses[size],
        isEditing && "cursor-pointer group"
      )}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={fullName}
          className="w-full h-full object-cover"
        />
      ) : defaultAvatarImage ? (
        <img
          src={defaultAvatarImage}
          alt={preferredAvatar}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <span className="text-white font-bold text-lg">{initials}</span>
        </div>
      )}

      {/* Edit overlay */}
      {isEditing && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );

  if (!isEditing) {
    return avatarContent;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setSelectedImage(null);
        setActiveTab('avatars');
      }
    }}>
      <DialogTrigger asChild>
        {avatarContent}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedImage ? 'Ajustá tu foto' : 'Elegí tu avatar'}
          </DialogTitle>
        </DialogHeader>
        
        {selectedImage ? (
          <ImageCropper
            imageSrc={selectedImage}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="avatars">Avatares</TabsTrigger>
              <TabsTrigger value="photo">Subir foto</TabsTrigger>
            </TabsList>
            
            <TabsContent value="avatars" className="mt-4">
              <div className="grid grid-cols-3 gap-4">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectAvatar(avatar.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl",
                      "border-2 transition-all",
                      "hover:border-primary hover:bg-primary/5",
                      preferredAvatar === avatar.id && !isCustomPhoto
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">{avatar.name}</span>
                  </button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="photo" className="mt-4">
              <div className="flex flex-col items-center gap-4 py-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-xs gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Seleccionar imagen
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  Formatos: JPG, PNG, GIF. Máximo 5MB.
                </p>
                
                {isCustomPhoto && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="gap-2 mt-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar foto actual
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
