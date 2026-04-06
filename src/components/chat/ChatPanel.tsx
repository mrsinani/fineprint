"use client";

import { Loader2, Send, X } from "lucide-react";
import { ChatMessage, type ChatMessageItem } from "@/components/chat/ChatMessage";

interface ChatPanelProps {
  draft: string;
  isOpen: boolean;
  isPending: boolean;
  messages: ChatMessageItem[];
  onChangeDraft: (value: string) => void;
  onClose: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md border border-navy-700 bg-navy-850 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-teal-300 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-teal-300 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-teal-300" />
        </div>
      </div>
    </div>
  );
}

export function ChatPanel({
  draft,
  isOpen,
  isPending,
  messages,
  onChangeDraft,
  onClose,
  onKeyDown,
  onSubmit,
}: ChatPanelProps) {
  return (
    <aside
      className={`fixed bottom-6 right-6 z-50 flex h-[min(72vh,720px)] w-[min(calc(100vw-2rem),420px)] flex-col overflow-hidden rounded-[28px] border border-navy-700 bg-[linear-gradient(180deg,rgba(9,19,34,0.96),rgba(11,27,48,0.98))] shadow-[0_24px_80px_rgba(4,12,24,0.45)] backdrop-blur-xl transition-all duration-300 ${
        isOpen
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-300">
            Contract chat
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold text-white">
            Ask about this contract
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-navy-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          aria-label="Close contract chat"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-navy-300">
            Ask a follow-up about the clauses, summary, or practical risks in this document.
          </div>
        ) : null}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isPending ? <TypingIndicator /> : null}
      </div>

      <div className="border-t border-white/10 bg-navy-950/50 px-4 py-4">
        <div className="rounded-[22px] border border-white/10 bg-white/5 p-2">
          <textarea
            value={draft}
            onChange={(event) => onChangeDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about this contract..."
            rows={3}
            className="min-h-[84px] w-full resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-navy-400"
          />

          <div className="mt-2 flex items-center justify-between px-2 pb-1">
            <p className="text-[11px] text-navy-400">Enter to send, Shift+Enter for newline</p>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isPending || draft.trim().length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-teal-500/40 disabled:text-white/70"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Send
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
