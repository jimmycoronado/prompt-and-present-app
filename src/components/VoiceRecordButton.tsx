
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useVoiceRecording } from "../hooks/useVoiceRecording";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecordButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecordButton: React.FC<VoiceRecordButtonProps> = ({
  onTranscription,
  disabled = false
}) => {
  const { toast } = useToast();

  const { isRecording, isProcessing, toggleRecording } = useVoiceRecording({
    onTranscription,
    onError: (error) => {
      toast({
        title: "Error de grabación",
        description: error,
        variant: "destructive"
      });
    }
  });

  const handleClick = () => {
    if (disabled) return;
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

  return (
    <Button
      type="button"
      variant={getButtonVariant()}
      size="icon"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`h-11 w-11 transition-all hover:scale-105 ${
        isRecording ? 'animate-pulse' : ''
      }`}
      aria-label={getAriaLabel()}
      title={getAriaLabel()}
    >
      {getButtonIcon()}
    </Button>
  );
};
