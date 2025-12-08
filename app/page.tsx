"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Mic, Briefcase, Users, MessageCircle, Star, Sparkles, ScrollText } from "lucide-react";
import { motion } from "framer-motion";

const SCENARIOS = [
  {
    id: "negotiation",
    title: "Business Negotiation",
    description: "Practice closing deals and handling objections.",
    icon: Briefcase,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    id: "interview",
    title: "Job Interview",
    description: "Prepare for behavioral questions and confidence.",
    icon: Users,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  {
    id: "difficult_convo",
    title: "Difficult Conversation",
    description: "Navigate conflict resolution and empathy.",
    icon: MessageCircle,
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
];

const COACHES = [
  {
    id: "orator",
    name: "The Orator",
    style: "Obama-style",
    description: "Focuses on cadence, pauses, and rhetorical mastery.",
    icon: Mic,
  },
  {
    id: "storyteller",
    name: "The Storyteller",
    style: "Lincoln-style",
    description: "Values folksy wisdom, metaphors, and humility.",
    icon: ScrollText,
  },
  {
    id: "executive",
    name: "The Executive",
    style: "Jobs-style",
    description: "Prioritizes clarity, brevity, and visionary impact.",
    icon: Sparkles,
  },
];

export default function Home() {
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);

  const startTraining = () => {
    if (selectedScenario && selectedCoach) {
      router.push(`/conversation?context=${selectedScenario}&coach=${selectedCoach}`);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-sans selection:bg-neutral-800">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent"
          >
            Eloquence
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-neutral-400 max-w-2xl mx-auto"
          >
            Master the art of conversation with real-time AI feedback.
            Choose your scenario and your mentor.
          </motion.p>
        </header>

        {/* Scenario Selection */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-neutral-300 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-800 text-sm">1</span>
            Select a Scenario
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={cn(
                  "flex flex-col items-start p-6 rounded-xl border transition-all duration-200 text-left h-full",
                  selectedScenario === scenario.id
                    ? "bg-neutral-900 border-neutral-100 ring-1 ring-neutral-100"
                    : "bg-neutral-900/50 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700"
                )}
              >
                <div className={cn("p-3 rounded-lg mb-4", scenario.color)}>
                  <scenario.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-neutral-100 mb-1">{scenario.title}</h3>
                <p className="text-sm text-neutral-400">{scenario.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Coach Selection */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-neutral-300 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-800 text-sm">2</span>
            Choose Your Coach
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COACHES.map((coach) => (
              <button
                key={coach.id}
                onClick={() => setSelectedCoach(coach.id)}
                className={cn(
                  "flex flex-col items-start p-6 rounded-xl border transition-all duration-200 text-left h-full",
                  selectedCoach === coach.id
                    ? "bg-neutral-900 border-neutral-100 ring-1 ring-neutral-100"
                    : "bg-neutral-900/50 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700"
                )}
              >
                <div className="p-3 rounded-lg mb-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <coach.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-neutral-100 mb-1">{coach.name}</h3>
                <p className="text-xs font-mono text-emerald-400 mb-2 uppercase tracking-wider">{coach.style}</p>
                <p className="text-sm text-neutral-400">{coach.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Start Button */}
        <div className="flex justify-center pt-8">
          <button
            onClick={startTraining}
            disabled={!selectedScenario || !selectedCoach}
            className={cn(
              "px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-neutral-900/50",
              selectedScenario && selectedCoach
                ? "bg-neutral-100 text-neutral-950 hover:bg-white hover:scale-105"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
            )}
          >
            Start Training <Star className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </main>
  );
}
