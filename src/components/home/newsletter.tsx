"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    toast.success("Subscribed successfully.");
    setEmail("");
  };

  return (
    <section className="mt-14 rounded-3xl bg-primary p-8 text-primary-foreground">
      <h2 className="text-2xl font-extrabold sm:text-3xl">Stay ahead of every deal</h2>
      <p className="mt-2 text-sm text-primary-foreground/80">
        Get flash deal alerts, limited drops, and weekly product highlights.
      </p>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="border-white/40 bg-white/10 text-white placeholder:text-white/70"
        />
        <Button
          type="submit"
          className="bg-white text-primary hover:bg-white/90 sm:min-w-[170px]"
        >
          Subscribe
        </Button>
      </form>
    </section>
  );
}
