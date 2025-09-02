"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/actions/projects";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const CommentPostForm = ({ project_id }: { project_id: string }) => {
  const formSchema = z.object({
    comment: z.string().min(1, {
      message: "Comment must be at least 1 characters.",
    }),
  });

  const onSubmit = async (data: any) => {
    const res = await createComment({
      Comment: data.comment,
      CommentDate: new Date().toISOString().split("T")[0],
      SourcingProjectID: project_id,
    });

    if (!res) {
      toast.error("Something went wrong", { duration: 10000 });
    }
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  return (
    <Form {...form}>
      <form className="mt-4 pb-10" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Write a message"
                  className="bg-[#F6F6F6] text-[14px] font-[400] py-4 text-[#8A8A8A] mb-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          variant="default"
          className="float-right px-10 py-3 rounded-[8px]"
          type="submit"
        >
          Post
        </Button>
      </form>
    </Form>
  );
};

export default CommentPostForm;
