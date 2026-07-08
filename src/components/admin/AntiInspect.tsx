"use client";

import { useEffect } from "react";
import { toast } from "@/store/useToastStore";

export function AntiInspect() {
  useEffect(() => {
    // Prevent Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error("Action not allowed in Admin Panel for security reasons.");
    };

    // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        toast.error("Developer tools are disabled.");
      }
      
      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        toast.error("Developer tools are disabled.");
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        toast.error("Developer tools are disabled.");
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        toast.error("Viewing source is disabled.");
      }
      
      // Ctrl+S (Save Page)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
