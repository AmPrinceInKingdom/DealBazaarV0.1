"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};

const CHAT_STORAGE_KEY = "deal-bazaar-customer-chat-v1";
const MAX_MESSAGES = 80;

const initialMessages: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "bot",
    text: "Hello! Deal Bazaar 24/7 support is here. How can I help you today?",
  },
  {
    id: "welcome-2",
    role: "bot",
    text: "You can ask about orders, shipping, payments, refunds, or account help.",
  },
];

const quickReplies = [
  "Track my order",
  "Shipping time",
  "Payment help",
  "Refund policy",
];

function buildBotReplyFallback(input: string) {
  const text = input.toLowerCase();

  if (text.includes("track") || text.includes("order status") || text.includes("order")) {
    return "To track an order, go to My Account > Orders and open the order details page. If payment is under review, status updates after verification.";
  }

  if (text.includes("ship") || text.includes("delivery") || text.includes("arrive")) {
    return "Shipping usually starts within 2-5 business days after payment verification. Delivery time depends on destination and customs.";
  }

  if (text.includes("refund") || text.includes("return") || text.includes("cancel")) {
    return "You can review refund terms in the Refund Policy page. If you need help with a specific order, share the order number and we can guide you.";
  }

  if (text.includes("payment") || text.includes("bank") || text.includes("card")) {
    return "Bank transfer is currently active with payment-proof upload. Card payment UI is available, but full gateway charging is coming soon.";
  }

  if (text.includes("seller") || text.includes("sell")) {
    return "You can request seller access from My Account > Profile. Admin can review and approve your seller account request.";
  }

  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    return "Hi! I am ready to help. Ask anything about products, checkout, orders, or account support.";
  }

  return "I can help with orders, shipping, payments, refunds, and account setup. You can also use the Contact page for direct human follow-up.";
}

type ApiHistoryMessage = {
  role: "user" | "assistant";
  text: string;
};

export function CustomerChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") {
      return initialMessages;
    }

    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!saved) {
        return initialMessages;
      }

      const parsed = JSON.parse(saved) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(-MAX_MESSAGES);
      }
    } catch {
      return initialMessages;
    }

    return initialMessages;
  });
  const nextIdRef = useRef(messages.length + 3);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping, isOpen]);

  const sendMessage = async (rawText?: string) => {
    const nextText = (rawText ?? input).trim();
    if (!nextText) {
      return;
    }

    setInput("");
    const userId = `user-${nextIdRef.current++}`;
    const userMessage: ChatMessage = {
      id: userId,
      role: "user",
      text: nextText,
    };

    setMessages((prev) => [...prev.slice(-MAX_MESSAGES + 2), userMessage]);
    setIsTyping(true);

    const historyForApi: ApiHistoryMessage[] = messages
      .slice(-8)
      .map((message) => ({
        role: message.role === "bot" ? "assistant" : "user",
        text: message.text,
      }));

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: nextText,
          history: historyForApi,
        }),
      });

      const payload = (await response.json()) as { reply?: string };
      const botText =
        payload.reply?.trim() || buildBotReplyFallback(nextText);

      const reply: ChatMessage = {
        id: `bot-${nextIdRef.current++}`,
        role: "bot",
        text: botText,
      };
      setMessages((prev) => [...prev.slice(-MAX_MESSAGES + 2), reply]);
    } catch {
      const reply: ChatMessage = {
        id: `bot-${nextIdRef.current++}`,
        role: "bot",
        text: buildBotReplyFallback(nextText),
      };
      setMessages((prev) => [...prev.slice(-MAX_MESSAGES + 2), reply]);
    } finally {
      setIsTyping(false);
    }
  };

  const messageCount = useMemo(
    () => messages.filter((message) => message.role === "user").length,
    [messages],
  );

  return (
    <>
      {isOpen ? (
        <section className="fixed bottom-24 left-3 right-3 z-[70] flex max-h-[min(72vh,560px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:left-auto sm:right-5 sm:w-[360px]">
          <header className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div>
              <p className="text-sm font-bold">Deal Bazaar Support</p>
              <p className="text-xs opacity-90">24/7 customer service bot</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              onClick={() => setIsOpen(false)}
              aria-label="Close support chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-3 text-foreground"
          >
            {messages.map((message) => (
              <article
                key={message.id}
                className={cn(
                  "max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-6",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground shadow-sm",
                )}
              >
                {message.text}
              </article>
            ))}
            {isTyping ? (
              <article className="inline-flex max-w-[86%] rounded-2xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                Typing...
              </article>
            ) : null}
          </div>

          <div className="border-t border-border bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="mb-2 flex flex-wrap gap-2">
              {quickReplies.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    void sendMessage(item);
                  }}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Type your message..."
              />
              <Button
                size="icon"
                onClick={() => {
                  void sendMessage();
                }}
                aria-label="Send message"
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Automated support active. Messages sent: {messageCount}
            </p>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-5 right-5 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-primary/20 transition hover:scale-105 hover:bg-primary/90"
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}
