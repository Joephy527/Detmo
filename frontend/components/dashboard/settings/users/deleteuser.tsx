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
import { deleteUser } from '@/actions/settings';

export default function Deleteuser({ user_id }: { user_id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteAction = async () => {
        setIsDeleting(true);
        const response = await deleteUser(user_id);
        setIsDeleting(false);
        if (response?.success) {
            toast.success('User deleted successfully');
            window.location.reload();
        } else {
            toast.error(`Something went wrong - Please try again later`);
        }
    };
    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <button className="outline-0">
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
                            Delete user
                        </DialogTitle>
                        <DialogDescription className="font-[500]">
                            Are you sure you want to delete this user?
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
