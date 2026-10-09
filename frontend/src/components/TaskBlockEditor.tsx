import { useEffect, useState } from "react";
import {
  createTaskBlock,
  deleteTaskBlock,
  getTaskBlocks,
  replaceTaskBlocks,
  updateTaskBlock,
} from "../api/taskBlockApi";
import type {
  TaskBlock,
  TaskBlockRequest,
  TaskBlockType,
} from "../types/taskBlock";

interface TaskBlockEditorProps {
  taskId: string;
  locked: boolean;
}

const BLOCK_TYPES: TaskBlockType[] = [
  "TITLE",
  "SUBTITLE",
  "HEADING",
  "PARAGRAPH",
  "CHECKLIST",
  "BULLET_LIST",
  "NUMBERED_LIST",
  "QUOTE",
  "CODE",
  "TABLE",
];

function getBlockLabel(type: TaskBlockType): string {
  switch (type) {
    case "TITLE":
      return "Title";
    case "SUBTITLE":
      return "Subtitle";
    case "HEADING":
      return "Heading";
    case "PARAGRAPH":
      return "Paragraph";
    case "CHECKLIST":
      return "Checklist";
    case "BULLET_LIST":
      return "Bullet List";
    case "NUMBERED_LIST":
      return "Numbered List";
    case "QUOTE":
      return "Quote";
    case "CODE":
      return "Code";
    case "TABLE":
      return "Table";
    default:
      return type;
  }
}

function getBlockClassName(type: TaskBlockType): string {
  switch (type) {
    case "TITLE":
      return "task-block-title";
    case "SUBTITLE":
      return "task-block-subtitle";
    case "HEADING":
      return "task-block-heading";
    case "QUOTE":
      return "task-block-quote";
    case "CODE":
      return "task-block-code";
    case "CHECKLIST":
      return "task-block-checklist";
    case "BULLET_LIST":
      return "task-block-bullet-list";
    case "NUMBERED_LIST":
      return "task-block-numbered-list";
    case "TABLE":
      return "task-block-table";
    default:
      return "task-block-paragraph";
  }
}

