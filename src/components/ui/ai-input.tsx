"use client";

import { CornerRightUp, Mic, SendHorizontal } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { supabase } from "@/integrations/supabase/client";

interface AIInputProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  /** Devolver `false` conserva el texto escrito (por ejemplo si todavía no se puede enviar). */
  onSubmit?: (value: string) => void | boolean;
  /** Modo controlado (borradores por agente, texto precargado). Sin `value` se comporta como antes. */
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  /** `chat`: píldora + un solo botón circular (micrófono si está vacío, enviar si hay texto), como WhatsApp. */
  variant?: "default" | "chat";
}

export function AIInput({
  id = "ai-input",
  placeholder = "Type your message...",
  minHeight = 52,
  maxHeight = 200,
  onSubmit,
  value,
  onValueChange,
  disabled,
  className,
  variant = "default",
}: AIInputProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });
  const [innerValue, setInnerValue] = useState("");
  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : innerValue;
  const setInputValue = (next: string) => {
    if (!isControlled) setInnerValue(next);
    onValueChange?.(next);
  };
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Ajusta el alto cuando el texto cambia desde afuera (cambio de agente, precarga, transcripción).
  useEffect(() => { adjustHeight(); }, [inputValue, adjustHeight]);

  const handleReset = () => {
    if (!inputValue.trim() || disabled) return;
    if (onSubmit?.(inputValue) === false) return;
    setInputValue("");
    adjustHeight(true);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      console.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'audio.webm');

      const { data, error } = await supabase.functions.invoke('whisper-transcribe', {
        body: formData,
      });

      if (error) throw error;
      if (data?.text) {
        setInputValue(inputValue ? `${inputValue} ${data.text}` : data.text);
      }
    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Recording duration timer
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
      return;
    }
    const interval = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const isBusy = disabled || isTranscribing;

  if (variant === "chat") {
    const hasText = !!inputValue.trim();
    const iconBase = "absolute h-5 w-5 transition-[opacity,transform] duration-fast";
    return (
      <div className={cn("w-full", className)}>
        {(isRecording || isTranscribing) && (
          <div className="mb-1 flex items-center gap-2 px-3 py-1 text-xs font-medium text-muted-foreground" role="status">
            <span className={cn("h-2 w-2 shrink-0 rounded-full animate-pulse", isRecording ? "bg-destructive" : "bg-primary")} />
            {isRecording ? `Grabando ${formatDuration(recordingSeconds)}` : "Transcribiendo audio..."}
          </div>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            id={id}
            placeholder={isTranscribing ? "Transcribiendo..." : placeholder}
            className={cn(
              "min-h-0 flex-1 resize-none overflow-hidden rounded-3xl border-0 bg-card px-4 py-3 text-sm text-foreground shadow-bubble",
              "placeholder:text-muted-foreground",
              "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            value={inputValue}
            disabled={isBusy}
            onChange={(e) => { setInputValue(e.target.value); adjustHeight(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReset(); }
            }}
          />
          <button
            type="button"
            onClick={hasText ? handleReset : toggleRecording}
            disabled={hasText ? isBusy : disabled}
            aria-label={hasText ? "Enviar mensaje" : isRecording ? "Detener grabación" : "Grabar mensaje de voz"}
            className={cn(
              "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-bubble",
              "transition-[background-color,transform] duration-fast active:scale-[.94]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:opacity-50",
              isRecording && !hasText ? "bg-destructive animate-pulse" : "bg-primary",
            )}
          >
            <Mic className={cn(iconBase, hasText ? "scale-50 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100")} aria-hidden="true" />
            <SendHorizontal className={cn(iconBase, hasText ? "scale-100 rotate-0 opacity-100" : "scale-50 rotate-90 opacity-0")} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Recording / transcribing status bar */}
      {(isRecording || isTranscribing) && (
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 mb-1 rounded-lg text-xs font-medium",
          isRecording ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        )}>
          <span className={cn(
            "h-2 w-2 rounded-full shrink-0",
            isRecording ? "bg-destructive animate-pulse" : "bg-primary animate-pulse"
          )} />
          {isRecording && <span>Grabando {formatDuration(recordingSeconds)}</span>}
          {isTranscribing && <span>Transcribiendo audio...</span>}
        </div>
      )}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          id={id}
          placeholder={isTranscribing ? "Transcribiendo..." : placeholder}
          className={cn(
            "w-full rounded-xl border border-border/60 bg-muted/50 px-4 py-3 pr-20 text-sm text-foreground",
            "min-h-0 resize-none overflow-hidden",
            "placeholder:text-muted-foreground",
            "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary focus-visible:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          value={inputValue}
          disabled={isBusy}
          onChange={(e) => {
            setInputValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleReset();
            }
          }}
        />

        {/* Mic button */}
        <button
          onClick={toggleRecording}
          type="button"
          disabled={disabled}
          aria-label={isRecording ? "Detener grabación" : "Grabar mensaje de voz"}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-xl py-1 px-1 transition-all duration-200",
            inputValue.trim() ? "right-10" : "right-3",
            isRecording
              ? "bg-destructive/15 animate-pulse"
              : "bg-black/5 dark:bg-white/5"
          )}
        >
          <Mic
            className={cn(
              "w-4 h-4 transition-colors",
              isRecording
                ? "text-destructive"
                : "text-black/70 dark:text-white/70"
            )}
          />
        </button>

        {/* Send button */}
        <button
          onClick={handleReset}
          type="button"
          disabled={isBusy}
          aria-label="Enviar mensaje"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 right-3",
            "rounded-xl bg-primary text-primary-foreground py-1 px-1",
            "transition-all duration-200",
            inputValue.trim()
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          )}
        >
          <CornerRightUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
