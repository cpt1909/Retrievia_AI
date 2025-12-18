"use client";
import { useState } from "react";

export default function Ask() {

    const [loading, setLoading] = useState<boolean>(false);

    const [errorCode, setErrorCode] = useState<number | null>(null);
    const errorMessage: Record<number, string> = {
        400: "Bad Request",
        422: "No file selected",
        413: "File size exceeds the limit",
        415: "Unsupported file type",
        500: "Internal Server Error",
        503: "Service Unavailable",
        550: "The file either is corrupted or has no readable text."
    }

    const API_URL: string = process.env.NEXT_PUBLIC_PROD_API_URL ?? "http://localhost:8000";

    const [showUploadSection, setShowUploadSection] = useState<boolean>(true);
    const [file, setFile] = useState<File | null>();
    const maxFileSize: number = 10 * 1024 * 1024;

    async function handleUpload(){
        if (!file){
            setErrorCode(422);
            return;
        };

        try{
            setLoading(true);
            const form: FormData = new FormData();
            form.append("file", file);

            const res = await fetch(`${API_URL}/upload`, {
                method: "POST",
                body: form,
            });

            const data = await res.json();
            if(res.ok){
                setFileUId(data.uid);
                alert("File uploaded successfully !!");
                setShowUploadSection(false);
                setShowAskSection(true);
            }else{
                setErrorCode(res.status);
            };
            setLoading(false);
        }catch(e){
            setLoading(false);
            setErrorCode(503);
        }
    }

    const [fileUId, setFileUId] = useState<string>("");
    const [showAskSection, setShowAskSection] = useState<boolean>(false);
    const [query, setQuery] = useState<string>("");

    async function handleAsk(){
        if (!query){
            setErrorCode(400);
            return;
        };

        try{
            setLoading(true);
            const form: FormData = new FormData();
            form.append("query", query);
            setQuery("");
            form.append("uid", fileUId);
            setChatHistory(prev => [...prev, {role: "You", content: query}]);

            const res = await fetch(`${API_URL}/query`, {
                method: "POST",
                body: form,
            });

            const data = await res.json();
            if(res.ok){
                setChatHistory(prev => [...prev, {role: "Bot", content: data.reply}]);
            }else{
                setErrorCode(res.status);
            };
            setLoading(false);
        }catch(e){
            setLoading(false);
            setErrorCode(503);
        }
    }

    const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);

    return (
    <div>
        <div className="header w-1/1 mb-4 p-4">
            <p className="text-primary text-center font-semibold text-4xl">Retrievia AI</p>
        </div>

        {loading && (
            <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                <div className="flex flex-col items-center">
                    <div className="h-14 w-14 border-4 rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg font-medium">Loading...</p>
                </div>
            </div>
        )}

        {errorCode && (
            <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                <div className="border-2 rounded-2xl p-3 flex flex-col items-center justify-center">
                    <h3>Error Code: {errorCode}</h3>
                    <h4>{errorMessage[errorCode]}</h4>
                    <button
                        onClick={() => {
                            if (errorCode === 413 || errorCode === 415 || errorCode === 550){
                                setFile(null);
                            }
                            setErrorCode(null);
                        }}
                    >Close</button>
                </div>
            </div>
        )}

        {showUploadSection && (
            <section className="flex flex-col items-center">
                <label
                    htmlFor="fileInput"
                    className="block w-9/10 h-30 border-2 border-dashed rounded-3xl"
                >
                    <div className="flex h-full p-6 items-center gap-5">
                        <img src="file.svg" className="h-16" alt="file icon" />
                        {!file ?
                        <p> Select a file <br/>
                        .PDF, .DOCX, .TXT
                        </p> : <p>{file.name}</p>}
                    </div>
                </label>
                <input
                    className="hidden"
                    id="fileInput"
                    name="fileInput"
                    type="file"
                    accept=".pdf, .txt, .docx"
                    onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                            if(files[0].size > maxFileSize){
                                setErrorCode(413);
                                return;
                            }
                            
                            const fileExtension: string = files[0].name.split(".").pop()?.toLowerCase() ?? "";
                            const acceptedFileExtensions: string[] = ["pdf", "docx", "txt"];

                            if(!acceptedFileExtensions.includes(fileExtension)){
                                setErrorCode(415);
                                return;
                            }
                            setFile(files[0]);
                        }
                    }}
                />

                <div className="flex w-9/10 justify-around mt-6">
                    <button
                        className="w-60/100 h-12 rounded-xl font-medium"
                        onClick={() => {
                            handleUpload();
                        }}
                    >Submit</button>
                    
                    <button
                        className="w-30/100 h-12 rounded-xl font-medium"
                        onClick={() => {
                            setFile(null);
                        }}
                    >Clear</button>
                </div>

            </section>
        )}

        {chatHistory.length > 0 && (
        <div>
            {chatHistory.map((message, index) => (
                <div key={index}>
                    <p>{message.role}: {message.content}</p>
                </div>
            ))}
        </div>
        )}

        {showAskSection && (
        <section>
            <textarea
                placeholder="Ask your question here..."
                className="query h-32 w-3/4 border-2 rounded-md p-3 text-wrap resize-none overflow-y-auto"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                }}
            />
            <button
                type="submit"
                onClick={() => {
                    handleAsk();
                }}
            >Submit</button>

            {fileUId && (
                <div>
                    <p>File UId: {fileUId}</p>
                    <p>File Name: {file?.name}</p>
                </div>
            )}
        </section>
        )}
        
    </div>
);
}