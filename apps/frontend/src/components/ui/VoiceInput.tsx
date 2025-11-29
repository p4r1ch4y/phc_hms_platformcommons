import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    isListening?: boolean;
    onToggle?: (listening: boolean) => void;
    className?: string;
    placeholder?: string;
}

// Add type definitions for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export const VoiceInput = ({ onTranscript, isListening: externalIsListening, onToggle, className = '' }: VoiceInputProps) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Could be made dynamic

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                onTranscript(finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'not-allowed') {
                alert('Microphone access denied. Please allow microphone access to use voice input.');
            }
            stopListening();
        };

        recognition.onend = () => {
            // If it stops but we think we are listening, restart (unless explicitly stopped)
            // For now, let's just sync state
            if (isListening) {
                // recognition.start(); // Auto-restart if needed, but can be annoying
                setIsListening(false);
                onToggle?.(false);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Sync with external state if provided
    useEffect(() => {
        if (typeof externalIsListening !== 'undefined' && externalIsListening !== isListening) {
            if (externalIsListening) {
                startListening();
            } else {
                stopListening();
            }
        }
    }, [externalIsListening]);

    const startListening = () => {
        if (!recognitionRef.current || !isSupported) return;
        try {
            recognitionRef.current.start();
            setIsListening(true);
            onToggle?.(true);
        } catch (e) {
            console.error(e);
        }
    };

    const stopListening = () => {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
        setIsListening(false);
        onToggle?.(false);
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

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
