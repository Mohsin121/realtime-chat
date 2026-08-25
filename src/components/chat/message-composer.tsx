"use client";

import { FormEvent, useState } from "react";
import { Paperclip, Send } from "lucide-react";

interface MessageComposerProps {
  onSend: (content: string) => void;
  isSending: boolean;
  onTyping: () => void;
  onStopTyping: () => void;
}

export function MessageComposer({
  onSend,
  isSending,
  onTyping,
  onStopTyping,
  
}: MessageComposerProps) {
  const [content, setContent] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || isSending) {
      return;
    }

    await onSend(trimmedContent);

    setContent("");
  }


  const onTextChange = (e: any) => {
      setContent(e.target.value);
    
      if (e.target.value.trim()) {
        onTyping();
      } else {
        onStopTyping();
      }
    }
  return (
    <form
      onSubmit={handleSubmit}
      className="border-t bg-background p-4"
    >
      <div className="flex items-end gap-2">
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-muted"
          title="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          value={content}
          onChange={onTextChange}
          placeholder="Type a message..."
          rows={1}
          onBlur={onStopTyping}
          disabled={isSending}
          className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();

              event.currentTarget.form?.requestSubmit();
            }
          }}
        />

        <button
          type="submit"
          disabled={
            isSending || !content.trim()
          }
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}