"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {

    
    return (
        <div>
            <p>HomePage</p>
            <Link href="/ask">Start Asking</Link>
        </div>
    );
}