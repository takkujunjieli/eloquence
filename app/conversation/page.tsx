"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mic, MicOff, Square, RefreshCcw, ArrowLeft, Loader2, Volume2, Sparkles, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Types for Web Speech API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognition = any;

type Message = {
    role: "user" | "model";
    message: string;
};

type Scores = {
    clarity: number;
    confidence: number;
    empathy: number;
    persuasion: number;
};

type Result = {
    scores: Scores;
    feedback: string;
    suggestions: string[];
    rewrite: string;
};

export default function ConversationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const context = searchParams.get("context") || "negotiation";
    const coach = searchParams.get("coach") || "orator";

    const [status, setStatus] = useState<"idle" | "listening" | "processing" | "speaking" | "scoring" | "results">("idle");
    const [messages, setMessages] = useState<Message[]>([]);
    const [transcript, setTranscript] = useState<Message[]>([]); // Full transcript
    const [result, setResult] = useState<Result | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    // Initialize Speech
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Setup Recognition
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false; // Turn-based
                recognition.interimResults = false;
                recognition.lang = "en-US";

                recognition.onresult = (event: any) => {
                    const text = event.results[0][0].transcript;
                    handleUserMessage(text);
                };

                recognition.onerror = (event: any) => {
                    console.error("Speech error", event.error);
                    if (status === "listening") setStatus("idle");
                };

                recognitionRef.current = recognition;
            }

            // Setup Synthesis
            synthRef.current = window.speechSynthesis;
        }
    }, [status]); // Re-init not needed but just safe

    // Start Conversation
    const startConversation = () => {
        setMessages([]);
        setTranscript([]);
        setResult(null);
        startListening();
    };

    const startListening = () => {
        if (recognitionRef.current && status !== "listening") {
            try {
                recognitionRef.current.start();
                setStatus("listening");
            } catch (e) {
                console.error("Already started", e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const handleUserMessage = async (text: string) => {
        setStatus("processing");
        const newMessage: Message = { role: "user", message: text };

        // Update State
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);

        try {
            // Send to API
            const response = await fetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({
                    history: updatedMessages,
                    context: context
                })
            });

            const data = await response.json();
            const aiResponse = data.message;

            const aiMessage: Message = { role: "model", message: aiResponse };
            setMessages(prev => [...prev, aiMessage]);

            // Speak AI response
            speak(aiResponse);

        } catch (e) {
            console.error(e);
            setStatus("idle");
        }
    };

    const speak = (text: string) => {
        if (synthRef.current) {
            setStatus("speaking");
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => {
                // AI finished talking, user's turn
                // Check if we aren't stopped
                if (status !== "scoring") {
                    startListening();
                }
            };
            synthRef.current.speak(utterance);
        }
    };

    const finishConversation = async () => {
        stopListening();
        if (synthRef.current) synthRef.current.cancel();
        setStatus("scoring");

        try {
            const response = await fetch("/api/score", {
                method: "POST",
                body: JSON.stringify({
                    transcript: messages,
                    coach: coach
                })
            });
            const data = await response.json();
            setResult(data);
            setStatus("results");
        } catch (e) {
            console.error(e);
            // Fallback or error state
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-2xl flex items-center justify-between mb-8">
                <button onClick={() => router.push("/")} className="text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-widest">{context.replace("_", " ")}</h2>
                    <p className="text-xs text-neutral-600">With {coach} coach</p>
                </div>
                <div className="w-6" /> {/* spacer */}
            </div>

            {/* Main Conversation Area */}
            {status !== "results" && (
                <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center space-y-8 relative">

                    {/* Visualizer / Avatar */}
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <div className={cn("absolute inset-0 rounded-full bg-blue-500/20 blur-xl transition-all duration-500",
                            status === "listening" ? "scale-100 opacity-100" : "scale-50 opacity-0")} />
                        <div className={cn("absolute inset-0 rounded-full bg-emerald-500/20 blur-xl transition-all duration-500",
                            status === "speaking" ? "scale-100 opacity-100" : "scale-50 opacity-0")} />

                        <div className="relative z-10 bg-neutral-900 rounded-full p-8 border border-neutral-800 shadow-2xl">
                            {status === "listening" && <Mic className="w-16 h-16 text-blue-500 animate-pulse" />}
                            {status === "speaking" && <Volume2 className="w-16 h-16 text-emerald-500 animate-pulse" />}
                            {(status === "idle") && <MicOff className="w-16 h-16 text-neutral-700" />}
                            {(status === "processing" || status === "scoring") && <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />}
                        </div>
                    </div>

                    {/* Status Text */}
                    <div className="h-8 text-center">
                        {status === "listening" && <p className="text-blue-400 font-medium animate-pulse">Listening...</p>}
                        {status === "speaking" && <p className="text-emerald-400 font-medium">AI is speaking...</p>}
                        {status === "processing" && <p className="text-amber-400 font-medium">Thinking...</p>}
                        {status === "scoring" && <p className="text-purple-400 font-medium">Analyzing Conversation...</p>}
                        {status === "idle" && messages.length === 0 && <p className="text-neutral-500">Press Start to begin</p>}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4">
                        {messages.length === 0 && status === 'idle' ? (
                            <button onClick={startConversation} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-all">
                                Start Conversation
                            </button>
                        ) : (
                            <button onClick={finishConversation} className="px-8 py-3 bg-red-600/80 hover:bg-red-500 rounded-full font-medium transition-all flex items-center gap-2">
                                <Square className="w-4 h-4 fill-current" /> Stop & Score
                            </button>
                        )}
                    </div>

                    {/* Transcript Preview (Last 2 messsages) */}
                    <div className="w-full max-h-48 overflow-y-auto space-y-4 px-4 mask-fade-bottom">
                        {messages.slice(-2).map((m, i) => (
                            <div key={i} className={cn("flex w-full", m.role === 'user' ? "justify-end" : "justify-start")}>
                                <div className={cn("max-w-[80%] p-3 rounded-lg text-sm",
                                    m.role === 'user' ? "bg-neutral-800 text-neutral-200" : "bg-neutral-900 border border-neutral-800 text-neutral-300")}>
                                    {m.message}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Results View */}
            {status === "results" && result && (
                <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-500">

                    {/* Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(result.scores).map(([key, value]) => (
                            <div key={key} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col items-center">
                                <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="40" cy="40" r="36" className="text-neutral-800 stroke-current text-opacity-20" strokeWidth="8" fill="none" />
                                        <circle cx="40" cy="40" r="36" className="text-blue-500 stroke-current" strokeWidth="8" fill="none"
                                            strokeDasharray={2 * Math.PI * 36}
                                            strokeDashoffset={2 * Math.PI * 36 * (1 - value / 100)}
                                        />
                                    </svg>
                                    <span className="absolute text-xl font-bold">{value}</span>
                                </div>
                                <span className="text-sm text-neutral-400 capitalize">{key}</span>
                            </div>
                        ))}
                    </div>

                    {/* Coach Feedback */}
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                {/* Icon based on coach? Placeholder */}
                                <Star className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{coach === 'storyteller' ? 'The Storyteller' : coach === 'executive' ? 'The Executive' : 'The Orator'} Says:</h3>
                                <p className="text-xs text-neutral-500">Analysis complete</p>
                            </div>
                        </div>
                        <p className="text-lg leading-relaxed text-neutral-200 italic">"{result.feedback}"</p>
                    </div>

                    {/* Suggestions & Rewrite */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl">
                            <h4 className="font-medium text-neutral-300 mb-4 flex items-center gap-2"><RefreshCcw className="w-4 h-4" /> Quick Fixes</h4>
                            <ul className="space-y-3">
                                {result.suggestions.map((s, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-neutral-400">
                                        <span className="text-blue-500">•</span> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl">
                            <h4 className="font-medium text-neutral-300 mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Better Way to Say It</h4>
                            <div className="bg-neutral-950 p-4 rounded-lg border-l-2 border-emerald-500">
                                <p className="text-sm text-neutral-300 italic">{result.rewrite}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-8">
                        <button onClick={startConversation} className="px-8 py-3 bg-neutral-100 text-neutral-950 hover:bg-white rounded-full font-medium transition-all shadow-lg hover:scale-105">
                            Practice Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
