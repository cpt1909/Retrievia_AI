"use client";

import Link from "next/link";

export default function Home() {

    
    return (
        <div>
            <p>HomePage</p>
            <Link href="/ask">Start Asking</Link>
        </div>
    );
}