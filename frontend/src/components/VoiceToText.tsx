import {
  useEffect,
  useRef,
  useState,
} from "react";

interface VoiceToTextProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror:
    | ((event: SpeechRecognitionErrorEventLike) => void)
    | null;
  onresult:
    | ((event: SpeechRecognitionEventLike) => void)
    | null;
}

type SpeechRecognitionConstructor =
  new () => SpeechRecognitionLike;

interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export default function VoiceToText({
  value = "",
  onChange,
  disabled = false,
  placeholder = "Click the microphone and start speaking...",
}: VoiceToTextProps) {
  const recognitionRef =
    useRef<SpeechRecognitionLike | null>(null);

  const baseTextRef = useRef("");

  const onChangeRef =
    useRef(onChange);

  const [isSupported, setIsSupported] =
    useState(true);

  const [isListening, setIsListening] =
    useState(false);

  const [interimText, setInterimText] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    baseTextRef.current = value;
  }, [value]);

  useEffect(() => {
    const speechWindow =
      window as SpeechWindow;

    const Recognition =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new Recognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (
      event: SpeechRecognitionEventLike,
    ) => {
      let finalText = "";
      let temporaryText = "";

      /*
       * IMPORTANT:
       *
       * SpeechRecognition keeps previous results inside
       * event.results. Only process results starting from
       * event.resultIndex.
       *
       * Processing the entire event.results array causes
       * previously finalized sentences to be appended again.
       */
      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const result = event.results[i];

        const transcript =
          result[0]?.transcript || "";

        if (result.isFinal) {
          finalText += transcript;
        } else {
          temporaryText += transcript;
        }
      }

      setInterimText(
        temporaryText.trim(),
      );

      if (finalText.trim()) {
        const currentBase =
          baseTextRef.current.trim();

        const newFinalText =
          finalText.trim();

        const combinedText =
          currentBase
            ? `${currentBase} ${newFinalText}`
            : newFinalText;

        /*
         * Update the ref immediately so the next
         * recognition event starts from the already
         * committed text.
         */
        baseTextRef.current =
          combinedText;

        onChangeRef.current(
          combinedText,
        );
      }
    };

    recognition.onerror = (
      event: SpeechRecognitionErrorEventLike,
    ) => {
      if (event.error === "not-allowed") {
        setError(
          "Microphone permission was denied. Please allow microphone access in your browser.",
        );
      } else if (event.error === "no-speech") {
        setError(
          "No speech was detected. Please try speaking again.",
        );
      } else if (event.error === "audio-capture") {
        setError(
          "No microphone was detected.",
        );
      } else if (event.error === "aborted") {
        /*
         * abort() is intentionally used during cleanup.
         * Do not show an error for an intentional abort.
         */
        return;
      } else {
        setError(
          `Speech recognition error: ${event.error}`,
        );
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognitionRef.current =
      recognition;

    return () => {
      recognition.abort();
      recognitionRef.current =
        null;
    };
  }, []);

  function startListening() {
    if (
      disabled ||
      !isSupported ||
      isListening
    ) {
      return;
    }

    const recognition =
      recognitionRef.current;

    if (!recognition) {
      return;
    }

    setError("");
    setInterimText("");

    /*
     * Capture the current textarea value as the
     * starting point for this listening session.
     */
    baseTextRef.current = value;

    try {
      recognition.start();
    } catch (err) {
      console.error(
        "Unable to start speech recognition:",
        err,
      );

      setError(
        "Unable to start speech recognition. Please try again.",
      );
    }
  }

  function stopListening() {
    const recognition =
      recognitionRef.current;

    if (!recognition) {
      return;
    }

    try {
      recognition.stop();
    } catch (err) {
      console.error(
        "Unable to stop speech recognition:",
        err,
      );
    }

    setIsListening(false);
    setInterimText("");
  }

  function toggleListening() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  function clearText() {
    stopListening();

    setInterimText("");
    setError("");

    baseTextRef.current = "";

    onChangeRef.current("");
  }

  if (!isSupported) {
    return (
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "14px",
          background: "#f8fafc",
        }}
      >
        <strong>
          Voice-to-text is not supported
        </strong>

        <p
          style={{
            margin: "6px 0 0",
            color: "#64748b",
          }}
        >
          Your current browser does not
          support the Web Speech API.
          Try a supported browser such
          as Chrome or Edge.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <textarea
        value={
          value +
          (interimText
            ? `${value ? " " : ""}${interimText}`
            : "")
        }
        onChange={(event) => {
          const newValue =
            event.target.value;

          baseTextRef.current =
            newValue;

          onChangeRef.current(
            newValue,
          );
        }}
        disabled={
          disabled ||
          isListening
        }
        placeholder={placeholder}
        rows={5}
        style={{
          width: "100%",
          boxSizing: "border-box",
          resize: "vertical",
          padding: "12px",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          fontFamily: "inherit",
          fontSize: "14px",
        }}
      />

      {interimText && (
        <div
          style={{
            padding: "8px 10px",
            borderRadius: "6px",
            background: "#eff6ff",
            color: "#1d4ed8",
            fontSize: "13px",
          }}
        >
          Listening:{" "}
          {interimText}
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            padding: "8px 10px",
            borderRadius: "6px",
            background: "#fef2f2",
            color: "#b91c1c",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className={
            isListening
              ? "btn btn-secondary"
              : "btn btn-primary"
          }
          disabled={disabled}
          onClick={toggleListening}
        >
          {isListening
            ? "⏹ Stop Listening"
            : "🎙 Start Voice Input"}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          disabled={
            disabled ||
            (!value &&
              !interimText)
          }
          onClick={clearText}
        >
          Clear
        </button>
      </div>

      <small
        style={{
          color: "#64748b",
        }}
      >
        Speak naturally after starting
        voice input. Your browser will
        convert your speech into text.
      </small>
    </div>
  );
}