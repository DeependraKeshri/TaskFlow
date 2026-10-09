import { useEffect, useRef, useState } from "react";

type SpeechRecognitionAlternativeLike = {
  transcript: string;
  confidence: number;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionErrorEventLike = Event & {
  error: string;
  message?: string;
};

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult:
    | ((event: SpeechRecognitionEventLike) => void)
    | null;
  onerror:
    | ((event: SpeechRecognitionErrorEventLike) => void)
    | null;
}

type SpeechRecognitionConstructor =
  new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

interface VoiceInputProps {
  disabled?: boolean;
  onTranscript: (text: string) => void;
}

export default function VoiceInput({
  disabled = false,
  onTranscript,
}: VoiceInputProps) {
  const recognitionRef =
    useRef<SpeechRecognitionLike | null>(null);

  const finalTranscriptRef =
    useRef("");

  const [supported, setSupported] =
    useState(true);

  const [listening, setListening] =
    useState(false);

  const [interimTranscript, setInterimTranscript] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    const speechWindow =
      window as SpeechRecognitionWindow;

    const Recognition =
      speechWindow.SpeechRecognition ??
      speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setSupported(false);
      return;
    }

    const recognition =
      new Recognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      let interim = "";
      let finalText =
        finalTranscriptRef.current;

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result =
          event.results[index];

        const transcript =
          result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalText +=
            `${transcript.trim()} `;
        } else {
          interim += transcript;
        }
      }

      finalTranscriptRef.current =
        finalText;

      setInterimTranscript(
        interim.trim()
      );
    };

    recognition.onerror = (event) => {
      if (
        event.error ===
          "not-allowed" ||
        event.error ===
          "service-not-allowed"
      ) {
        setError(
          "Microphone permission was denied. Please allow microphone access and try again."
        );
      } else if (
        event.error === "no-speech"
      ) {
        setError(
          "No speech was detected. Please try speaking again."
        );
      } else {
        setError(
          `Voice input error: ${event.error}.`
        );
      }

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current =
      recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  function startListening() {
    if (
      disabled ||
      !supported ||
      listening
    ) {
      return;
    }

    setError("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";

    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.error(
        "Unable to start voice input:",
        err
      );

      setError(
        "Unable to start voice input. Please try again."
      );
    }
  }

  function stopListening() {
    if (
      !recognitionRef.current ||
      !listening
    ) {
      return;
    }

    recognitionRef.current.stop();

    const transcript =
      finalTranscriptRef.current.trim();

    if (transcript) {
      onTranscript(transcript);
    }

    finalTranscriptRef.current = "";
    setInterimTranscript("");
  }

  if (!supported) {
    return (
      <small
        style={{
          color: "#64748b",
          display: "block",
          marginTop: "6px",
        }}
      >
        Voice input is not supported by
        this browser. Try Google Chrome
        or Microsoft Edge.
      </small>
    );
  }

  return (
    <div
      style={{
        marginTop: "8px",
      }}
    >
      <button
        type="button"
        className="btn btn-secondary"
        onClick={
          listening
            ? stopListening
            : startListening
        }
        disabled={disabled}
        aria-pressed={listening}
      >
        {listening
          ? "⏹ Stop Voice Input"
          : "🎙 Voice Input"}
      </button>

      {listening && (
        <span
          style={{
            marginLeft: "10px",
            color: "#dc2626",
            fontSize: "0.9rem",
          }}
        >
          Listening…{" "}
          {interimTranscript ||
            "Speak now"}
        </span>
      )}

      {error && (
        <small
          role="alert"
          style={{
            display: "block",
            color: "#dc2626",
            marginTop: "6px",
          }}
        >
          {error}
        </small>
      )}
    </div>
  );
}
