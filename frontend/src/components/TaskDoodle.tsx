import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  deleteTaskDoodle,
  getTaskDoodle,
  saveTaskDoodle,
} from "../api/taskDoodleApi";

interface TaskDoodleProps {
  taskId?: string;
  locked: boolean;
  initialImageData?: string | null;
  onSave?: (imageData: string) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

type Tool = "PEN" | "ERASER";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 500;
const MAX_HISTORY = 30;

export default function TaskDoodle({
  taskId,
  locked,
  initialImageData,
  onSave,
  onDelete,
}: TaskDoodleProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const drawingRef = useRef(false);

  const historyRef =
    useRef<string[]>([]);

  const historyIndexRef =
    useRef(-1);

  const restoreRequestRef =
    useRef(0);

  const [historyIndex, setHistoryIndex] =
    useState(-1);

  const [historyLength, setHistoryLength] =
    useState(0);

  const [tool, setTool] =
    useState<Tool>("PEN");

  const [lineWidth, setLineWidth] =
    useState(3);

  const [hasDrawing, setHasDrawing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  function getCanvas(): HTMLCanvasElement | null {
    return canvasRef.current;
  }

  function getContext(): CanvasRenderingContext2D | null {
    const canvas = getCanvas();

    if (!canvas) {
      return null;
    }

    return canvas.getContext("2d");
  }

  function syncHistoryState() {
    setHistoryIndex(
      historyIndexRef.current,
    );

    setHistoryLength(
      historyRef.current.length,
    );
  }

  function resetHistory() {
    historyRef.current = [];
    historyIndexRef.current = -1;
    syncHistoryState();
  }

  function createBlankCanvas() {
    const canvas = getCanvas();
    const context = getContext();

    if (!canvas || !context) {
      return;
    }

    context.save();

    context.globalCompositeOperation =
      "source-over";

    context.fillStyle = "#ffffff";

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    context.restore();
  }

  function getCanvasImage(): string {
    const canvas = getCanvas();

    if (!canvas) {
      return "";
    }

    return canvas.toDataURL("image/png");
  }

  function saveHistory() {
    const image = getCanvasImage();

    if (!image) {
      return;
    }

    const currentHistory =
      historyRef.current.slice(
        0,
        historyIndexRef.current + 1,
      );

    currentHistory.push(image);

    if (
      currentHistory.length >
      MAX_HISTORY
    ) {
      currentHistory.shift();
    }

    historyRef.current =
      currentHistory;

    historyIndexRef.current =
      currentHistory.length - 1;

    syncHistoryState();
  }

  function setHistoryToImage(
    imageData: string,
  ) {
    historyRef.current = [
      imageData,
    ];

    historyIndexRef.current = 0;

    syncHistoryState();
  }

  function restoreImage(
    imageData: string,
    drawingExists = true,
  ) {
    const canvas = getCanvas();
    const context = getContext();

    if (
      !canvas ||
      !context ||
      !imageData
    ) {
      return;
    }

    const requestId =
      ++restoreRequestRef.current;

    const image = new Image();

    image.onload = () => {
      if (
        requestId !==
        restoreRequestRef.current
      ) {
        return;
      }

      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height,
      );

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      setHasDrawing(
        drawingExists,
      );
    };

    image.onerror = () => {
      if (
        requestId !==
        restoreRequestRef.current
      ) {
        return;
      }

      setError(
        "Unable to restore the doodle.",
      );
    };

    image.src = imageData;
  }

  useEffect(() => {
    let cancelled = false;

    async function loadDoodle() {
      const canvas = getCanvas();
      const context = getContext();

      if (!canvas || !context) {
        return;
      }

      setLoading(true);
      setError("");
      setSaved(false);

      createBlankCanvas();

      resetHistory();

      /*
       * If the parent already supplied image data,
       * use it first.
       */
      if (initialImageData) {
        const image = new Image();

        image.onload = () => {
          if (cancelled) {
            return;
          }

          const currentCanvas =
            getCanvas();

          const currentContext =
            getContext();

          if (
            !currentCanvas ||
            !currentContext
          ) {
            return;
          }

          currentContext.clearRect(
            0,
            0,
            currentCanvas.width,
            currentCanvas.height,
          );

          currentContext.drawImage(
            image,
            0,
            0,
            currentCanvas.width,
            currentCanvas.height,
          );

          const imageData =
            currentCanvas.toDataURL(
              "image/png",
            );

          setHasDrawing(true);
          setSaved(true);
          setLoading(false);

          setHistoryToImage(
            imageData,
          );
        };

        image.onerror = () => {
          if (!cancelled) {
            setError(
              "Unable to load the supplied doodle.",
            );

            setLoading(false);
          }
        };

        image.src =
          initialImageData;

        return;
      }

      /*
       * Otherwise, load the doodle from the backend
       * when a taskId is available.
       */
      if (!taskId) {
        createBlankCanvas();
        saveHistory();

        setHasDrawing(false);
        setLoading(false);

        return;
      }

      try {
        const doodle =
          await getTaskDoodle(taskId);

        if (cancelled) {
          return;
        }

        if (doodle?.imageData) {
          const image = new Image();

          image.onload = () => {
            if (cancelled) {
              return;
            }

            const currentCanvas =
              getCanvas();

            const currentContext =
              getContext();

            if (
              !currentCanvas ||
              !currentContext
            ) {
              return;
            }

            currentContext.clearRect(
              0,
              0,
              currentCanvas.width,
              currentCanvas.height,
            );

            currentContext.drawImage(
              image,
              0,
              0,
              currentCanvas.width,
              currentCanvas.height,
            );

            const imageData =
              currentCanvas.toDataURL(
                "image/png",
              );

            setHasDrawing(true);
            setSaved(true);
            setLoading(false);

            setHistoryToImage(
              imageData,
            );
          };

          image.onerror = () => {
            if (!cancelled) {
              setError(
                "Unable to load the saved doodle.",
              );

              setLoading(false);
            }
          };

          image.src =
            doodle.imageData;
        } else {
          createBlankCanvas();
          saveHistory();

          setHasDrawing(false);
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Unable to load task doodle:",
          err,
        );

        setError(
          "Unable to load the saved doodle.",
        );

        createBlankCanvas();
        saveHistory();

        setHasDrawing(false);
        setLoading(false);
      }
    }

    loadDoodle();

    return () => {
      cancelled = true;
      restoreRequestRef.current++;
    };
  }, [taskId, initialImageData]);

  function getPointerPosition(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    const canvas = getCanvas();

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect =
      canvas.getBoundingClientRect();

    const scaleX =
      canvas.width / rect.width;

    const scaleY =
      canvas.height / rect.height;

    return {
      x:
        (event.clientX - rect.left) *
        scaleX,
      y:
        (event.clientY - rect.top) *
        scaleY,
    };
  }

  function handlePointerDown(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    if (
      locked ||
      loading ||
      saving
    ) {
      return;
    }

    const canvas = getCanvas();
    const context = getContext();

    if (!canvas || !context) {
      return;
    }

    canvas.setPointerCapture(
      event.pointerId,
    );

    const { x, y } =
      getPointerPosition(event);

    drawingRef.current = true;

    context.beginPath();
    context.moveTo(x, y);

    context.lineWidth = lineWidth;
    context.lineCap = "round";
    context.lineJoin = "round";

    context.strokeStyle =
      tool === "PEN"
        ? "#111827"
        : "#ffffff";

    context.globalCompositeOperation =
      "source-over";
  }

  function handlePointerMove(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    if (
      locked ||
      loading ||
      saving ||
      !drawingRef.current
    ) {
      return;
    }

    const context = getContext();

    if (!context) {
      return;
    }

    const { x, y } =
      getPointerPosition(event);

    context.lineTo(x, y);
    context.stroke();

    setHasDrawing(true);
    setSaved(false);
  }

  function handlePointerUp(
    event: React.PointerEvent<HTMLCanvasElement>,
  ) {
    if (!drawingRef.current) {
      return;
    }

    const canvas = getCanvas();

    drawingRef.current = false;

    if (canvas) {
      try {
        canvas.releasePointerCapture(
          event.pointerId,
        );
      } catch {
        // Pointer capture may already be released.
      }
    }

    if (!locked) {
      /*
       * This automatically removes any redo states
       * when the user draws after undoing.
       */
      saveHistory();
    }
  }

  function handleUndo() {
    if (
      locked ||
      loading ||
      saving ||
      historyIndexRef.current <= 0
    ) {
      return;
    }

    historyIndexRef.current -= 1;

    syncHistoryState();

    const image =
      historyRef.current[
        historyIndexRef.current
      ];

    if (image) {
      restoreImage(image);
      setSaved(false);
    }
  }

  function handleRedo() {
    if (
      locked ||
      loading ||
      saving ||
      historyIndexRef.current >=
        historyRef.current.length - 1
    ) {
      return;
    }

    historyIndexRef.current += 1;

    syncHistoryState();

    const image =
      historyRef.current[
        historyIndexRef.current
      ];

    if (image) {
      restoreImage(image);
      setSaved(false);
    }
  }

  function handleClear() {
    if (
      locked ||
      loading ||
      saving
    ) {
      return;
    }

    createBlankCanvas();

    setHasDrawing(false);
    setSaved(false);

    saveHistory();
  }

  async function handleSave() {
    if (
      locked ||
      loading ||
      saving
    ) {
      return;
    }

    const imageData =
      getCanvasImage();

    if (!imageData) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (taskId) {
        await saveTaskDoodle(
          taskId,
          imageData,
        );
      }

      setSaved(true);

      if (onSave) {
        await onSave(imageData);
      }
    } catch (err) {
      console.error(
        "Unable to save task doodle:",
        err,
      );

      setError(
        "Unable to save the doodle.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSavedDoodle() {
    if (
      locked ||
      loading ||
      saving
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (taskId) {
        await deleteTaskDoodle(taskId);
      }

      createBlankCanvas();

      resetHistory();
      saveHistory();

      setHasDrawing(false);
      setSaved(false);

      if (onDelete) {
        await onDelete();
      }

      if (onSave) {
        await onSave("");
      }
    } catch (err) {
      console.error(
        "Unable to delete task doodle:",
        err,
      );

      setError(
        "Unable to delete the saved doodle.",
      );
    } finally {
      setSaving(false);
    }
  }

  const canUndo =
    historyIndex > 0;

  const canRedo =
    historyIndex >= 0 &&
    historyIndex <
      historyLength - 1;

  return (
    <div className="task-doodle">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            Doodle
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              color: "#64748b",
            }}
          >
            Draw, erase, undo, redo,
            and save your sketch.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            disabled={
              locked ||
              loading ||
              saving
            }
            onClick={() =>
              setTool("PEN")
            }
          >
            ✏️ Pen
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={
              locked ||
              loading ||
              saving
            }
            onClick={() =>
              setTool("ERASER")
            }
          >
            🧽 Eraser
          </button>

          <select
            value={lineWidth}
            disabled={
              locked ||
              loading ||
              saving
            }
            onChange={(event) =>
              setLineWidth(
                Number(
                  event.target.value,
                ),
              )
            }
          >
            <option value={2}>
              Thin
            </option>

            <option value={3}>
              Medium
            </option>

            <option value={6}>
              Thick
            </option>

            <option value={10}>
              Very Thick
            </option>
          </select>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={
              locked ||
              loading ||
              saving ||
              !canUndo
            }
            onClick={handleUndo}
          >
            ↩ Undo
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={
              locked ||
              loading ||
              saving ||
              !canRedo
            }
            onClick={handleRedo}
          >
            ↪ Redo
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={
              locked ||
              loading ||
              saving
            }
            onClick={handleClear}
          >
            🗑 Clear
          </button>

          <button
            type="button"
            className="btn btn-primary"
            disabled={
              locked ||
              loading ||
              saving ||
              !hasDrawing
            }
            onClick={handleSave}
          >
            {saving
              ? "Saving..."
              : "💾 Save"}
          </button>

          {saved && (
            <button
              type="button"
              className="btn btn-secondary"
              disabled={
                locked ||
                loading ||
                saving
              }
              onClick={
                handleDeleteSavedDoodle
              }
            >
              Delete Saved
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div
          className="task-details-empty"
          style={{
            marginBottom: "12px",
          }}
        >
          Loading saved doodle...
        </div>
      )}

      {locked && (
        <div
          className="task-details-empty"
          style={{
            marginBottom: "12px",
          }}
        >
          🔒 This task is locked.
          Unlock it to edit the
          doodle.
        </div>
      )}

      {saved && !loading && (
        <div
          style={{
            marginBottom: "12px",
            color: "#16a34a",
          }}
        >
          ✓ Doodle saved
        </div>
      )}

      {error && (
        <div
          className="task-details-error-banner"
          role="alert"
          style={{
            marginBottom: "12px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          width: "100%",
          overflow: "hidden",
          border: "1px solid #cbd5e1",
          borderRadius: "10px",
          background: "#ffffff",
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            display: "block",
            width: "100%",
            height: "500px",
            cursor:
              locked ||
              loading ||
              saving
                ? "not-allowed"
                : tool === "PEN"
                  ? "crosshair"
                  : "cell",
            touchAction: "none",
            background: "#ffffff",
          }}
          onPointerDown={
            handlePointerDown
          }
          onPointerMove={
            handlePointerMove
          }
          onPointerUp={
            handlePointerUp
          }
          onPointerCancel={
            handlePointerUp
          }
        />
      </div>
    </div>
  );
}