export default function TaskBlockEditor({
  taskId,
  locked,
}: TaskBlockEditorProps) {
  const [blocks, setBlocks] = useState<TaskBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadBlocks();
  }, [taskId]);

  async function loadBlocks() {
    try {
      setLoading(true);
      setError("");

      const data = await getTaskBlocks(taskId);

      const sortedBlocks = [...data].sort(
        (a, b) => a.position - b.position,
      );

      setBlocks(sortedBlocks);
    } catch (err) {
      console.error("Unable to load task blocks:", err);
      setError("Unable to load task content.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBlock() {
    if (locked || saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: TaskBlockRequest = {
        blockType: "PARAGRAPH",
        content: "",
        position: blocks.length,
      };

      const createdBlock = await createTaskBlock(
        taskId,
        request,
      );

      setBlocks((current) => [
        ...current,
        createdBlock,
      ]);
    } catch (err) {
      console.error(
        "Unable to create task block:",
        err,
      );
      setError("Unable to add the block.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateBlock(
    block: TaskBlock,
    changes: Partial<TaskBlockRequest>,
  ) {
    if (locked || saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const request: TaskBlockRequest = {
        blockType:
          changes.blockType ?? block.blockType,
        content:
          changes.content ?? block.content ?? "",
        position:
          changes.position ?? block.position,
      };

      const updatedBlock =
        await updateTaskBlock(
          block.id,
          request,
        );

      setBlocks((current) =>
        current.map((item) =>
          item.id === updatedBlock.id
            ? updatedBlock
            : item,
        ),
      );
    } catch (err) {
      console.error(
        "Unable to update task block:",
        err,
      );
      setError("Unable to save the block.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBlock(
    blockId: string,
  ) {
    if (locked || saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteTaskBlock(blockId);

      setBlocks((current) =>
        current
          .filter(
            (block) => block.id !== blockId,
          )
          .map((block, index) => ({
            ...block,
            position: index,
          })),
      );
    } catch (err) {
      console.error(
        "Unable to delete task block:",
        err,
      );
      setError("Unable to delete the block.");
    } finally {
      setSaving(false);
    }
  }

  async function handleMoveBlock(
    index: number,
    direction: "up" | "down",
  ) {
    if (locked || saving) {
      return;
    }

    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= blocks.length
    ) {
      return;
    }

    const reorderedBlocks = [...blocks];

    const currentBlock =
      reorderedBlocks[index];

    reorderedBlocks[index] =
      reorderedBlocks[targetIndex];

    reorderedBlocks[targetIndex] =
      currentBlock;

    const normalizedBlocks =
      reorderedBlocks.map(
        (block, position) => ({
          ...block,
          position,
        }),
      );

    try {
      setSaving(true);
      setError("");

      const requests: TaskBlockRequest[] =
        normalizedBlocks.map((block) => ({
          blockType: block.blockType,
          content: block.content ?? "",
          position: block.position,
        }));

      const savedBlocks =
        await replaceTaskBlocks(
          taskId,
          requests,
        );

      const sortedBlocks = [
        ...savedBlocks,
      ].sort(
        (a, b) => a.position - b.position,
      );

      setBlocks(sortedBlocks);
    } catch (err) {
      console.error(
        "Unable to reorder task blocks:",
        err,
      );
      setError(
        "Unable to reorder the blocks.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleContentChange(
    blockId: string,
    content: string,
  ) {
    setBlocks((current) =>
      current.map((item) =>
        item.id === blockId
          ? {
              ...item,
              content,
            }
          : item,
      ),
    );
  }

  if (loading) {
    return (
      <div className="task-block-editor">
        <div className="task-details-section">
          <h2>Task Content</h2>

          <p className="task-details-empty">
            Loading task content...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-block-editor">
      <div className="task-block-editor-header">
        <div>
          <h2>Task Content</h2>

          <p>
            Add and organize rich content
            for this task.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleAddBlock}
          disabled={locked || saving}
        >
          + Add Block
        </button>
      </div>

      {locked && (
        <p className="task-details-empty">
          🔒 This task is locked. Unlock it
          to edit the content.
        </p>
      )}

      {error && (
        <div
          className="task-details-error-banner"
          role="alert"
        >
          {error}
        </div>
      )}

      {blocks.length === 0 ? (
        <div className="task-details-empty">
          No content blocks yet. Click{" "}
          <strong>+ Add Block</strong> to
          start.
        </div>
      ) : (
        <div className="task-block-editor-list">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className={`task-block-editor-item ${getBlockClassName(
                block.blockType,
              )}`}
            >
              <div className="task-block-editor-toolbar">
                <select
                  value={block.blockType}
                  disabled={locked || saving}
                  onChange={(event) =>
                    void handleUpdateBlock(
                      block,
                      {
                        blockType:
                          event.target
                            .value as TaskBlockType,
                      },
                    )
                  }
                >
                  {BLOCK_TYPES.map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {getBlockLabel(type)}
                    </option>
                  ))}
                </select>

                <div className="task-block-editor-actions">
                  <button
                    type="button"
                    className="task-block-move-button"
                    disabled={
                      locked ||
                      saving ||
                      index === 0
                    }
                    onClick={() =>
                      void handleMoveBlock(
                        index,
                        "up",
                      )
                    }
                    title="Move block up"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    className="task-block-move-button"
                    disabled={
                      locked ||
                      saving ||
                      index ===
                        blocks.length - 1
                    }
                    onClick={() =>
                      void handleMoveBlock(
                        index,
                        "down",
                      )
                    }
                    title="Move block down"
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    className="task-block-delete-button"
                    disabled={
                      locked || saving
                    }
                    onClick={() =>
                      void handleDeleteBlock(
                        block.id,
                      )
                    }
                    title="Delete block"
                  >
                    🗑
                  </button>
                </div>
              </div>

              <textarea
                className="task-block-editor-input"
                value={block.content ?? ""}
                disabled={
                  locked || saving
                }
                placeholder={`Enter ${getBlockLabel(
                  block.blockType,
                ).toLowerCase()} content...`}
                onChange={(event) =>
                  handleContentChange(
                    block.id,
                    event.target.value,
                  )
                }
                onBlur={() => {
                  const latestBlock =
                    blocks.find(
                      (item) =>
                        item.id === block.id,
                    );

                  if (!latestBlock) {
                    return;
                  }

                  void handleUpdateBlock(
                    latestBlock,
                    {
                      content:
                        latestBlock.content ??
                        "",
                    },
                  );
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}