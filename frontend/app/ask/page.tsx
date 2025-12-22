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

    const API_URL: string = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

    const [showUploadSection, setShowUploadSection] = useState<boolean>(true);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileExtension, setFileExtension] = useState<string | null>();
    const maxFileSize: number = 10 * 1024 * 1024;

    async function handleUpload(selectedFile: File){

        try{
            setLoading(true);
            const form: FormData = new FormData();
            form.append("file", selectedFile);

            const res = await fetch(`${API_URL}/fileUpload`, {
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
                setFileName(null);
            };
        }catch(e){
            setErrorCode(503);
            setFileName(null);
        }finally{
            setLoading(false);
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

            const res = await fetch(`${API_URL}/askQuery`, {
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
        <p className="tracking-tight text-primary text-center pt-4 pb-4 text-4xl md:text-5xl font-bold">Retrievia AI</p>

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
                            setErrorCode(null);
                        }}
                    >Close</button>
                </div>
            </div>
        )}

        {showUploadSection && (
            <section className="flex flex-col items-center mt-20">
                <p className="text-2xl font-bold">Ask your Docs</p>
                <p className="w-3/4 mt-2 text-justify">Select a file to ask questions and get clear, accurate, and context-aware answers.</p>
                <label
                    htmlFor="fileInput"
                    className="block w-3/4 min-h-24 bg-primary text-white rounded-3xl mt-16"
                >
                    {!fileName ?
                        <div className="h-1/1 flex flex-col justify-center gap-3 pt-4 pb-4">
                            <p className="text-center font-semibold text-3xl"> Select a file </p>
                            <p className="text-center">File Type: PDF, DOCX, TXT</p>
                        </div> : 
                        
                        <div className="h-1/1 flex flex-col justify-center items-center gap-3 pt-8 pb-8">
                            <img src={`${fileExtension}.png`} width={64} height={64}></img>
                            <p className="text-center">{fileName}</p>
                        </div>
                    }
                </label>
                <input
                    className="hidden"
                    id="fileInput"
                    name="fileInput"
                    type="file"
                    accept=".pdf, .txt, .docx"
                    onChange={(e) => {
                        const files = e.target.files;

                        if (!files || files.length === 0) return;

                        const selectedFile = files[0]
                        setFileName(selectedFile.name);
                        const ext: string = files[0].name.split(".").pop()?.toLowerCase() ?? "";
                        const acceptedFileExtensions: string[] = ["pdf", "docx", "txt"];

                        if(!acceptedFileExtensions.includes(ext)){
                            setErrorCode(415);
                            setFileName(null);
                            return;
                        }

                        if(files[0].size > maxFileSize){
                            setErrorCode(413);
                            setFileName(null);
                            return;
                        }

                        setFileExtension(ext);
                        handleUpload(selectedFile);
                    }}
                />

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
                    <p>File Name: {fileName}</p>
                </div>
            )}
        </section>
        )}
        
    </div>
);
}