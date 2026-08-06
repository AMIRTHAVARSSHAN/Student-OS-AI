import { useEffect, useMemo, useState } from "react";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/react";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";

interface BlockEditorProps {
  blocks: PartialBlock[];
  onChange?: (blocks: PartialBlock[]) => void;
  readOnly?: boolean;
}

export default function BlockEditor({ blocks, onChange, readOnly = false }: BlockEditorProps) {
  // Initialize BlockNote
  const editor = useCreateBlockNote({
    initialContent: blocks.length > 0 ? blocks : undefined,
  });

  if (editor === undefined) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="w-full h-full text-black">
      <BlockNoteView
        editor={editor}
        theme="light"
        editable={!readOnly}
        onChange={() => {
          if (onChange) {
            onChange(editor.document);
          }
        }}
        className="min-h-[500px]"
      />
    </div>
  );
}
