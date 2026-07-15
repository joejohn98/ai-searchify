"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  ArrowUpRight,
  Globe2,
  LoaderCircle,
  Plus,
  Search,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";

const EXAMPLE_PROMPTS = [
  "Who are the top scorers at FIFA World Cup 2026?",
  "What are the biggest AI breakthroughs in 2026?",
  "What are the latest developments in quantum computing?",
];

function BrandMark({ className = "h-5 w-5" }: { className?: string }) {
  return <Sparkles aria-hidden="true" className={className} strokeWidth={2.25} />;
}

function AssistantAvatar({ small = false }: { small?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 ${
        small ? "h-8 w-8" : "h-10 w-10"
      }`}
    >
      <Search aria-hidden="true" className={small ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2.25} />
    </div>
  );
}

function Sidebar({ onNewChat }: { onNewChat: () => void }) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-[#111827] p-5 text-white md:flex">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-400/20">
          <BrandMark />
        </div>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-white">Research Agent</p>
          <p className="mt-0.5 text-xs text-slate-400">Search with confidence</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onNewChat}
        className="mt-9 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-4 text-sm font-medium text-slate-100 transition-colors hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]"
      >
        <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
        New chat
      </button>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="mb-3 flex items-center gap-2 text-indigo-300">
          <Globe2 aria-hidden="true" className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">Web research</span>
        </div>
        <p className="text-sm leading-6 text-slate-400">
          Get current answers grounded in information from across the web.
        </p>
      </div>
    </aside>
  );
}

function EmptyState({ onPromptClick }: { onPromptClick: (prompt: string) => void }) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-12 sm:px-6">
      <div className="w-full max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
          <BrandMark className="h-8 w-8" />
        </div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          <Globe2 aria-hidden="true" className="h-3.5 w-3.5" />
          Web-powered answers
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          What would you like to explore?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
          Ask a question and I&apos;ll search the web to find a clear, current answer.
        </p>

        <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onPromptClick(prompt)}
              className="group flex min-h-32 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm leading-5 text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <span>{prompt}</span>
              <ArrowUpRight
                aria-hidden="true"
                className="mt-5 h-4 w-4 text-slate-300 transition-colors group-hover:text-indigo-500"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3" role="status" aria-live="polite">
      <AssistantAvatar small />
      <div className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
        <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
        <span>Searching the web...</span>
      </div>
    </div>
  );
}

function getTextFromParts(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export default function Home() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isStreamingLastMessage =
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    (status === "streaming" || status === "submitted");

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-950">
      <Sidebar onNewChat={handleNewChat} />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <BrandMark className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Research Agent</p>
            <p className="text-xs text-slate-500">Web-powered answers</p>
          </div>
        </header>

        {messages.length === 0 ? (
          <EmptyState onPromptClick={handlePromptClick} />
        ) : (
          <div className="flex-1 overflow-y-auto" aria-live="polite" aria-busy={isLoading}>
            <div className="mx-auto max-w-3xl space-y-2 py-6 sm:py-8">
              {messages.map((message) => {
                const text = getTextFromParts(message.parts);
                const isUser = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 px-4 py-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && <AssistantAvatar small />}

                    <div
                      className={`max-w-[min(82%,42rem)] rounded-2xl px-4 py-3 shadow-sm ${
                        isUser
                          ? "rounded-br-md bg-indigo-600 text-white shadow-indigo-600/10"
                          : "rounded-tl-md border border-slate-200/80 bg-white text-slate-800"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm leading-6">{text}</p>
                      ) : (
                        <div className="text-sm leading-6 [&_a]:font-medium [&_a]:text-indigo-600 [&_a]:underline-offset-2 hover:[&_a]:underline [&_h1]:mb-3 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
                          <ReactMarkdown
                            components={{
                              a: ({ href, children }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer">
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                        <UserRound aria-hidden="true" className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && !isStreamingLastMessage && <ThinkingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <div className="border-t border-slate-200/80 bg-white/90 px-4 pb-4 pt-3 backdrop-blur sm:px-6">
          <form
            onSubmit={handleSubmit}
            aria-label="Ask the research agent"
            className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-shadow focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10"
          >
            <TextareaAutosize
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              aria-label="Research question"
              minRows={1}
              maxRows={8}
              disabled={isLoading}
              className="min-h-10 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              aria-label="Send question"
              title="Send question"
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              <Send aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </form>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-slate-400">
            Enter to send · Shift + Enter for a new line · Verify important information.
          </p>
        </div>
      </main>
    </div>
  );
}
