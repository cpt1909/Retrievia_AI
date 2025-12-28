"use client";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function Ask() {

    const appRouter: AppRouterInstance = useRouter();

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
            setChatLoading(true);
            const form: FormData = new FormData();
            form.append("query", query);
            setQuery("");
            form.append("uid", fileUId);
            setChatHistory(prev => [...prev, {role: "user", content: query}]);

            const res = await fetch(`${API_URL}/askQuery`, {
                method: "POST",
                body: form,
            });

            const data = await res.json();
            if(res.ok){
                setChatHistory(prev => [...prev, {role: "bot", content: data.reply}]);
            }else{
                setChatHistory(prev => [...prev, {role: "bot", content: errorMessage[res.status]}]);
            };
            setChatLoading(false);
        }catch(e){
            setChatLoading(false);
            setChatHistory(prev => [...prev, {role: "bot", content: "Oops! Something went wrong!"}]);
        }
    }

    const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
    const [chatLoading, setChatLoading] = useState<boolean>(false);

    return (
    <div className="mainContainer h-screen flex flex-col justify-between lg:items-center">
        <div className="header flex items-center p-3 pb-0 justify-between lg:items-center lg:min-w-4xl lg:max-w-7xl">
            <img src="logo-blue.png" width={60} height={60} />
            <button
                type="button"
                className="bg-primary text-white p-2 rounded-xl w-25"
                onClick={()=>{
                    appRouter.back();
                }}>Return</button>
        </div>
        
        {loading && (
            <div className="loading fixed inset-0 z-50 flex flex-col gap-3 items-center justify-center bg-secondary/10 backdrop-blur-sm">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-primary"></div>
                <p className="text-center text-primary">Please Wait ...</p>
            </div>
        )}

        {errorCode && (
            <div className="errorCode fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
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
            <section className="uploadSection flex flex-col items-center mt-2 mb-2 lg:items-center lg:max-w-7xl">
                <p className="text-2xl font-bold lg:text-4xl">Ask your Docs</p>
                <p className="w-3/4 mt-2 text-justify md:text-center lg:text-2xl">Select a file to ask questions and get clear, accurate, and context-aware answers.</p>
                <label
                    htmlFor="fileInput"
                    className="block w-3/4 min-h-24 bg-primary text-white rounded-3xl mt-8"
                >
                    {!fileName ?
                        <div className="selectFile h-1/1 flex flex-col justify-center gap-3 pt-4 pb-4">
                            <p className="text-center font-semibold text-3xl"> Select a file </p>
                            <p className="text-center">File Type: PDF, DOCX, TXT</p>
                        </div> : 
                        
                        <div className="postSelectFile h-1/1 flex flex-col justify-center items-center gap-3 pt-8 pb-8">
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


        {showAskSection && (
        <section className="askSection min-h-0 p-2 flex-1 flex flex-col justify-between lg:min-w-4xl lg:max-w-7xl">
            {fileUId && (
                <p className="text-center p-1 border border-dashed rounded-xl lg:min-w-4xl lg:max-w-4xl overflow-hidden text-wrap break-all max-h-14">Answering from <strong>{fileName}</strong></p>
            )}

            {(chatHistory.length > 0) ? (
                <div className="chatWindow flex flex-col flex-1 overflow-y-auto gap-4 rounded-2xl m-2">
                    {chatHistory.map((message, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <img src={`${message.role}.svg`} width={38} height={38} className={`${(message.role == "user" ? "bg-primary" : "bg-white")} p-1.5 rounded-full border border-primary`}/>
                            <div className="text-wrap break-all">{message.content}</div>
                        </div>
                    ))}
                    {chatLoading && (
                        <div className="chatLoading flex gap-2 items-center">
                            <img src={"bot.svg"} width={38} height={38} className="bg-white p-1.5 rounded-full border border-primary" />
                            <div className="flex items-center gap-1 px-3 py-2 rounded-full w-fit">
                                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    )}
                </div>
                ) : <p className="text-center">Start chatting ...</p>}
            
            <div className="chatInput flex border border-primary p-2 mb-2 rounded-3xl gap-2 items-center">
                <div className="w-full">
                    <textarea
                        placeholder="Ask your question here..."
                        className="w-full rounded-3xl resize-none overflow-hidden p-2 focus:outline-none whitespace-pre-wrap"
                        value={query}
                        rows={1}
                        maxLength={150}
                        
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAsk();
                            }
                        }}
                        onChange={(e) => {
                            setQuery(e.target.value);
                        }}
                    />
                    <p className={`text-end ${(150 - query.length) === 0 ? "text-red-700" : ""} text-sm`}>{150 - query.length}/150</p>
                </div>
                <img
                    className="bg-primary pt-2 pr-2 pb-2 pl-2 rounded-full"
                    src={"send.png"}
                    width={42}
                    height={42}
                    onClick={() => {
                        handleAsk();
                    }}
                ></img>
            </div>
        </section>
        )}

        <div className="flex flex-col gap-3 bg-primary text-white p-4 text-center min-w-screen">
            <p>Created with ❤️ by <Link href="https://www.github.com/cpt1909" target="_blank"><strong>Thaarakenth C P</strong></Link></p>
        </div>
    </div>
);
}