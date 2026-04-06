"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircleMore } from "lucide-react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import type { ChatMessageItem } from "@/components/chat/ChatMessage";

function createMessage(role: "user" | "assistant", content: string): ChatMessageItem {
  return {
    id: crypto.randomUUID(),
    role,
    content,
  };
}

export function ChatBubble({ documentId }: { documentId: string }) {
  const [draft, setDraft] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const requestInFlight = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [isOpen]);

  async function sendMessage() {
    const trimmed = draft.trim();
    if (!trimmed || requestInFlight.current) return;

    requestInFlight.current = true;
    setIsPending(true);

    const nextUserMessage = createMessage("user", trimmed);
    const nextMessages = [...messages, nextUserMessage];

    setMessages(nextMessages);
    setDraft("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const payload = (await response.json()) as { error?: string; reply?: string };

      if (!response.ok || payload.reply == null || payload.reply === "") {
        throw new Error(payload.error ?? "Unable to get a response right now.");
      }

      const reply = payload.reply;
      setMessages((current) => [...current, createMessage("assistant", reply)]);
    } catch (error) {
      const fallback =
        error instanceof Error
          ? error.message
          : "Unable to get a response right now.";

      setMessages((current) => [
        ...current,
        createMessage("assistant", `I couldn't answer that just now. ${fallback}`),
      ]);
    } finally {
      requestInFlight.current = false;
      setIsPending(false);
    }
  }

  function handleComposerKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <>
      <ChatPanel
        draft={draft}
        isOpen={isOpen}
        isPending={isPending}
        messages={messages}
        onChangeDraft={setDraft}
        onClose={() => setIsOpen(false)}
        onKeyDown={handleComposerKeyDown}
        onSubmit={() => void sendMessage()}
      />

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`fixed bottom-6 right-6 z-40 inline-flex h-16 w-16 items-center justify-center rounded-full border border-teal-300/30 bg-[linear-gradient(135deg,#1dd3b0,#1098ad)] text-white shadow-[0_20px_50px_rgba(16,152,173,0.35)] transition-all hover:scale-[1.03] hover:shadow-[0_24px_60px_rgba(16,152,173,0.42)] ${
          isOpen ? "pointer-events-none scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        aria-label="Open contract chat"
      >
        <MessageCircleMore size={28} strokeWidth={2.1} />
      </button>
    </>
  );
}
