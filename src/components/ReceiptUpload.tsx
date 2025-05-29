"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { parseJapaneseDate } from "@/lib/parseJapaneseDate";
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
            const response = await fetch("api/ocr", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            const lines = data.ParsedResults[0].TextOverlay.Lines;

            const transaction = {
                date: "",
                merchant: lines[0].LineText || "",
                amount: "",
                category: "No category selected."
            };
    
            for (let i = 0; i < lines.length; i++) {
                const lineText = lines[i].LineText;
                console.log(lineText)
                const japaneseDate = parseJapaneseDate(lineText);
    
                if (japaneseDate) {
                    transaction.date = japaneseDate;
                }
                
                if (lineText === "合計") {
                    let maxAmount = 0;

                    for (let j = i + 1; j < i + 10 && j < lines.length; j++) {
                        const lineText = lines[j].LineText;
                        const value = Number(lineText.replace(/[,¥.]/g, '')); // Remove commas and yen sign
    
                        if (!isNaN(value) && value > maxAmount) {
                            maxAmount = value;
                        }

                        if (!isNaN(value) && value < 0) {
                            maxAmount =- value;
                        }
                    }
    
                    transaction.amount = `¥ ${maxAmount.toLocaleString('ja-JP')}`;
                    handleParsedData(transaction);
                    return;
                }
            }
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