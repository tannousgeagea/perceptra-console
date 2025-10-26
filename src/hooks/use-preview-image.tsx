import { useState } from "react";

const usePreviewImage = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = (): void => {
        setSelectedFile(null);
        setImagePreview(null);
    };

    return { selectedFile, imagePreview, handleFileChange, handleDelete };
}

export default usePreviewImage;