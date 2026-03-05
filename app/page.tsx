"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dynamic from "next/dynamic";

const MermaidDiagram = dynamic(() => import("@/components/MermaidDiagram"), { ssr: false });

export default function Home() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/generate" }),
  });

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  const markdownComponents = useMemo(() => ({
    h1: ({ children }: React.PropsWithChildren) => <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>,
    h2: ({ children }: React.PropsWithChildren) => <h2 className="text-base font-bold mt-3 mb-1">{children}</h2>,
    h3: ({ children }: React.PropsWithChildren) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
    p: ({ children }: React.PropsWithChildren) => <p className="mb-2 last:mb-0">{children}</p>,
    ul: ({ children }: React.PropsWithChildren) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
    ol: ({ children }: React.PropsWithChildren) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
    code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
      if (className === "language-mermaid") {
        return <MermaidDiagram chart={String(children)} />;
      }
      const isBlock = className?.includes("language-");
      return isBlock ? (
        <code className="block bg-zinc-200 dark:bg-zinc-700 rounded p-3 my-2 text-xs font-mono overflow-x-auto whitespace-pre" {...props}>
          {children}
        </code>
      ) : (
        <code className="bg-zinc-200 dark:bg-zinc-700 rounded px-1 py-0.5 text-xs font-mono" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }: React.PropsWithChildren) => <pre className="not-prose">{children}</pre>,
    a: ({ children, href }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} className="underline hover:opacity-75" target="_blank" rel="noopener noreferrer">{children}</a>,
    strong: ({ children }: React.PropsWithChildren) => <strong className="font-semibold">{children}</strong>,
    blockquote: ({ children }: React.PropsWithChildren) => <blockquote className="border-l-2 border-zinc-400 pl-3 italic my-2">{children}</blockquote>,
    table: ({ children }: React.PropsWithChildren) => (
      <div className="my-3 overflow-x-auto">
        <table className="w-full border-collapse text-xs">{children}</table>
      </div>
    ),
    thead: ({ children }: React.PropsWithChildren) => <thead className="bg-zinc-200 dark:bg-zinc-700">{children}</thead>,
    th: ({ children }: React.PropsWithChildren) => <th className="px-3 py-2 text-left font-semibold border border-zinc-300 dark:border-zinc-600">{children}</th>,
    td: ({ children }: React.PropsWithChildren) => <td className="px-3 py-2 border border-zinc-300 dark:border-zinc-600">{children}</td>,
    tr: ({ children }: React.PropsWithChildren) => <tr className="even:bg-zinc-50 dark:even:bg-zinc-800/50">{children}</tr>,
  }), []);

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-zinc-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-zinc-400 text-sm">How can I help you today?</p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-xs font-semibold text-white dark:text-zinc-900">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-sm whitespace-pre-wrap"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm"
                  }`}
                >
                  {m.parts.map((part, i) => {
                    if (part.type === "text") {
                      if (m.role === "user") return <span key={i}>{part.text}</span>;
                      return (
                        <Markdown
                          key={i}
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {part.text}
                        </Markdown>
                      );
                    }
                    return null;
                  })}
                </div>
                {m.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    U
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-4">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            disabled={isLoading}
            placeholder="Message…"
            className="flex-1 resize-none bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none disabled:opacity-50"
            style={{ minHeight: "1.25rem", maxHeight: "10rem" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-8 w-8 shrink-0 rounded-full"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-2 text-center text-xs text-zinc-400">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
