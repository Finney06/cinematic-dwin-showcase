import type { ReactNode } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import UndoRedo from "@/components/admin/UndoRedo";

/**
 * The admin's form vocabulary. The public site is art-directed; the admin is
 * deliberately plain and information-dense — one set of controls, used
 * everywhere, so every editor screen behaves the same way.
 */

export const inputClass =
  "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors";

export const Field = ({
  label,
  hint,
  children,
  className = "",
}: {
  label?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={className}>
    {label && (
      <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">{label}</label>
    )}
    {children}
    {hint && <p className="mt-2 text-[10px] text-white/25 leading-relaxed">{hint}</p>}
  </div>
);

export const TextField = ({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  label?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) => (
  <Field label={label} hint={hint} className={className}>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={inputClass}
    />
  </Field>
);

export const TextareaField = ({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
}: {
  label?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) => (
  <Field label={label} hint={hint} className={className}>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputClass} resize-y`}
    />
  </Field>
);

/** The publish switch, used identically on pages, projects and collections. */
export const Toggle = ({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    aria-pressed={checked}
    className="flex items-center gap-3 text-left cursor-pointer group"
  >
    <span
      className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${
        checked ? "bg-emerald-400/30" : "bg-white/[0.08]"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
          checked ? "left-[22px] bg-emerald-300/80" : "left-0.5 bg-white/25"
        }`}
      />
    </span>
    <span>
      <span className="block text-xs tracking-[0.1em] uppercase text-white/55 group-hover:text-white/75 transition-colors">
        {label}
      </span>
      {hint && <span className="block text-[10px] text-white/25 mt-0.5">{hint}</span>}
    </span>
  </button>
);

export const ImageField = ({
  label,
  hint,
  value,
  onChange,
  accept,
}: {
  label?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
}) => (
  <Field hint={hint}>
    <ImageUpload value={value} onChange={onChange} label={label} accept={accept} />
  </Field>
);

/**
 * An editable list of plain strings — a service's capabilities, a project's
 * stills. Rows add, reorder and delete without leaving the field.
 */
export const StringListField = ({
  label,
  hint,
  values,
  onChange,
  placeholder,
  addLabel = "Add",
  asImages = false,
}: {
  label?: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  asImages?: boolean;
}) => {
  const list = Array.isArray(values) ? values : [];

  const update = (index: number, value: string) =>
    onChange(list.map((item, i) => (i === index ? value : item)));
  const remove = (index: number) => onChange(list.filter((_, i) => i !== index));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        {list.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              {asImages ? (
                <ImageUpload value={item} onChange={(url) => update(index, url)} label="" allowClear={false} />
              ) : (
                <input
                  type="text"
                  value={item}
                  onChange={(event) => update(index, event.target.value)}
                  placeholder={placeholder}
                  className={inputClass}
                />
              )}
            </div>
            <div className="flex items-center gap-2 pt-3 text-white/25 shrink-0">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="hover:text-white/60 disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-default"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === list.length - 1}
                className="hover:text-white/60 disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-default"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="hover:text-red-400/70 transition-colors cursor-pointer"
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...list, ""])}
        className="mt-3 px-3 py-2 rounded-lg text-[10px] tracking-[0.15em] uppercase bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/20 transition-colors cursor-pointer"
      >
        + {addLabel}
      </button>
    </Field>
  );
};

/** An editable list of label/value pairs — a project's credits, a bio's links. */
export const PairListField = ({
  label,
  hint,
  values,
  onChange,
  keyName,
  valueName,
  keyPlaceholder,
  valuePlaceholder,
  addLabel = "Add",
}: {
  label?: string;
  hint?: string;
  values: Record<string, string>[];
  onChange: (values: Record<string, string>[]) => void;
  keyName: string;
  valueName: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addLabel?: string;
}) => {
  const list = Array.isArray(values) ? values : [];

  const update = (index: number, patch: Record<string, string>) =>
    onChange(list.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const remove = (index: number) => onChange(list.filter((_, i) => i !== index));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <Field label={label} hint={hint}>
      <div className="space-y-2">
        {list.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item[keyName] || ""}
              onChange={(event) => update(index, { [keyName]: event.target.value })}
              placeholder={keyPlaceholder}
              className={`${inputClass} sm:max-w-[40%]`}
            />
            <input
              type="text"
              value={item[valueName] || ""}
              onChange={(event) => update(index, { [valueName]: event.target.value })}
              placeholder={valuePlaceholder}
              className={inputClass}
            />
            <div className="flex items-center gap-2 text-white/25 shrink-0">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="hover:text-white/60 disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-default"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === list.length - 1}
                className="hover:text-white/60 disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-default"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="hover:text-red-400/70 transition-colors cursor-pointer"
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...list, { [keyName]: "", [valueName]: "" }])}
        className="mt-3 px-3 py-2 rounded-lg text-[10px] tracking-[0.15em] uppercase bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/20 transition-colors cursor-pointer"
      >
        + {addLabel}
      </button>
    </Field>
  );
};

/** Primary / secondary buttons, so every screen's actions look the same. */
export const PrimaryButton = ({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="bg-white/90 text-black px-5 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase font-medium hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
  >
    {children}
  </button>
);

export const SecondaryButton = ({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="bg-white/[0.06] text-white/45 px-5 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase hover:bg-white/[0.1] hover:text-white/70 transition-colors disabled:opacity-40 cursor-pointer"
  >
    {children}
  </button>
);

/** Two-step delete. Nothing in the admin is removed on a single click. */
export const ConfirmDelete = ({
  open,
  title,
  body,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  pending,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  pending?: boolean;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-5">
      <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6 max-w-sm w-full">
        <h3 className="text-sm text-white/70 font-medium mb-2">{title}</h3>
        <p className="text-xs text-white/35 mb-6 leading-relaxed">{body}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white/[0.06] rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="px-4 py-2 bg-red-500/20 rounded-lg text-xs text-red-400/70 hover:bg-red-500/30 hover:text-red-400 transition-colors disabled:opacity-40 cursor-pointer"
          >
            {pending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Page header shared by every admin screen. Undo/redo sits here rather than in
 * each editor, so the controls are always in the same place.
 */
export const AdminHeader = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
    <div>
      <h1 className="text-xl tracking-[0.06em] text-white/80 font-light">{title}</h1>
      {description && <p className="text-xs text-white/25 tracking-wide mt-1 max-w-xl">{description}</p>}
    </div>
    <div className="flex items-center gap-3">
      <UndoRedo className="-ml-2" />
      {children}
    </div>
  </div>
);
