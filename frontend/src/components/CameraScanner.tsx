import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createWorker,
  type Worker,
} from "tesseract.js";

interface CameraScannerProps {
  disabled?: boolean;
  onTextExtracted?: (text: string) => void;
  onImageCaptured?: (
    imageData: string
  ) => void | Promise<void>;
}

export default function CameraScanner({
  disabled = false,
  onTextExtracted,
  onImageCaptured,
}: CameraScannerProps) {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const workerRef =
    useRef<Worker | null>(null);

  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [cameraReady, setCameraReady] =
    useState(false);

  const [capturedImage, setCapturedImage] =
    useState<string | null>(null);

  const [ocrText, setOcrText] =
    useState("");

  const [processing, setProcessing] =
    useState(false);

  const [savingImage, setSavingImage] =
    useState(false);

  const [imageSaved, setImageSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  const [status, setStatus] =
    useState("");

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
    setCameraOpen(false);
  }

  async function startCamera() {
    if (disabled) {
      return;
    }

    try {
      setError("");
      setStatus("Starting camera...");
      setCameraReady(false);

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setError(
          "Camera access is not supported by this browser."
        );
        setStatus("");
        return;
      }

      stopCamera();

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1920,
            },
            height: {
              ideal: 1080,
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      /*
       * Important:
       * The video element is rendered only after
       * cameraOpen becomes true. The effect below
       * attaches the stream after React has rendered it.
       */
      setCameraOpen(true);
    } catch (err) {
      console.error(
        "Unable to start camera:",
        err
      );

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;
      }

      setCameraReady(false);
      setCameraOpen(false);

      setError(
        "Unable to access the camera. Please allow camera permission and try again."
      );

      setStatus("");
    }
  }

  function handleVideoReady() {
    const video =
      videoRef.current;

    if (
      !video ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return;
    }

    setCameraReady(true);
    setError("");
    setStatus(
      "Camera ready. Position the image and capture it."
    );
  }

  function captureImage() {
    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    if (!video || !canvas) {
      setError(
        "Unable to access the camera preview."
      );
      return;
    }

    if (
      !cameraReady ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setError(
        "Camera is still starting. Please wait a moment and try again."
      );
      return;
    }

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      setError(
        "Unable to capture the camera image."
      );
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageData =
      canvas.toDataURL(
        "image/jpeg",
        0.92
      );

    setCapturedImage(imageData);
    setOcrText("");
    setImageSaved(false);
    setError("");
    setStatus(
      "Image captured. You can save it as an attachment or run OCR."
    );

    stopCamera();
  }

  function retakeImage() {
    if (
      savingImage ||
      processing
    ) {
      return;
    }

    setCapturedImage(null);
    setOcrText("");
    setImageSaved(false);
    setError("");
    setStatus("");
    setCameraReady(false);

    startCamera();
  }

  async function saveImageAsAttachment() {
    if (
      !capturedImage ||
      savingImage ||
      processing
    ) {
      return;
    }

    if (!onImageCaptured) {
      setError(
        "Image attachment saving is not configured."
      );
      return;
    }

    try {
      setSavingImage(true);
      setError("");
      setStatus(
        "Saving captured image as an attachment..."
      );

      await onImageCaptured(
        capturedImage
      );

      setImageSaved(true);

      setStatus(
        "Captured image saved as an attachment."
      );
    } catch (err) {
      console.error(
        "Unable to save captured image:",
        err
      );

      setImageSaved(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the captured image as an attachment."
      );

      setStatus("");
    } finally {
      setSavingImage(false);
    }
  }

  async function runOCR() {
    if (
      !capturedImage ||
      processing ||
      savingImage
    ) {
      return;
    }

    try {
      setProcessing(true);
      setError("");
      setStatus(
        "Preparing OCR engine..."
      );

      if (!workerRef.current) {
        const worker =
          await createWorker(
            "eng",
            1,
            {
              logger: (message) => {
                if (
                  message.status ===
                  "recognizing text"
                ) {
                  const progress =
                    Math.round(
                      message.progress *
                        100
                    );

                  setStatus(
                    `Reading text... ${progress}%`
                  );
                }
              },
            }
          );

        workerRef.current =
          worker;
      }

      setStatus(
        "Reading text from image..."
      );

      const result =
        await workerRef.current.recognize(
          capturedImage
        );

      const text =
        result.data.text.trim();

      setOcrText(text);

      if (text) {
        setStatus(
          "Text extracted successfully."
        );

        onTextExtracted?.(text);
      } else {
        setStatus(
          "No readable text was found in the image."
        );
      }
    } catch (err) {
      console.error(
        "OCR failed:",
        err
      );

      setError(
        "Unable to extract text from this image. Please try another image."
      );

      setStatus("");
    } finally {
      setProcessing(false);
    }
  }

  function handleTextChange(
    value: string
  ) {
    setOcrText(value);
    onTextExtracted?.(value);
  }

  /*
   * Attach the MediaStream only after React has
   * rendered the video element.
   */
  useEffect(() => {
    if (!cameraOpen) {
      return;
    }

    const videoElement =
  videoRef.current;

const stream =
  streamRef.current;

if (!videoElement || !stream) {
  setError(
    "Unable to initialize the camera preview."
  );
  setCameraOpen(false);
  return;
}

const video = videoElement;

    let cancelled = false;

    async function attachCamera() {
      try {
        setError("");
        setStatus(
          "Starting camera preview..."
        );

        video.srcObject = stream;

        await video.play();

        if (cancelled) {
          return;
        }

        if (
          video.videoWidth > 0 &&
          video.videoHeight > 0
        ) {
          setCameraReady(true);
          setStatus(
            "Camera ready. Position the image and capture it."
          );
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Unable to initialize camera preview:",
          err
        );

        setCameraReady(false);
        setError(
          "Unable to initialize the camera preview. Please try again."
        );
        setStatus("");
      }
    }

    attachCamera();

    return () => {
      cancelled = true;
    };
  }, [cameraOpen]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;
      }

      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="camera-scanner">
      {error && (
        <div
          className="task-details-error-banner"
          role="alert"
        >
          {error}
        </div>
      )}

      {status && (
        <p className="task-details-empty">
          {status}
        </p>
      )}

      {!cameraOpen &&
        !capturedImage && (
          <div className="camera-scanner-start">
            <p className="task-details-empty">
              Capture a document, note,
              whiteboard, receipt, or other
              image and extract its text
              automatically.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              disabled={disabled}
              onClick={startCamera}
            >
              📷 Open Camera
            </button>
          </div>
        )}

      {cameraOpen && (
        <div className="camera-scanner-camera">
          <video
            ref={videoRef}
            className="camera-scanner-video"
            autoPlay
            playsInline
            muted
            onLoadedMetadata={
              handleVideoReady
            }
            onCanPlay={
              handleVideoReady
            }
          />

          <div className="camera-scanner-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!cameraReady}
              onClick={captureImage}
            >
              📸 Capture
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={stopCamera}
            >
              ✕ Close Camera
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="camera-scanner-result">
          <div className="camera-scanner-preview">
            <h3>
              Captured Image
            </h3>

            <img
              src={capturedImage}
              alt="Captured document"
              className="camera-scanner-image"
            />
          </div>

          <div className="camera-scanner-actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={
                processing ||
                savingImage
              }
              onClick={retakeImage}
            >
              🔄 Retake
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              disabled={
                processing ||
                savingImage ||
                imageSaved
              }
              onClick={
                saveImageAsAttachment
              }
            >
              {savingImage
                ? "Saving..."
                : imageSaved
                  ? "✓ Saved as Attachment"
                  : "🖼️ Save as Attachment"}
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={
                processing ||
                savingImage
              }
              onClick={runOCR}
            >
              {processing
                ? "Reading..."
                : "🔎 Extract Text"}
            </button>
          </div>

          <div className="camera-scanner-text">
            <h3>
              Extracted Text
            </h3>

            <textarea
              value={ocrText}
              onChange={(event) =>
                handleTextChange(
                  event.target.value
                )
              }
              placeholder="Extracted text will appear here. You can edit it before adding it to the task."
              rows={8}
              disabled={
                processing ||
                savingImage
              }
            />
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />
    </div>
  );
}