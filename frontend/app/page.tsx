"use client";
import BlurText from "@/components/blurText";
import RotatingText from "@/components/rotatingText";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {

    const router: AppRouterInstance = useRouter();
    
    const [connectionStatus, setConnectionStatus] = useState<string>("🟡 Connecting...");
    const API_URL: string = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

    async function connect(){
        try{
            const res = await fetch(`${API_URL}/health`);
            if(res.ok){
                setConnectionStatus("🟢 Connected");
            }
        }catch(e){
            setConnectionStatus("🔴 Connection Failed");
        }
    }

    useEffect(() => {
        connect()
    }, [])

    return (
        <div className="min-h-dvh flex flex-col justify-between select-none">
            <p className="text-center mt-8 md:mt-15 md:text-xl">{connectionStatus}</p>
            <div className="flex flex-col items-center">
                <div className="flex flex-col md:flex-row md:gap-4 items-center mt-10 md:mt-0 mb-5">
                    <img src={"logo-blue.png"} className="w-16 md:w-36" />
                    <BlurText
                        text="Retrievia AI"
                        delay={150}
                        animateBy="letters"
                        direction="top"
                        className="justify-center tracking-tight text-primary text-5xl md:text-7xl font-bold"
                    />
                </div>
                

                <div className="flex gap-2 items-center mb-10">
                    <p className="font-semibold text-2xl md:text-4xl">Ask your</p>
                    <RotatingText
                        texts={['PDF', 'DOC', 'TXT']}
                        mainClassName="w-20 md:w-25 h-10 md:h-14 font-semibold bg-primary text-2xl md:text-4xl text-white overflow-hidden justify-center rounded-lg"
                        staggerFrom={"last"}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-120%" }}
                        staggerDuration={0.025}
                        splitLevelClassName="overflow-hidden"
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        rotationInterval={2000}
                    />
                </div>
                
                <p className="max-w-3/4 text-justify md:text-3xl mb-12 inline-block">A lightweight, RAG-based chatbot that lets you upload your files and ask questions to get clear, accurate, and context-aware answers.</p>
                    <button
                        type="button"
                        className="bg-primary text-white font-medium p-4 border-2 border-primary rounded-4xl mb-10 md:text-2xl hover:bg-white hover:text-primary cursor-pointer"
                        onClick={()=>{
                            router.push("/ask")
                        }}
                    >{'Start Asking'}</button>
            </div>
            <div className="flex flex-col gap-3 bg-primary text-white p-4 text-center">
                <p>Created with ❤️ by <Link href="https://www.github.com/cpt1909" target="_blank"><strong>Thaarakenth C P</strong></Link></p>
                <Link href="https://www.github.com/cpt1909/Retrievia_AI" target="_blank">
                        <p className="text-sm">View Github Repository</p>
                </Link>
            </div>
        </div>
    );
}