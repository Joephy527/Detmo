import React, { useRef, useState } from 'react';

import {
    Alert,
    AlertDescription,
    AlertTitle,
    Progress,
} from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Upload, UploadIcon } from 'lucide-react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { uploadCSV } from '@/actions/spend-analysis';
import toast from 'react-hot-toast';

const UploadCSVDialog = ({ text }: { text?: string }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Simulate progress for better UX
    const simulateProgress = () => {
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 5;
            });
        }, 100);

        return interval;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Validate file is a CSV
            if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
                setError('Only CSV files are allowed');
                setFile(null);
                e.target.value = '';
                return;
            }

            setFile(selectedFile);
            setError(null);
            setSuccess(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a CSV file to upload');
            return;
        }

        setIsUploading(true);
        setError(null);
        setSuccess(null);

        // Start progress simulation
        const progressInterval = simulateProgress();

        try {
            // Create FormData and append necessary fields
            const formData = new FormData();
            formData.append('file', file);

            // Use your existing uploadCSV action or the new one
            const result = await uploadCSV(formData);

            clearInterval(progressInterval);

            if (result.success) {
                setUploadProgress(100);
                setSuccess('PO data uploaded successfully');
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                toast.success('PO data uploaded successfully');

                // Close dialog after successful upload with a short delay
            } else {
                setUploadProgress(0);
                setError(result.error || 'Failed to upload CSV');
                toast.error(result.error || 'Failed to upload CSV');
            }
            setTimeout(() => {
                setIsDialogOpen(false);
                window.location.reload();
            }, 500);
        } catch (err) {
            clearInterval(progressInterval);
            setUploadProgress(0);
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];

            // Validate file is a CSV
            if (!droppedFile.name.toLowerCase().endsWith('.csv')) {
                setError('Only CSV files are allowed');
                return;
            }

            setFile(droppedFile);
            setError(null);
            setSuccess(null);
        }
    };

    // Reset state when dialog opens/closes
    const handleDialogChange = (open: boolean) => {
        if (!open) {
            // Reset state when dialog closes
            setFile(null);
            setError(null);
            setSuccess(null);
            setUploadProgress(0);
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
        setIsDialogOpen(open);
    };
    return (
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button size={'sm'} className="mx-auto px-7 h-[35px]">
                    {' '}
                    <UploadIcon className="w-5 h-5 mr-2" />{' '}
                    {text ?? 'Upload POs'}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-[500]">
                        {text ?? 'Upload POs'}
                    </DialogTitle>
                </DialogHeader>
                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert
                        variant="default"
                        className="mt-4 bg-green-50 border-green-200"
                    >
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">
                            Success
                        </AlertTitle>
                        <AlertDescription className="text-green-700">
                            {success}
                        </AlertDescription>
                    </Alert>
                )}
                <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors mt-4"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                        disabled={isUploading}
                    />

                    <Upload className="mx-auto h-12 w-12 text-gray-400" />

                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {file ? file.name : `Select a CSV file to upload`}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        {file
                            ? `Size: ${(file.size / 1024).toFixed(2)} KB`
                            : 'Or drag and drop CSV file here'}
                    </p>
                </div>

                {isUploading && (
                    <div className="mt-4 space-y-2">
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-sm text-gray-500 text-center">
                            {uploadProgress}% Uploading...
                        </p>
                    </div>
                )}

                <div className="flex justify-end gap-5 mt-5">
                    <DialogClose asChild>
                        <Button
                            variant={'secondary'}
                            className="font-[400] px-10"
                        >
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button
                        className="font-[400] px-14"
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                    <p className="font-medium mb-1">CSV Requirements:</p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>File must be in CSV format</li>
                        <li>Headers should match the expected format</li>
                        <li>Maximum file size: 10MB</li>
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UploadCSVDialog;
