"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please complete all fields.");
      return;
    }
    toast.success("Message sent. Our team will contact you shortly.");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        placeholder="Your name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Textarea
        placeholder="Your message"
        rows={5}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <Button type="submit">Send message</Button>
    </form>
  );
}
