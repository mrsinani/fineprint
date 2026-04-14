"use client";

export type ChatRole = "user" | "assistant";

export interface ChatMessageItem {
  id: string;
  role: ChatRole;
  content: string;
}

interface ChatMessageProps {
  message: ChatMessageItem;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-md bg-gold-600 text-white"
            : "rounded-bl-md border border-navy-700 bg-white text-navy-100"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
