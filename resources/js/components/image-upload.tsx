import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ImageIcon, X, Upload } from 'lucide-react';

interface ImageUploadProps {
    value?: string | null;
    onChange?: (file: File | null) => void;
    onRemove?: () => void;
    accept?: string;
    maxSize?: number; // in MB
    className?: string;
    disabled?: boolean;
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    accept = 'image/jpeg,image/png,image/webp',
    maxSize = 2,
    className,
    disabled = false,
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = useCallback((file: File) => {
        setError(null);

        // Validate file type
        const validTypes = accept.split(',').map((t) => t.trim());
        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Please upload a JPG, PNG, or WebP image.');
            return;
        }

        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
            setError(`File size must be less than ${maxSize}MB.`);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        onChange?.(file);
    }, [accept, maxSize, onChange]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
        e.target.value = '';
    }, [handleFile]);

    const handleRemove = useCallback(() => {
        setPreview(null);
        setError(null);
        onChange?.(null);
        onRemove?.();
    }, [onChange, onRemove]);

    return (
        <div className={cn('space-y-2', className)}>
            {preview ? (
                <div className="relative inline-block">
                    <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 rounded-lg border object-cover"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -right-2 -top-2 size-6"
                        onClick={handleRemove}
                        disabled={disabled}
                    >
                        <X className="size-3" />
                    </Button>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                        disabled && 'cursor-not-allowed opacity-50',
                        !disabled && 'cursor-pointer hover:border-primary hover:bg-muted/50',
                    )}
                    onClick={() => !disabled && document.getElementById('image-upload-input')?.click()}
                >
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="rounded-full bg-muted p-3">
                            {isDragging ? (
                                <Upload className="size-6 text-primary" />
                            ) : (
                                <ImageIcon className="size-6 text-muted-foreground" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                {isDragging ? 'Drop image here' : 'Drop an image or click to upload'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                JPG, PNG, or WebP (max {maxSize}MB)
                            </p>
                        </div>
                    </div>
                    <input
                        id="image-upload-input"
                        type="file"
                        accept={accept}
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={disabled}
                    />
                </div>
            )}
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}
