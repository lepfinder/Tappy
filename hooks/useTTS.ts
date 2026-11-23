import { useCallback, useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

interface AudioManifest {
    zh: Record<string, string>;
    en: Record<string, string>;
    phrases: Record<string, string>;
}

export const useTTS = () => {
    const { ttsEnabled } = useGameStore();
    const [manifest, setManifest] = useState<AudioManifest | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Load audio manifest on mount
    useEffect(() => {
        fetch('/audio/manifest.json')
            .then(res => {
                if (!res.ok) throw new Error('Manifest not found');
                return res.json();
            })
            .then(data => {
                setManifest(data);
                console.log('✅ Audio manifest loaded');
            })
            .catch(() => {
                console.log('ℹ️ Audio manifest not found');
            });
    }, []);

    // Cancel current audio
    const cancelAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    // Play a single character audio
    const speak = useCallback((text: string, lang: 'zh-CN' | 'en-US' = 'zh-CN', interrupt = true) => {
        if (!ttsEnabled) return;

        if (interrupt) {
            cancelAudio();
        }

        const langKey = lang === 'zh-CN' ? 'zh' : 'en';
        const audioFile = manifest?.[langKey]?.[text] || manifest?.[langKey]?.[text.toLowerCase()];

        if (audioFile) {
            const audio = new Audio(`/audio/${langKey}/${audioFile}`);
            audioRef.current = audio;
            audio.play().catch(err => {
                console.warn('Audio play failed:', err);
            });
        }
        // No fallback - if no audio file, do nothing
    }, [ttsEnabled, manifest, cancelAudio]);

    // Play a phrase/sentence audio
    const speakPhrase = useCallback((text: string, interrupt = true) => {
        if (!ttsEnabled) return;

        if (interrupt) {
            cancelAudio();
        }

        const audioFile = manifest?.phrases?.[text];

        if (audioFile) {
            const audio = new Audio(`/audio/phrases/${audioFile}`);
            audioRef.current = audio;
            audio.play().catch(err => {
                console.warn('Phrase audio play failed:', err);
            });
        }
        // No fallback - if no audio file, do nothing
    }, [ttsEnabled, manifest, cancelAudio]);

    return { speak, speakPhrase };
};



