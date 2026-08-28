import { Redo2, Undo2 } from "lucide-react";
import { useEditHistory } from "@/hooks/useEditHistory";

const button =
  "p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-white/40 disabled:cursor-default cursor-pointer";

/**
 * Undo / redo for whatever is being edited. Lives in every screen's header, so
 * the controls are always in the same place — greyed out wherever there is
 * nothing to step through yet (a screen with no editor, or a freshly loaded
 * one), active the moment there is.
 */
const UndoRedo = ({ className = "" }: { className?: string }) => {
  const { controls } = useEditHistory();

  return (
    <div className={`flex items-center ${className}`} role="group" aria-label="Undo and redo">
      <button
        type="button"
        onClick={() => controls?.undo()}
        disabled={!controls?.canUndo}
        className={button}
        title="Undo (⌘Z)"
        aria-label="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => controls?.redo()}
        disabled={!controls?.canRedo}
        className={button}
        title="Redo (⇧⌘Z)"
        aria-label="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default UndoRedo;
