import { useBeforeUnload } from "react-router-dom";

export const useUnsavedChanges = (isDirty: boolean) => {
  useBeforeUnload(
    (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    },
    { capture: true }
  );
};
