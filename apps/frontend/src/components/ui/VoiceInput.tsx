import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    isListening?: boolean;
    onToggle?: (listening: boolean) => void;
    className?: string;
    placeholder?: string;
}

export const VoiceInput = ({ onTranscript, isListening: externalIsListening, onToggle, className = '' }: VoiceInputProps) => {
    const [isListening, setIsListening] = useState(false);
    const isSupported = (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window));

    type MinimalEvent = {
        resultIndex: number;
        results: Array<{ isFinal: boolean; 0: { transcript: string } }>;
    };

    type MinimalRecognition = {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        start: () => void;
        stop: () => void;
        onresult: ((e: MinimalEvent) => void) | null;
        onerror: ((e: unknown) => void) | null;
        onend: (() => void) | null;
    };

    const recognitionRef = useRef<MinimalRecognition | null>(null);

    const startListening = useCallback(() => {
        if (!recognitionRef.current || !isSupported) return;
        try {
            recognitionRef.current.start();
            setIsListening(true);
            onToggle?.(true);
        } catch (e) {
            console.error(e);
        }
    }, [isSupported, onToggle]);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
        setIsListening(false);
        onToggle?.(false);
    }, [onToggle]);

    const toggleListening = useCallback(() => {
        if (isListening) stopListening();
        else startListening();
    }, [isListening, startListening, stopListening]);

    useEffect(() => {
        // If not supported, nothing to do
        if (!isSupported) return;

        type WindowWithSpeech = { SpeechRecognition?: { new(): unknown }, webkitSpeechRecognition?: { new(): unknown } };
        const w = window as unknown as WindowWithSpeech;
        const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new (SpeechRecognition as { new(): unknown })() as unknown as MinimalRecognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Could be made dynamic


        recognition.onresult = (event: MinimalEvent) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) onTranscript(finalTranscript);
        };

        recognition.onerror = (event: unknown) => {
            console.error('Speech recognition error', event);
            // We cannot reliably inspect unknowns here; if permission denied, inform user
            try {
                const e = event as { error?: string };
                if (e.error === 'not-allowed') {
                    alert('Microphone access denied. Please allow microphone access to use voice input.');
                }
            } catch {
                // ignore
            }
            stopListening();
        };

        recognition.onend = () => {
            // always sync state to stopped when recognition ends
            setIsListening(false);
            onToggle?.(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [stopListening, isSupported, onTranscript, onToggle]);

    // Sync with external state if provided
    useEffect(() => {
        if (typeof externalIsListening !== 'undefined' && externalIsListening !== isListening) {
            // schedule to avoid calling setState synchronously inside effect
            if (externalIsListening) setTimeout(startListening, 0);
            else setTimeout(stopListening, 0);
        }
    }, [externalIsListening, isListening, startListening, stopListening]);

    // functions defined above with stable identities via useCallback

    if (!isSupported) {
        return null; // Or render a disabled icon with tooltip
    }

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-full transition-all duration-300 ${isListening
                    ? 'bg-red-100 text-red-600 ring-4 ring-red-50 animate-pulse'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                } ${className}`}
            title={isListening ? "Stop recording" : "Start voice input"}
        >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
    );
};
