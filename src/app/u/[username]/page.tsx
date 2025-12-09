"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { useCompletion } from "@ai-sdk/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import * as z from "zod";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";

const SEPARATOR = "||";

const parseMessages = (messageString?: string): string[] => {
  if (!messageString) return [];
  return messageString
    .split(SEPARATOR)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.length > 300 ? s.slice(0, 300).trim() + "…" : s));
};

const initialSuggestions =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

// client-side prompt used when calling the useCompletion hook
const SUGGEST_PROMPT =
  "Generate three open-ended, friendly, and non-sensitive questions for a public anonymous messaging platform. " +
  "Return them as a single string separated by '||'. Example: \"What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?\"";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  // AI completion hook
  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
    error: suggestError,
  } = useCompletion({
    api: "/api/suggest-messages",
    initialCompletion: initialSuggestions,
  });

  // debug: log completion updates
  useEffect(() => {
    console.log("useCompletion - completion changed:", {
      completion,
      type: typeof completion,
      length: completion?.length ?? 0,
    });
  }, [completion]);

  // also log errors
  useEffect(() => {
    if (suggestError) console.error("suggestError:", suggestError);
  }, [suggestError]);

  // keep suggestions in state so they persist in the UI
  const [suggestions, setSuggestions] = useState<string[]>(
    parseMessages(initialSuggestions)
  );

  // keep a loading state for form submission
  const [isLoading, setIsLoading] = useState(false);

  // Form handler
  const form = useForm<z.infer<typeof MessageSchema>>({
    resolver: zodResolver(MessageSchema),
    defaultValues: {
      content: "",
    },
  });

  const messageContent = form.watch("content");

  const handleSuggestionClick = (msg: string) => {
    form.setValue("content", msg);
  };

  // Submit handler
  const onSubmit = async (data: z.infer<typeof MessageSchema>) => {
    setIsLoading(true);

    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      toast.success(response.data.message || "Message sent successfully");

      form.reset({ content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data?.message || "Failed to send message"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // direct fetch helper (fallback)
  const fetchSuggestionsDirectly = async (prompt: string) => {
    try {
      const res = await fetch("/api/suggest-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("Direct fetch failed:", res.status, body);
        return null;
      }

      const text = await res.text();
      console.log("Direct /api/suggest-messages text:", text);
      return text;
    } catch (err) {
      console.error("fetchSuggestionsDirectly error:", err);
      return null;
    }
  };

  // required by @ai-sdk/react: call complete(prompt), but also fall back to direct fetch
  const fetchSuggestedMessages = async () => {
    // trigger the hook (non-blocking)
    try {
      complete(SUGGEST_PROMPT);
    } catch (err) {
      console.warn("complete() error:", err);
    }

    // If hook already populated completion with meaningful text, use it
    if (completion && completion.trim() && completion !== initialSuggestions) {
      const parsed = parseMessages(completion);
      if (parsed.length > 0) {
        setSuggestions(parsed);
        return;
      }
    }

    // Fallback: call the API route directly
    const text = await fetchSuggestionsDirectly(SUGGEST_PROMPT);
    if (text) {
      const parsed = parseMessages(text);
      if (parsed.length > 0) {
        setSuggestions(parsed);
        return;
      }
    }

    console.warn("No suggestions returned from hook or direct fetch — keeping defaults.");
  };

  // update suggestions when the model returns completion (keeps behavior if hook works later)
  useEffect(() => {
    if (!completion) return;
    const parsed = parseMessages(completion);
    if (parsed.length > 0) setSuggestions(parsed);
  }, [completion]);

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>

      {/* Message Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit button */}
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={!messageContent || isLoading}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      {/* Suggested Messages */}
      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            disabled={isSuggestLoading}
          >
            {isSuggestLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating…
              </>
            ) : (
              "Suggest Messages"
            )}
          </Button>
          <p>Click a message below to select it.</p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>

          <CardContent className="flex flex-col space-y-4">
            {suggestError ? (
              <p className="text-red-500">{suggestError.message}</p>
            ) : suggestions.length === 0 ? (
              <p className="text-muted-foreground">No suggestions available.</p>
            ) : (
              suggestions.map((msg, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left"
                  onClick={() => handleSuggestionClick(msg)}
                >
                  {msg}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      {/* CTA */}
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href="/sign-up">
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}
