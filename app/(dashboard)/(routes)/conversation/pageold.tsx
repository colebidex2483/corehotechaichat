"use client";

import * as z from "zod";
import axios from "axios";
import { MessageSquare, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
// import { ChatCompletionRequestMessage }from "openai";
import { ChatCompletionMessageParam } from 'openai/resources'
import { BotAvatar } from "@/components/bot-avatar";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
// import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { Empty } from "@/components/ui/empty";
import { useProModal } from "@/hooks/use-pro-modal";

import { formSchema } from "./constants";

const ConversationPage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);
  const [accResponse, setAccResponse] = useState('');
  type ChunkData = string;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ""
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: ChatCompletionMessageParam = { role: "user", content: values.prompt };
      const newMessages = [...messages, userMessage];

      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (response.ok) {
        // Check for response body existence
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let done = false;

          const handleNewChunk: (chunkValue: ChunkData) => void = (chunkValue) => {
            try {
              const newMessage = JSON.parse(chunkValue); // Assuming JSON format
              setMessages((current) => [...current, newMessage]);
            } catch (error) {
              console.warn("Error parsing chunk:", error);
            }
          };

          while (!done) {
            const { value, done: chunkDone } = await reader.read();
            done = chunkDone;
            const chunkValue = decoder.decode(value);
            setAccResponse((current) => current + chunkValue);
            handleNewChunk(chunkValue); // Call for processing each chunk
          }
        } else {
          console.warn("No response body received from the API.");
        }
      } else {
        // Handle non-OK responses (e.g., status code errors)
        console.error("API request failed with status:", response.status);
      }

      form.reset();
    } catch (error: any) {
      // Handle other errors during the request
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      // ... (optional cleanup if needed)
      router.refresh();
    }
  }

  return (
    <div>
      <Heading
        title="Conversation"
        description="Our most advanced conversation model."
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="
                rounded-lg 
                border 
                w-full 
                p-4 
                px-3 
                md:px-6 
                focus-within:shadow-sm
                grid
                grid-cols-12
                gap-2
              "
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="How do I calculate the radius of a circle?"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
  {isLoading && ( // Display loading indicator while processing stream)
    <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
      <Loader2 className='h-4 w-4 animate-spin' />
    </div>
  )}
  {messages.length > 0 && !isLoading && ( // Display messages if any and not loading)
    <div className="flex flex-col-reverse gap-y-4">
      {messages.map((message) => (
        <div
        key={message?.role || Math.random().toString(36).substring(2, 15)}
          className={cn(
            "p-8 w-full flex items-start gap-x-8 rounded-lg",
            message.role === "user" ? "bg-white border border-black/10" : "bg-muted",
          )}
        >
          {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
          <p className="text-sm">
            {message.content}
          </p>
        </div>
      ))}
    </div>
  )}
  {messages.length === 0 && !isLoading && ( // Display "No conversation started" if no messages)
    <Empty label="No conversation started." />
  )}
</div>
      </div>
    </div>
  );
}

export default ConversationPage;

