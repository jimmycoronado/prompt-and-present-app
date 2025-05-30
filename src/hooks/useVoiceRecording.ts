
import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../utils/transcriptionApi';

interface UseVoiceRecordingProps {
  onTranscription: (text: string) => void;
  onError?: (error: string) => void;
}

export const useVoiceRecording = ({ onTranscription, onError }: UseVoiceRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      chunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  }, [onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      console.log('Processing audio blob:', audioBlob.size, 'bytes');
      
      // Use the transcription utility
      const transcribedText = await transcribeAudio(audioBlob);
      
      if (transcribedText && transcribedText.trim()) {
        console.log('Transcription successful:', transcribedText);
        onTranscription(transcribedText.trim());
      } else {
        onError?.('No se pudo transcribir el audio. Intenta hablar más claro.');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      onError?.('Error al procesar el audio. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    toggleRecording,
    startRecording,
    stopRecording
  };
};
