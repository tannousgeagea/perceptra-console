import { useState } from "react";

function useSelectFile(): { files: File[]; images: string[]; handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void } {
    const [images, setImages] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newFiles: File[] = Array.from(e.target.files as FileList);
        const fileURLs: string[] = newFiles.map(file => URL.createObjectURL(file));

        setImages(prevImages => [...prevImages, ...fileURLs]);
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
        e.target.value = '';
    };

    return { files, images, handleFileSelect };
};

export default useSelectFile;