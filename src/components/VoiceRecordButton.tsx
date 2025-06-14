
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useVoiceRecording } from "../hooks/useVoiceRecording";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "../hooks/use-mobile";

interface VoiceRecordButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecordButton: React.FC<VoiceRecordButtonProps> = ({
  onTranscription,
  disabled = false
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { isRecording, isProcessing, toggleRecording } = useVoiceRecording({
    onTranscription,
    onError: (error) => {
      console.error('Voice recording error:', error);
      toast({
        title: "Error de grabación",
        description: error,
        variant: "destructive"
      });
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    
    // Blur the button to remove focus state on mobile
    if (isMobile && e.currentTarget instanceof HTMLElement) {
      e.currentTarget.blur();
      // Force remove any lingering focus states
      setTimeout(() => {
        if (e.currentTarget instanceof HTMLElement) {
          e.currentTarget.blur();
        }
      }, 100);
    }
    
    console.log('Voice button clicked');
    toggleRecording();
  };

  const getButtonVariant = () => {
    if (isRecording) return "destructive";
    return "outline";
  };

  const getButtonIcon = () => {
    if (isProcessing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (isRecording) {
      return <MicOff className="h-4 w-4" />;
    }
    return <Mic className="h-4 w-4" />;
  };

  const getAriaLabel = () => {
    if (isProcessing) return "Procesando audio";
    if (isRecording) return "Detener grabación";
    return "Iniciar grabación de voz";
  };

  // Mobile styling with circular design
  if (isMobile) {
    return (
      <Button
        type="button"
        variant={getButtonVariant()}
        size="icon"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`h-8 w-8 transition-all rounded-full touch-manipulation active:scale-95 focus:outline-none focus:ring-0 ${
          isRecording 
            ? 'animate-pulse border border-red-300 dark:border-red-600 bg-red-500 text-white hover:bg-red-600' 
            : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 hover:text-orange-500 hover:bg-gray-50 dark:hover:text-orange-500 dark:hover:bg-gray-700'
        }`}
        style={{
          // Prevent hover states from sticking on mobile
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        aria-label={getAriaLabel()}
        title={getAriaLabel()}
      >
        {getButtonIcon()}
      </Button>
    );
  }

  // Desktop styling - matching other buttons style
  return (
    <Button
      type="button"
      variant={getButtonVariant()}
      size="icon"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`h-11 w-11 transition-all hover:scale-105 ${
        isRecording 
          ? 'animate-pulse bg-red-500 text-white hover:bg-red-600' 
          : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 hover:text-orange-500 hover:bg-gray-50 dark:hover:text-orange-500 dark:hover:bg-gray-700'
      }`}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
    >
      {getButtonIcon()}
    </Button>
  );
};
