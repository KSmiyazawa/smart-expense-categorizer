"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Expense } from "./ExpenseTable";

interface ReceiptUploadProps {
    handleParsedData: (expense: Expense) => void;
}

export default function ReceiptUpload({ handleParsedData }: ReceiptUploadProps) {

    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsUploading(true);
        
        const form = e.currentTarget;
        const input = form.querySelector('input[type="file"]') as HTMLInputElement | null;

        if (!input || !input.files || input.files.length === 0) {
            setError("No file selected.");
            setIsUploading(false);
            return;
        }
        
        const file = input.files[0];
        
        if (file.size > 1024 *  1024) {
            setError("File size exceeds the maximum size limit.");
            setIsUploading(false);
            return;
        }
        
        try {
            const formData = new FormData(form); 
            const OCRResponse = await fetch("api/ocr", {
                method: "POST",
                body: formData,
            });

            const OCRData = await OCRResponse.json();
            const lines = OCRData.ParsedResults[0].TextOverlay.Lines;
            const cleanedLines = lines.map((line) => line.LineText)

            const AIResponse = await fetch('/api/gpt', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cleanedLines }),
            });

            const data = await AIResponse.json();
            const parsedData = JSON.parse(data.result);
            handleParsedData(parsedData);
        } catch (error) {
            setError("Failed to upload or parse the file.");
            console.error(error, "Failed to upload or parse the file.")
        } finally {
            setIsUploading(false);
        }
    }
    
    return (
        <form className="flex gap-3 mb-5" onSubmit={handleUpload}>
            <div className="flex-col">
                <Input id="picture" type="file" name="file" accept="image/*" />
                <p className="text-xs ml-2">Maximum upload file size: 1 MB</p>
            {error && <p className="text-xs ml-2 text-red-700">{error}</p>}
            </div>
            <Button variant="default" type="submit">{isUploading ? "Uploading..." : "Upload Receipt"}</Button>
        </form>
    )
}