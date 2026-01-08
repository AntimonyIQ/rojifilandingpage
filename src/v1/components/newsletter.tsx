"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/v1/components/ui/button";
import { Input } from "@/v1/components/ui/input";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Defaults from "@/v1/defaults/defaults";
import { toast } from "sonner";
import { session, SessionData } from "@/v1/session/session";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const sd: SessionData = session.getUserData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
    if (!isValidEmail(email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`${Defaults.API_BASE_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          ...Defaults.HEADERS,
          "Content-Type": "application/json",
          "x-rojifi-handshake": sd.client.publicKey,
          "x-rojifi-deviceid": sd.deviceid,
        },
        body: JSON.stringify({
          email: email,
        }),
      });
      const data = await res.json();
      if (data.status === "error") throw new Error(data.message || data.error);
      if (data.status === "success") {
        setIsSuccess(true);
        toast.success("Newsletter subscription successful!");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container">
        <motion.div
          className="mx-auto max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Register for our newletter
            </h2>
            <p className="mt-2 text-muted-foreground">
              Stay up-to-date on promotions, discount, offers and opportunities
              in Rojifi
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="example@email.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-white"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          {isSuccess && (
            <motion.p
              className="mt-2 text-center text-sm text-green-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Thank you for subscribing to our newsletter!
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
