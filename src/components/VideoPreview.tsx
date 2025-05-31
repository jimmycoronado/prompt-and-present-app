
import { useState } from 'react';
import { Play, X, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { VideoPreview as VideoPreviewType } from '../types/chat';

interface VideoPreviewProps {
  video: VideoPreviewType;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ video }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(video.url, '_blank');
  };

  const getEmbedUrl = (url: string, platform: string) => {
    if (platform === 'youtube') {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      return videoId ? `https://www.youtube.com/embed/${videoId[1]}?autoplay=1` : url;
    }
    if (platform === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(\d+)/);
      return videoId ? `https://player.vimeo.com/video/${videoId[1]}?autoplay=1` : url;
    }
    return url;
  };

  return (
    <div className="mt-4">
      {/* Vista previa pequeña */}
      <div className="max-w-sm">
        <div className="relative group rounded-lg overflow-hidden border border-white/20 bg-black/10 hover:bg-black/20 transition-all cursor-pointer">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-800">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback si la imagen no carga
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.style.backgroundColor = '#374151';
                target.parentElement!.innerHTML = `
                  <div class="flex items-center justify-center h-full text-white">
                    <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                    </svg>
                  </div>
                `;
              }}
            />
            
            {/* Overlay con botón de play */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-all">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayClick}
                className="h-12 w-12 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm"
                aria-label="Reproducir video"
                title="Reproducir video"
              >
                <Play className="h-6 w-6 ml-1" fill="currentColor" />
              </Button>
            </div>

            {/* Duración */}
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                {video.duration}
              </div>
            )}

            {/* Plataforma */}
            <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded capitalize backdrop-blur-sm">
              {video.platform}
            </div>
          </div>

          {/* Información del video */}
          <div className="p-3 bg-white/5 backdrop-blur-sm">
            <h4 className="text-white text-sm font-medium line-clamp-2 leading-tight mb-2">
              {video.title}
            </h4>
            
            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayClick}
                className="text-white/90 hover:text-white hover:bg-white/10 h-8 px-3 text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                Ver
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenExternal}
                className="text-white/90 hover:text-white hover:bg-white/10 h-8 px-3 text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal expandido */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-left">{video.title}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 px-4 pb-4">
            <div className="relative aspect-video w-full h-full rounded-lg overflow-hidden bg-black">
              {video.platform === 'youtube' || video.platform === 'vimeo' ? (
                <iframe
                  src={getEmbedUrl(video.url, video.platform)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                />
              ) : (
                <video
                  src={video.url}
                  controls
                  autoPlay
                  className="w-full h-full"
                  title={video.title}
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              )}
            </div>
          </div>

          {/* Botón para cerrar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
            aria-label="Cerrar video"
            title="Cerrar video"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
