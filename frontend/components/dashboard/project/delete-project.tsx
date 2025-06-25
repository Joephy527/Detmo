import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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
import { deleteProject } from '@/actions/projects';
import { Spinner } from '@chakra-ui/react';

export default function DeleteProject({ project_id }: { project_id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const deleteAction = async () => {
        setIsDeleting(true);
        const response = await deleteProject(project_id);
        setIsDeleting(false);
        if (response?.success) {
            toast.success('Project deleted successfully');
            router.refresh();
        } else {
            toast.error('Something went wrong');
        }
    };
    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <button className="outline-0 mt-1">
                        <Trash2
                            strokeWidth={1}
                            className="text-primary"
                            size={16}
                        />
                    </button>
                </DialogTrigger>

                <DialogContent className="w-full sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="font-[500]">
                            Delete Project
                        </DialogTitle>
                        <DialogDescription className="font-[500]">
                            Are you sure you want to delete this project?
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
                            variant={'default'}
                            onClick={deleteAction}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Spinner /> : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
