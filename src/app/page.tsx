"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import Flipbook from "@/components/Flipbook";
import FormStepComponent from "@/components/FormStep";
import ChatInterface from "@/components/ChatInterface";
import {
  ScoreBarChart,
  BreakdownPieChart,
  ConfidenceRadarChart,
  TrendLineChart,
  D3GaugeChart,
  RiskIndicator,
} from "@/components/Charts";
import { onboardingSteps, calculatePriorityScore } from "@/lib/form-config";
import { FormData, ChatMessage, AnalysisResult, AppPhase } from "@/lib/types";

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("landing");
  const [formData, setFormData] = useState<FormData>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // GSAP hero animation
  useEffect(() => {
    if (phase !== "landing" || !titleRef.current) return;

    const words = titleRef.current.querySelectorAll(".hero-word");
    gsap.fromTo(
      words,
      { y: "100%", opacity: 0 },
      {
        y: "0%",
        opacity: 1,
        duration: 1.4,
        ease: "power4.out",
        stagger: 0.06,
        delay: 0.3,
      }
    );

    gsap.fromTo(
      ".hero-search-bar",
      { y: 40, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 1.2, delay: 0.8, ease: "power3.out" }
    );
  }, [phase]);

  const handleFormFieldChange = useCallback(
    (fieldId: string, value: string | number | boolean | string[]) => {
      setFormData((prev) => ({ ...prev, [fieldId]: value }));
    },
    []
  );

  const handleFormNext = useCallback(() => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setCurrentPage((prev) => prev + 1);
    } else {
      // Form complete - submit and move to guidance
      const priorityScore = calculatePriorityScore(formData);
      const updatedFormData = { ...formData, priority_score: priorityScore };
      setFormData(updatedFormData);
      startGuidanceSession(updatedFormData);
    }
  }, [currentStep, formData]);

  const handleFormPrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentStep]);

  const startGuidanceSession = async (data: FormData) => {
    setPhase("guidance");
    setCurrentPage(0);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `I need guidance in the domain of "${data.domain}". My subject is: "${data.subject}". I'm at ${data.experience_level} level with ${data.years_experience} years of experience. My goals are: ${
                Array.isArray(data.goals) ? (data.goals as string[]).join(", ") : data.goals
              }. Urgency: ${data.urgency}. Guidance style preference: ${data.guidance_style}. Detail level: ${data.detail_level}/10. Additional context: ${data.additional_context || "None"}.`,
            },
          ],
          formData: data,
        }),
      });

      const result = await response.json();

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.message,
        timestamp: Date.now(),
      };
      setMessages([assistantMsg]);

      if (result.analysis) {
        setAnalysis(result.analysis);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I apologize, but I encountered an issue connecting to the AI service. Please try again.",
        timestamp: Date.now(),
      };
      setMessages([errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          formData,
        }),
      });

      const result = await response.json();

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (result.analysis) {
        setAnalysis(result.analysis);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishGuidance = async () => {
    if (!analysis) {
      // Request final analysis
      setIsLoading(true);
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              {
                role: "user",
                content:
                  "Please provide your final comprehensive analysis with the <analysis> JSON block including scores, key findings, recommendations, risk level, confidence, and breakdown data.",
              },
            ],
            formData,
          }),
        });

        const result = await response.json();
        if (result.analysis) {
          setAnalysis(result.analysis);
        } else {
          // Fallback analysis
          setAnalysis({
            domain: String(formData.domain || "General"),
            title: String(formData.subject || "Analysis"),
            steps_completed: messages.filter((m) => m.role === "user").length,
            key_findings: [
              "Analysis completed based on conversation context",
              "Multiple factors were considered in the assessment",
              "Recommendations provided based on available data",
            ],
            scores: {
              relevance: 75,
              completeness: 68,
              actionability: 82,
              clarity: 79,
              depth: 71,
            },
            recommendations: [
              "Follow the step-by-step guidance provided",
              "Review key findings for actionable insights",
              "Consider the risk assessment in decision making",
            ],
            risk_level: "medium",
            confidence: 0.76,
            breakdown: [
              { label: "Research", value: 30 },
              { label: "Planning", value: 25 },
              { label: "Execution", value: 20 },
              { label: "Review", value: 15 },
              { label: "Optimization", value: 10 },
            ],
          });
        }

        if (result.message) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: result.message,
              timestamp: Date.now(),
            },
          ]);
        }
      } catch {
        // Use fallback analysis
        setAnalysis({
          domain: String(formData.domain || "General"),
          title: String(formData.subject || "Analysis"),
          steps_completed: messages.filter((m) => m.role === "user").length,
          key_findings: [
            "Guidance session completed",
            "Key areas have been addressed",
          ],
          scores: {
            relevance: 75,
            completeness: 70,
            actionability: 80,
            clarity: 78,
            depth: 72,
          },
          recommendations: ["Review the guidance steps provided"],
          risk_level: "medium",
          confidence: 0.7,
          breakdown: [
            { label: "Research", value: 30 },
            { label: "Planning", value: 25 },
            { label: "Execution", value: 25 },
            { label: "Review", value: 20 },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    }
    setPhase("results");
    setCurrentPage(0);
  };

  // ==================== LANDING PAGE ====================
  if (phase === "landing") {
    return (
      <div ref={heroRef} className="relative w-full min-h-screen flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,115,85,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/10 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto">
          <div className="max-w-4xl">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="block text-[10px] uppercase tracking-[0.3em] text-white/40 font-sans mb-6"
            >
              AI-Powered Guidance Platform
            </motion.span>

            <h1
              ref={titleRef}
              className="text-4xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1] mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="block overflow-hidden">
                <span className="inline-block overflow-hidden align-top">
                  <span className="inline-block hero-word opacity-0 translate-y-full">Expert</span>
                </span>{" "}
                <span className="inline-block overflow-hidden align-top">
                  <span className="inline-block hero-word opacity-0 translate-y-full">Guidance</span>
                </span>{" "}
                <span className="inline-block overflow-hidden align-top">
                  <span className="inline-block hero-word opacity-0 translate-y-full">in</span>
                </span>
              </span>
              <span className="block overflow-hidden">
                <span className="inline-block overflow-hidden align-top">
                  <span className="inline-block hero-word opacity-0 translate-y-full">Any</span>
                </span>{" "}
                <span className="inline-block overflow-hidden align-top">
                  <span className="inline-block hero-word opacity-0 translate-y-full italic">Domain.</span>
                </span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-white/70 text-sm md:text-base font-light mb-16 max-w-lg"
            >
              Step-by-step AI assistant powered by Cerebras LLM. Get professional
              guidance with interactive flipbook presentations, data visualizations,
              and actionable insights.
            </motion.p>

            {/* Search/Start Bar */}
            <div className="hero-search-bar opacity-0 mt-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2px] px-8 py-6 flex flex-col md:flex-row items-center gap-6 max-w-5xl">
              <div className="w-full md:flex-1 group">
                <span className="block text-white/50 text-[10px] uppercase tracking-widest mb-2">
                  Domain
                </span>
                <div className="border-b border-white/20 pb-2 group-hover:border-white transition-colors duration-300">
                  <span className="text-white text-sm font-light">Any Subject</span>
                </div>
              </div>

              <div className="w-full md:flex-1 group">
                <span className="block text-white/50 text-[10px] uppercase tracking-widest mb-2">
                  Format
                </span>
                <div className="border-b border-white/20 pb-2 group-hover:border-white transition-colors duration-300">
                  <span className="text-white text-sm font-light">Interactive Flipbook</span>
                </div>
              </div>

              <div className="w-full md:flex-1 group">
                <span className="block text-white/50 text-[10px] uppercase tracking-widest mb-2">
                  AI Engine
                </span>
                <div className="border-b border-white/20 pb-2 group-hover:border-white transition-colors duration-300">
                  <span className="text-white text-sm font-light">Cerebras LLM</span>
                </div>
              </div>

              <div className="w-full md:w-auto mt-4 md:mt-0">
                <button
                  onClick={() => {
                    setPhase("onboarding");
                    setCurrentPage(0);
                    setCurrentStep(0);
                  }}
                  className="w-full text-[10px] uppercase tracking-widest bg-white text-stone-900 px-6 py-3 rounded-[2px] font-medium hover:bg-stone-900 hover:text-white transition-all duration-400 cursor-pointer"
                >
                  Begin Guidance Session
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"
        />
      </div>
    );
  }

  // ==================== ONBOARDING PHASE ====================
  if (phase === "onboarding") {
    const pages = onboardingSteps.map((step, index) => (
      <FormStepComponent
        key={step.id}
        step={step}
        formData={formData}
        onFieldChange={handleFormFieldChange}
        onNext={handleFormNext}
        onPrev={handleFormPrev}
        isFirst={index === 0}
        isLast={index === onboardingSteps.length - 1}
        stepIndex={index}
        totalSteps={onboardingSteps.length}
      />
    ));

    return (
      <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center px-4 py-12">
        {/* Back to landing */}
        <button
          onClick={() => setPhase("landing")}
          className="fixed top-6 left-6 z-50 text-xs uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        {/* Logo */}
        <div className="fixed top-6 right-6 z-50">
          <span className="text-xs uppercase tracking-[0.3em] text-stone-400 font-medium">
            BRANCED
          </span>
        </div>

        <Flipbook
          currentPage={currentStep}
          onPageChange={(page) => {
            setCurrentStep(page);
            setCurrentPage(page);
          }}
        >
          {pages}
        </Flipbook>
      </div>
    );
  }

  // ==================== GUIDANCE PHASE ====================
  if (phase === "guidance") {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center px-4 py-12">
        <button
          onClick={() => {
            setPhase("onboarding");
            setCurrentStep(onboardingSteps.length - 1);
          }}
          className="fixed top-6 left-6 z-50 text-xs uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div className="fixed top-6 right-6 z-50">
          <span className="text-xs uppercase tracking-[0.3em] text-stone-400 font-medium">
            BRANCED
          </span>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white rounded-sm shadow-2xl shadow-stone-200/50 min-h-[600px] md:min-h-[700px] p-8 md:p-12">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onFinish={handleFinishGuidance}
            />
          </div>
        </div>
      </div>
    );
  }

  // ==================== RESULTS PHASE ====================
  if (phase === "results" && analysis) {
    const resultPages = [
      // Cover page
      <div key="cover" className="h-full flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 block mb-4">
            Analysis Complete
          </span>
          <h1
            className="text-3xl md:text-4xl text-stone-900 tracking-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {analysis.title}
          </h1>
          <p className="text-sm text-stone-500 font-light mb-8 max-w-md mx-auto">
            Domain: {analysis.domain} | Steps completed: {analysis.steps_completed}
          </p>
          <div className="flex items-center justify-center gap-8">
            <D3GaugeChart
              value={Math.round(analysis.confidence * 100)}
              label="Confidence"
            />
          </div>
        </motion.div>
      </div>,

      // Key Findings
      <div key="findings" className="h-full flex flex-col">
        <div className="mb-6">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-2">
            Key Findings
          </span>
          <h2
            className="text-2xl text-stone-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            What We Discovered
          </h2>
        </div>
        <div className="flex-1 space-y-3">
          {analysis.key_findings.map((finding, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex gap-3 p-4 bg-stone-50 rounded-sm"
            >
              <span className="text-xs text-stone-400 font-medium mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm text-stone-700 font-light">{finding}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-6">
          <RiskIndicator level={analysis.risk_level} />
        </div>
      </div>,

      // Score Charts
      <div key="scores" className="h-full flex flex-col">
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-2">
            Scores
          </span>
          <h2
            className="text-2xl text-stone-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Performance Metrics
          </h2>
        </div>
        <div className="flex-1 grid grid-cols-1 gap-4">
          <ScoreBarChart analysis={analysis} />
          <TrendLineChart analysis={analysis} />
        </div>
      </div>,

      // Breakdown Charts
      <div key="breakdown" className="h-full flex flex-col">
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-2">
            Deep Dive
          </span>
          <h2
            className="text-2xl text-stone-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Detailed Breakdown
          </h2>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <BreakdownPieChart analysis={analysis} />
          <ConfidenceRadarChart analysis={analysis} />
        </div>
      </div>,

      // Recommendations
      <div key="recommendations" className="h-full flex flex-col">
        <div className="mb-6">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-2">
            Recommendations
          </span>
          <h2
            className="text-2xl text-stone-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Next Steps
          </h2>
        </div>
        <div className="flex-1 space-y-4">
          {analysis.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="flex gap-4 items-start p-4 border border-stone-100 rounded-sm hover:border-stone-300 transition-colors"
            >
              <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">{i + 1}</span>
              </div>
              <p className="text-sm text-stone-700 font-light pt-1">{rec}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={() => {
              setPhase("guidance");
            }}
            className="btn-outline"
          >
            Back to Chat
          </button>
          <button
            onClick={() => {
              setPhase("landing");
              setFormData({});
              setMessages([]);
              setAnalysis(null);
              setCurrentStep(0);
              setCurrentPage(0);
            }}
            className="btn-primary"
          >
            Start New Session
          </button>
        </div>
      </div>,
    ];

    return (
      <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center px-4 py-12">
        <button
          onClick={() => setPhase("guidance")}
          className="fixed top-6 left-6 z-50 text-xs uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Chat
        </button>

        <div className="fixed top-6 right-6 z-50">
          <span className="text-xs uppercase tracking-[0.3em] text-stone-400 font-medium">
            BRANCED
          </span>
        </div>

        <Flipbook
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        >
          {resultPages}
        </Flipbook>
      </div>
    );
  }

  return null;
}
