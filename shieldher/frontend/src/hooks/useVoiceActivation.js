import { useState, useEffect, useCallback } from 'react';

export const useVoiceActivation = (onTrigger, onTranscript) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!supported) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcript = result[0].transcript;
      
      // Pass final transcript for SMS sending
      if (result.isFinal && onTranscript) {
        onTranscript(transcript);
      }

      const lowerTranscript = transcript.toLowerCase();
      if (lowerTranscript.includes('help') || lowerTranscript.includes('shield her')) {
        console.log("VOICE TRIGGER DETECTED!");
        onTrigger();
        // Removed recognition.stop() so it keeps listening and sending transcripts
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // Auto restart if still supposed to be listening
      if (isListening) {
        try {
          recognition.start();
        } catch(e) {}
      }
    };

    try {
      recognition.start();
    } catch(e) {
      console.error(e);
    }

  }, [isListening, supported, onTrigger, onTranscript]);

  return { isListening, toggleListening, supported };
};
