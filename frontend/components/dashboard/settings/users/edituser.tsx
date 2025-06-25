import React, { useState } from 'react';
import { PencilLine } from 'lucide-react';
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogContent,
    DialogTrigger,
    DialogDescription,
    DialogClose,
} from '@/components/ui/dialog';
import {
    FormItem,
    FormLabel,
    Form,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UserType } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getChangedValues } from '@/lib/utils';
import { updateUser, updateUserRole } from '@/actions/settings';
import toast from 'react-hot-toast';

const formSchema = z.object({
    UserName: z
        .string()
        .min(2, { message: 'Name must be at least 2 characters' }),
    Email: z.string().email({ message: 'Please enter a valid email address' }),
    Role: z.enum(['Admin', 'User'], {
        required_error: 'Please select a permission level',
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Edituser({ data }: { data: UserType }) {
    const [open, setOpen] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            UserName: data.UserName || '',
            Email: data.Email || '',
            Role: data.Role as 'Admin' | 'User',
        },
    });

    const onSubmit = async (values: FormValues) => {
        const changed = getChangedValues(data, values);
        let success = false;
        if (changed.Role) {
            // use update user role api
            const res = await updateUserRole(data.ClerkID, changed.Role);
            if (res?.success) {
                toast.success('User role updated successfully');
                success = true;
            } else {
                toast.error('Something went wrong editing role!');
            }
        }
        if (changed.UserName || changed.Email) {
            // use update user api
            const res = await updateUser({ ...data, ...changed });

            if (res?.success) {
                toast.success('User updated successfully');
                success = true;
            } else {
                toast.error('Something went wrong editing user!');
            }
        }
        if (success) {
            setOpen(false);
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
                            Edit user
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            className="grid gap-4 py-4"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <FormItem>
                                <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...form.register('UserName')}
                                        placeholder="Enter user name"
                                        type="text"
                                        className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            <FormItem>
                                <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                    Email
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...form.register('Email')}
                                        placeholder="Enter user email"
                                        type="email"
                                        className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>

                            <FormItem>
                                <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                    Permission
                                </FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) =>
                                            form.setValue(
                                                'Role',
                                                value as 'Admin' | 'User'
                                            )
                                        }
                                        defaultValue={form.getValues('Role')}
                                    >
                                        <SelectTrigger className="w-full h-[40px] bg-[#F6F6F6]">
                                            <SelectValue placeholder="Select permission" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Admin">
                                                Admin
                                            </SelectItem>
                                            <SelectItem value="User">
                                                User
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
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
                                    {form.formState.isSubmitting
                                        ? 'Saving...'
                                        : 'Save'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
