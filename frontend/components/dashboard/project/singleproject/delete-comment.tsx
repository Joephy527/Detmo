import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Spinner } from '@chakra-ui/react';

import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogContent,
    DialogTrigger,
    DialogDescription,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteComment } from '@/actions/projects';

export default function DeleteComment({
    comment_id,
    project_id,
}: {
    comment_id: string;
    project_id: string;
}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [open, setOpen] = useState(false);
    const deleteAction = async () => {
        setIsDeleting(true);
        const response = await deleteComment(comment_id, project_id);
        setIsDeleting(false);
        if (response?.success) {
            toast.remove('Comment deleted successfully');
            setOpen(false);
        } else {
            toast.error(`Something went wrong - Please try again later`);
        }
    };
    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <button className="outline-0">
                        <Trash2
                            strokeWidth={2}
                            className="text-destructive"
                            size={16}
                        />
                    </button>
                </DialogTrigger>

                <DialogContent className="w-full sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="font-[500]">
                            Delete Comment
                        </DialogTitle>
                        <DialogDescription className="font-[500]">
                            Are you sure you want to delete this comment?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center sm:justify-end gap-5 mt-4">
                        <DialogClose asChild>
                            <Button
                                variant={'secondary'}
                                className="font-[400] px-10"
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            className="font-[400] px-14"
                            variant={'destructive'}
                            disabled={isDeleting}
                            onClick={deleteAction}
                        >
                            {isDeleting ? <Spinner /> : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
