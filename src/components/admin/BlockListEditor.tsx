import ImageUpload from "@/components/admin/ImageUpload";
import { StringListField } from "@/components/admin/FormFields";
import { BLOCK_TYPES, emptyBlock, type PageBlock } from "@/lib/pageBlocks";

const small =
  "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors";

/**
 * The stackable-block editor. Pages, Journal entries and projects all use this
 * one component, so a block type added to `lib/pageBlocks.ts` becomes editable
 * everywhere at once — and looks the same everywhere it's edited.
 */
const BlockListEditor = ({
  blocks,
  onChange,
  label = "Content blocks",
}: {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
  label?: string;
}) => {
  const list = Array.isArray(blocks) ? blocks : [];

  const add = (type: PageBlock["type"]) => onChange([...list, emptyBlock(type)]);
  const update = (index: number, patch: Partial<PageBlock>) =>
    onChange(list.map((block, i) => (i === index ? ({ ...block, ...patch } as PageBlock) : block)));
  const remove = (index: number) => onChange(list.filter((_, i) => i !== index));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs tracking-[0.15em] uppercase text-white/40 font-medium">{label}</span>
          <span className="text-[10px] text-white/20">
            {list.length} {list.length === 1 ? "block" : "blocks"}
          </span>
        </div>
      )}

      <div className="space-y-3">
        {list.map((block, index) => (
          <BlockCard
            key={index}
            block={block}
            onChange={(patch) => update(index, patch)}
            onRemove={() => remove(index)}
            onMoveUp={index > 0 ? () => move(index, -1) : undefined}
            onMoveDown={index < list.length - 1 ? () => move(index, 1) : undefined}
          />
        ))}
        {!list.length && (
          <p className="text-[11px] text-white/25 py-3">
            Nothing added yet. Start with a Text block, then stack whatever this page needs.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-4">
        {BLOCK_TYPES.map(({ type, label: blockLabel, hint }) => (
          <button
            key={type}
            type="button"
            onClick={() => add(type)}
            title={hint}
            className="px-3 py-2 rounded-lg text-[10px] tracking-[0.15em] uppercase bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/20 transition-colors cursor-pointer"
          >
            + {blockLabel}
          </button>
        ))}
      </div>
    </div>
  );
};

/** One block's compact editor card — type-specific fields, reorder, delete. */
const BlockCard = ({
  block,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: PageBlock;
  onChange: (patch: Partial<PageBlock>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) => {
  const meta = BLOCK_TYPES.find((entry) => entry.type === block.type);

  return (
    <div className="border border-white/[0.08] rounded-lg p-4 bg-white/[0.02]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/30">
          {meta?.label || block.type}
        </span>
        <div className="flex items-center gap-3 text-white/25">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!onMoveUp}
            className="hover:text-white/60 disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-default"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!onMoveDown}
            className="hover:text-white/60 disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-default"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="hover:text-red-400/70 transition-colors cursor-pointer"
            aria-label="Remove block"
          >
            ×
          </button>
        </div>
      </div>

      {block.type === "heading" && (
        <input
          type="text"
          value={block.text}
          onChange={(event) => onChange({ text: event.target.value })}
          placeholder="Heading"
          className={small}
        />
      )}

      {block.type === "text" && (
        <textarea
          value={block.text}
          onChange={(event) => onChange({ text: event.target.value })}
          rows={5}
          placeholder="Leave a blank line between paragraphs."
          className={`${small} resize-y`}
        />
      )}

      {block.type === "quote" && (
        <div className="space-y-3">
          <textarea
            value={block.text}
            onChange={(event) => onChange({ text: event.target.value })}
            rows={2}
            placeholder="The line to pull out"
            className={`${small} resize-y`}
          />
          <input
            type="text"
            value={block.attribution || ""}
            onChange={(event) => onChange({ attribution: event.target.value })}
            placeholder="Attribution (optional)"
            className={small}
          />
        </div>
      )}

      {block.type === "image" && (
        <div className="space-y-3">
          <ImageUpload value={block.url} onChange={(url) => onChange({ url })} label="" allowClear={false} />
          <input
            type="text"
            value={block.caption || ""}
            onChange={(event) => onChange({ caption: event.target.value })}
            placeholder="Caption (optional)"
            className={small}
          />
        </div>
      )}

      {block.type === "gallery" && (
        <div className="space-y-3">
          <StringListField
            values={block.urls}
            onChange={(urls) => onChange({ urls })}
            addLabel="Image"
            asImages
          />
          <input
            type="text"
            value={block.caption || ""}
            onChange={(event) => onChange({ caption: event.target.value })}
            placeholder="Caption (optional)"
            className={small}
          />
        </div>
      )}

      {block.type === "video" && (
        <input
          type="text"
          value={block.url}
          onChange={(event) => onChange({ url: event.target.value })}
          placeholder="YouTube link or video URL"
          className={small}
        />
      )}

      {block.type === "button" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={block.label}
            onChange={(event) => onChange({ label: event.target.value })}
            placeholder="Label"
            className={small}
          />
          <input
            type="text"
            value={block.url}
            onChange={(event) => onChange({ url: event.target.value })}
            placeholder="https://… or /work"
            className={small}
          />
        </div>
      )}

      {block.type === "columns" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <textarea
            value={block.left}
            onChange={(event) => onChange({ left: event.target.value })}
            rows={4}
            placeholder="Left column"
            className={`${small} resize-y`}
          />
          <textarea
            value={block.right}
            onChange={(event) => onChange({ right: event.target.value })}
            rows={4}
            placeholder="Right column"
            className={`${small} resize-y`}
          />
        </div>
      )}

      {block.type === "spacer" && (
        <div className="flex gap-2">
          {(["sm", "md", "lg"] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onChange({ size })}
              className={`px-3 py-2 rounded-lg text-[10px] tracking-[0.15em] uppercase border transition-colors cursor-pointer ${
                block.size === size
                  ? "bg-white/[0.10] border-white/25 text-white/80"
                  : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/70"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockListEditor;
