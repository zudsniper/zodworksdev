"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Placeholder from "@tiptap/extension-placeholder"
import Typography from "@tiptap/extension-typography"
import { common, createLowlight } from "lowlight"
import { useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

const lowlight = createLowlight(common)

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  autoFocus?: boolean
  onFocus?: () => void
  onBlur?: () => void
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Write your message...",
  className,
  disabled = false,
  autoFocus = false,
  onFocus,
  onBlur,
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "rounded-md bg-muted p-3 font-mono text-sm",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      Typography,
    ],
    content,
    editable: !disabled,
    autofocus: autoFocus,
    onUpdate: ({ editor }) => {
      // Get plain text for markdown preview
      const text = editor.getText()
      onChange(text)
    },
    onFocus: () => {
      onFocus?.()
    },
    onBlur: () => {
      onBlur?.()
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
          "min-h-[150px] p-3",
          className
        ),
      },
    },
  })

  useEffect(() => {
    // Only update if content is different and editor is not focused
    if (editor && content !== editor.getText() && !editor.isFocused) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!editor) return

      // Markdown shortcuts
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(Math.max(0, from - 10), from)

      if (e.key === " ") {
        // Headers
        if (text.endsWith("#")) {
          e.preventDefault()
          editor.chain().deleteRange({ from: from - 1, to }).setHeading({ level: 1 }).run()
        } else if (text.endsWith("##")) {
          e.preventDefault()
          editor.chain().deleteRange({ from: from - 2, to }).setHeading({ level: 2 }).run()
        } else if (text.endsWith("###")) {
          e.preventDefault()
          editor.chain().deleteRange({ from: from - 3, to }).setHeading({ level: 3 }).run()
        }
        // Lists
        else if (text.endsWith("-") || text.endsWith("*")) {
          e.preventDefault()
          editor.chain().deleteRange({ from: from - 1, to }).toggleBulletList().run()
        } else if (text.match(/\d+\.$/)) {
          e.preventDefault()
          const match = text.match(/(\d+)\.$/)?.[0]
          if (match) {
            editor.chain().deleteRange({ from: from - match.length, to }).toggleOrderedList().run()
          }
        }
      }

      // Code blocks
      if (e.key === "Enter" && text.endsWith("```")) {
        e.preventDefault()
        editor.chain().deleteRange({ from: from - 3, to }).setCodeBlock().run()
      }

      // Bold/Italic with ** or *
      if (e.key === "*" && text.endsWith("*")) {
        const prevChar = text[text.length - 2]
        if (prevChar === "*") {
          // Bold
          e.preventDefault()
          editor.chain().deleteRange({ from: from - 2, to }).toggleBold().run()
        }
      }
    },
    [editor]
  )

  return (
    <div
      className={cn(
        "rounded-md border bg-background",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onKeyDown={handleKeyDown}
    >
      <EditorContent editor={editor} />
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: hsl(var(--muted-foreground));
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          font-style: italic;
          opacity: 0.6;
        }
        
        .ProseMirror {
          color: hsl(var(--foreground));
          font-style: normal;
        }

        .ProseMirror.focus {
          outline: none;
        }
        
        .ProseMirror:not(.is-editor-empty) {
          min-height: 150px;
        }
        
        .ProseMirror.is-editor-empty {
          min-height: 150px;
        }

        .ProseMirror pre {
          background: hsl(var(--muted));
          border-radius: 0.375rem;
          color: hsl(var(--foreground));
          font-family: var(--font-jetbrains-mono);
          padding: 0.75rem 1rem;
        }

        .ProseMirror pre code {
          background: none;
          color: inherit;
          font-size: 0.875rem;
          padding: 0;
        }

        .hljs-comment,
        .hljs-quote {
          color: hsl(var(--muted-foreground));
        }

        .hljs-variable,
        .hljs-template-variable,
        .hljs-attribute,
        .hljs-tag,
        .hljs-name,
        .hljs-regexp,
        .hljs-link,
        .hljs-selector-id,
        .hljs-selector-class {
          color: hsl(var(--primary));
        }

        .hljs-number,
        .hljs-meta,
        .hljs-built_in,
        .hljs-builtin-name,
        .hljs-literal,
        .hljs-type,
        .hljs-params {
          color: hsl(var(--accent-purple));
        }

        .hljs-string,
        .hljs-symbol,
        .hljs-bullet {
          color: hsl(var(--accent-green));
        }

        .hljs-title,
        .hljs-section {
          color: hsl(var(--accent-yellow));
        }

        .hljs-keyword,
        .hljs-selector-tag {
          color: hsl(var(--accent-red));
        }
      `}</style>
    </div>
  )
}