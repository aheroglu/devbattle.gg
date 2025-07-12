"use client";

import { useEffect, useRef, useState } from "react";
import { Editor, OnMount } from "@monaco-editor/react";
import { ProgrammingLanguage } from "@/types";
import { Button } from "@/components/shared/ui/button";
import { Play, Save, Zap } from "lucide-react";

interface CodeEditorProps {
  language: ProgrammingLanguage;
  code: string;
  onChange: (code: string) => void;
  onLanguageChange: (language: ProgrammingLanguage) => void;
  onRun?: () => void;
  onSubmit?: () => void;
  isReadOnly?: boolean;
  theme?: "vs-dark" | "light";
  height?: string;
}

const LANGUAGE_CONFIGS = {
  javascript: {
    label: "JavaScript",
    monaco: "javascript",
    defaultCode: `function solution() {\n    // Your code here\n    return 0;\n}`,
  },
  python: {
    label: "Python",
    monaco: "python",
    defaultCode: `def solution():\n    # Your code here\n    return 0`,
  },
  java: {
    label: "Java",
    monaco: "java",
    defaultCode: `public class Solution {\n    public int solution() {\n        // Your code here\n        return 0;\n    }\n}`,
  },
  cpp: {
    label: "C++",
    monaco: "cpp",
    defaultCode: `#include <iostream>\nusing namespace std;\n\nint solution() {\n    // Your code here\n    return 0;\n}`,
  },
  go: {
    label: "Go",
    monaco: "go",
    defaultCode: `package main\n\nimport "fmt"\n\nfunc solution() int {\n    // Your code here\n    return 0\n}`,
  },
  rust: {
    label: "Rust",
    monaco: "rust",
    defaultCode: `fn solution() -> i32 {\n    // Your code here\n    0\n}`,
  },
};

export default function CodeEditor({
  language,
  code,
  onChange,
  onLanguageChange,
  onRun,
  onSubmit,
  isReadOnly = false,
  theme = "vs-dark",
  height = "400px",
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // Configure editor settings
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: "JetBrains Mono, Consolas, monospace",
      readOnly: isReadOnly,
      automaticLayout: true,
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun?.();
    });

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => {
        onSubmit?.();
      }
    );
  };

  const handleLanguageSelect = (newLanguage: ProgrammingLanguage) => {
    onLanguageChange(newLanguage);

    // If code is empty or is the default code for current language, set default for new language
    const currentDefault = LANGUAGE_CONFIGS[language].defaultCode;
    if (!code || code.trim() === currentDefault.trim()) {
      onChange(LANGUAGE_CONFIGS[newLanguage].defaultCode);
    }
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument").run();
    }
  };

  useEffect(() => {
    // Set default code if none provided
    if (!code) {
      onChange(LANGUAGE_CONFIGS[language].defaultCode);
    }
  }, [language, code, onChange]);

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) =>
              handleLanguageSelect(e.target.value as ProgrammingLanguage)
            }
            className="bg-background border rounded px-2 py-1 text-sm"
            disabled={isReadOnly}
          >
            {Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>

          {/* Format Button */}
          {!isReadOnly && isEditorReady && (
            <Button
              variant="outline"
              size="sm"
              onClick={formatCode}
              className="h-7 px-2 text-xs"
            >
              Format
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onRun && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRun}
              className="h-7 px-2 text-xs"
              disabled={isReadOnly}
            >
              <Play className="w-3 h-3 mr-1" />
              Run (Ctrl+Enter)
            </Button>
          )}

          {onSubmit && (
            <Button
              size="sm"
              onClick={onSubmit}
              className="h-7 px-2 text-xs"
              disabled={isReadOnly}
            >
              <Zap className="w-3 h-3 mr-1" />
              Submit (Ctrl+Shift+Enter)
            </Button>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height={height}
          language={LANGUAGE_CONFIGS[language].monaco}
          value={code}
          onChange={(value) => onChange(value || "")}
          onMount={handleEditorDidMount}
          theme={theme}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: isReadOnly,
            cursorStyle: "line",
            automaticLayout: true,
            wordWrap: "on",
            wrappingIndent: "indent",
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: false,
          }}
        />
      </div>

      {/* Editor Footer */}
      <div className="px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>
            {LANGUAGE_CONFIGS[language].label} " {code.split("\n").length} lines
          </span>
          <span>
            {isReadOnly
              ? "Read-only"
              : "Ctrl+Enter to run, Ctrl+Shift+Enter to submit"}
          </span>
        </div>
      </div>
    </div>
  );
}
