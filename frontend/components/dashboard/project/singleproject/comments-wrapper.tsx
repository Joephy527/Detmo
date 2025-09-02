"use client";

import { type FC, startTransition, use, useOptimistic } from "react";
import { Avatar, Spinner } from "@chakra-ui/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import EditComment from "./edit-comment";
import DeleteComment from "./delete-comment";
import { UserType } from "@/lib/types";
import { useUser } from "@clerk/nextjs";

interface Comment {
  CommentID: string;
  Comment: string;
  CommentDate: string;
  User: {
    UserName: string;
  };
}

interface Props {
  initialComments: Comment[];
  projectId: string;
  user_promise: Promise<UserType | null>;
}

const CommentsWrapper: FC<Props> = ({
  initialComments,
  projectId,
  user_promise,
}) => {
  // Set up optimistic state for comments
  const user = use(user_promise);
  const userName = user?.UserName ?? "Anonymous";

  const { user: clerkUser, isLoaded } = useUser();
  const role = clerkUser?.publicMetadata?.role as string;

  const [optimisticComments, addOptimisticComment] = useOptimistic<
    Comment[],
    Comment
  >(initialComments, (state, newComment) => [...state, newComment]);

  const formSchema = z.object({
    comment: z.string().min(1, {
      message: "Comment must be at least 1 character.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: { comment: string }) => {
    // Create an optimistic comment
    const optimisticComment: Comment = {
      CommentID: `temp-${Date.now()}`, // Temporary ID
      Comment: data.comment,
      CommentDate: new Date().toISOString().split("T")[0],
      User: {
        UserName: userName,
      },
    };

    // Add the optimistic comment to the UI immediately
    startTransition(() => {
      addOptimisticComment(optimisticComment);
    });

    // Reset the form
    form.resetField("comment");
    form.reset({ comment: "" });

    try {
      // Actually send the comment to the server
      const res = await createComment({
        Comment: data.comment,
        CommentDate: new Date().toISOString().split("T")[0],
        SourcingProjectID: projectId,
      });

      if (!res) {
        toast.error("Failed to post comment", { duration: 10000 });
      }
    } catch (error) {
      toast.error("Something went wrong", { duration: 10000 });
      console.error(error);
    }
  };

  return (
    <div className="rounded-[12px] bg-white p-4 md:p-5 lg:p-6 xl:px-9 h-full">
      <h1 className="pb-6 text-[20px] font-[700] text-[#121212]">
        Project Comments
      </h1>
      <hr />
      <div className="pt-6">
        {optimisticComments.map((chat) => (
          <div
            key={chat.CommentID}
            className="flex items-start gap-2 sm:gap-4 mb-5"
          >
            <div>
              <Avatar
                name={chat.User.UserName}
                size="sm"
                className="rounded-full border-2 border-gray-400 size-10"
              />
            </div>
            <div className="w-full">
              <div className="flex items-center justify-between w-full mb-3">
                <h1 className="text-[15px] font-[700] text-[#121212]">
                  {chat.User.UserName}
                </h1>
                <p className="text-[14px] font-[500] text-[#8A8A8A]">
                  {chat.CommentDate}
                </p>
              </div>
              <div
                className={`w-full ${
                  chat.CommentID.startsWith("temp-")
                    ? "bg-[#F0F7FF]"
                    : "bg-[#F3EFFE]"
                } rounded-[8px] py-4 px-4 text-[14px] font-[400] flex justify-between`}
              >
                {chat.Comment}
                {chat.CommentID.startsWith("temp-") ? (
                  <Spinner className="size-4 ml-2 text-blue-500" />
                ) : isLoaded && role && role.includes("admin") ? (
                  <div className="flex gap-6 items-center">
                    <EditComment data={chat} project_id={projectId} />
                    <DeleteComment
                      comment_id={chat.CommentID}
                      project_id={projectId}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Form {...form}>
        <form
          key={form.formState.submitCount}
          className="mt-4 pb-10"
          onSubmit={form.handleSubmit(onSubmit)}
        >
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
            disabled={form.formState.isSubmitting}
          >
            Post
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CommentsWrapper;
