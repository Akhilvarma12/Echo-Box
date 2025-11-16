"use client";

import React, { useState } from "react";
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

const parseMessages = (messageString: string): string[] => {
  return messageString ? messageString.split(SEPARATOR) : [];
};

const initialSuggestions =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

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

  // Form handler
  const form = useForm<z.infer<typeof MessageSchema>>({
    resolver: zodResolver(MessageSchema),
    defaultValues: {
      content: "",
    },
  });

  const messageContent = form.watch("content");
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchSuggestedMessages = () => complete("");

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
            Suggest Messages
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
            ) : (
              parseMessages(completion).map((msg, index) => (
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
