import React, { useEffect, useRef } from "react";
import { Jodit } from "jodit";
import "jodit/es2021/jodit.min.css";

interface JoditEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  config?: any;
}

export default function JoditEditor({ value, onChange, onBlur, config }: JoditEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const joditInstance = useRef<Jodit | null>(null);

  useEffect(() => {
    if (editorRef.current && !joditInstance.current) {
      joditInstance.current = Jodit.make(editorRef.current, {
        readonly: false,
        minHeight: 500,
        placeholder: "Start typing here...",
        ...config,
      });
      
      joditInstance.current.value = value || "";
      
      joditInstance.current.events.on("change", () => {
        onChange(joditInstance.current?.value || "");
      });
      
      joditInstance.current.events.on("blur", () => {
        if (onBlur) {
          onBlur(joditInstance.current?.value || "");
        }
      });
    }

    return () => {
      if (joditInstance.current) {
        joditInstance.current.destruct();
        joditInstance.current = null;
      }
    };
  }, []);

  // Sync external changes (like initial API load)
  useEffect(() => {
    if (joditInstance.current && value !== joditInstance.current.value) {
      joditInstance.current.value = value || "";
    }
  }, [value]);

  return <textarea ref={editorRef}></textarea>;
}
