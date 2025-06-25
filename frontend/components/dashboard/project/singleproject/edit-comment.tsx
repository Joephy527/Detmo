import React, { useState } from 'react';
import { PencilLine } from 'lucide-react';
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogContent,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import {
    FormItem,
    Form,
    FormControl,
    FormMessage,
    FormField,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { CommentType } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getChangedValues } from '@/lib/utils';
import { editComment } from '@/actions/projects';
import toast from 'react-hot-toast';
import { Spinner } from '@chakra-ui/react';

const formSchema = z.object({
    Comment: z.string().min(1, {
        message: 'Comment must be at least 1 characters.',
    }),
    CommentDate: z.string(),
    CommentID: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditComment({
    data,
    project_id,
}: {
    data: Pick<CommentType, 'Comment' | 'CommentID' | 'CommentDate'>;
    project_id: string;
}) {
    const [open, setOpen] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Comment: data.Comment,
            CommentDate: data.CommentDate || '',
            CommentID: data.CommentID || '',
        },
    });

    const onSubmit = async (values: FormValues) => {
        const changed = getChangedValues(data, values);
        if (changed) {
            const res = await editComment(
                {
                    Comment: values.Comment,
                    CommentDate: values.CommentDate,
                    CommentID: data.CommentID,
                },
                project_id
            );
            if (res?.success) {
                toast.success('Comment updated successfully');
                setOpen(false);
            } else {
                toast.error('Something went wrong!');
            }
        }
    };
    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <button className="outline-0 mt-1">
                        <PencilLine
                            strokeWidth={1}
                            className="text-primary"
                            size={16}
                        />
                    </button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="font-[500]">
                            Edit Comment
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            className="grid gap-4 py-4"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <FormField
                                control={form.control}
                                name="Comment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter comment"
                                                className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* <FormItem>
                                <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                    Comment
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...form.register('Comment')}
                                        placeholder="Enter comment"
                                        type="text"
                                        className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem> */}

                            <div className="flex justify-end gap-5 mt-5">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="font-[400] px-10"
                                        onClick={() => form.reset()}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    className="font-[400] px-14"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? (
                                        <Spinner />
                                    ) : (
                                        'Save'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
