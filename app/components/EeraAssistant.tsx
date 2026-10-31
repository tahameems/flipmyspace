"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  Check,
  GripHorizontal,
  Lock,
  ArrowRight,
  RotateCcw
} from "lucide-react";

// Eera Assistant Logo - Crafted to match the website's warm Bauhaus/Relive aesthetic
export function EeraLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-full shadow-sm flex-shrink-0 ${className}`}
      aria-label="Eera Chat Assistant Logo"
    >
      {/* Warm cream background matching #faf7f2 */}
      <circle cx="50" cy="50" r="48" fill="#faf7f2" stroke="#c25e37" strokeWidth="2.5" />
      {/* Concentric subtle inner border */}
      <circle cx="50" cy="50" r="44" stroke="#e8e2d5" strokeWidth="1" strokeDasharray="3 2" />

      {/* Elegant floor lamp in terracotta with warm amber glow */}
      <path d="M28 72 L28 32 Q28 26 35 26 L38 26" stroke="#8c3817" strokeWidth="2" strokeLinecap="round" />
      <path d="M23 72 L33 72" stroke="#8c3817" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 26 L43 32 L34 32 Z" fill="#c25e37" />
      <circle cx="39" cy="34" r="6" fill="#f59e0b" opacity="0.4" />

      {/* Starlight swirl in terracotta and sage green */}
      <path
        d="M38 38 Q52 32 68 40 Q78 46 84 42"
        stroke="#c25e37"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M44 44 Q60 38 76 47"
        stroke="#7a8c6e"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
      {/* Warm sparkles */}
      <path d="M74 32 L75.5 28 L77 32 L81 33.5 L77 35 L75.5 39 L74 35 L70 33.5 Z" fill="#c25e37" />
      <path d="M62 28 L63 25 L64 28 L67 29 L64 30 L63 33 L62 30 L59 29 Z" fill="#7a8c6e" />
      <circle cx="86" cy="42" r="1.5" fill="#f59e0b" />
      <circle cx="54" cy="34" r="1.2" fill="#c25e37" />

      {/* Designer Armchair in rich charcoal #1c1917 and terracotta #c25e37 */}
      {/* Seat backrest */}
      <path
        d="M40 48 Q40 44 44 44 L58 44 Q62 44 62 48 L62 60 Q62 62 60 62 L42 62 Q40 62 40 60 Z"
        fill="#1c1917"
      />
      {/* Left armrest in terracotta */}
      <path
        d="M37 51 Q37 48 40 48 L41 48 L41 60 Q41 62 39 62 Q37 62 37 60 Z"
        fill="#c25e37"
      />
      {/* Right armrest in terracotta */}
      <path
        d="M61 48 L62 48 Q65 48 65 51 L65 60 Q65 62 63 62 Q61 62 61 60 Z"
        fill="#c25e37"
      />
      {/* Front seat cushion */}
      <rect x="41" y="56" width="20" height="5" rx="1.5" fill="#2d2926" stroke="#c25e37" strokeWidth="0.8" />
      {/* Wooden legs */}
      <path d="M42 62 L39 70" stroke="#8c3817" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 62 L63 70" stroke="#8c3817" strokeWidth="2" strokeLinecap="round" />
      <path d="M45 62 L44 68" stroke="#8c3817" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M57 62 L58 68" stroke="#8c3817" strokeWidth="1.8" strokeLinecap="round" />

      {/* Typography: "I'm Eera" in warm charcoal & terracotta accent */}
      <text
        x="50"
        y="86"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="10.5"
        fontWeight="800"
        fill="#1c1917"
        letterSpacing="0.4"
      >
        I’m Eera
      </text>
    </svg>
  );
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  handoff?: {
    baseStyle?: string;
    elementsToRetain?: string;
    modificationsRequested?: string;
    atmosphere?: string;
    promptModifiers?: string;
  } | null;
  timestamp: string;
}

interface EeraAssistantProps {
  selectedStyle: string;
  selectedRoomType: string;
  generatedImage: string | null;
  roomAnalysis: string | null;
  customApiKey?: string;
  onApplyRefinement: (refinement: {
    modificationsRequested: string;
    elementsToRetain: string;
    promptModifiers: string;
  }) => void;
  onScrollToStudio?: () => void;
  isRegenerating?: boolean;
}

export default function EeraAssistant({
  selectedStyle,
  selectedRoomType,
  generatedImage,
  roomAnalysis,
  customApiKey,
  onApplyRefinement,
  onScrollToStudio,
  isRegenerating = false,
}: EeraAssistantProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appliedHandoffId, setAppliedHandoffId] = useState<string | null>(null);

  const hasGeneratedImage = Boolean(generatedImage);

  // Position state for draggable floating window
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const chatWindowRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Refinement & generation lifecycle tracking
  const hasInitializedGreetingRef = useRef<boolean>(false);
  const waitingForRefinementRef = useRef<boolean>(false);
  const isRefinedRef = useRef<boolean>(false);
  const prevIsRegeneratingRef = useRef<boolean>(false);

  // Initialize position to bottom right of viewport
  useEffect(() => {
    if (typeof window !== "undefined" && !position) {
      const initialX = Math.max(16, window.innerWidth - 410);
      const initialY = Math.max(16, window.innerHeight - 620);
      setPosition({ x: initialX, y: initialY });
    }
  }, [position]);

  // Handle window resizing to keep chat window on screen
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        const maxX = Math.max(16, window.innerWidth - 400);
        const maxY = Math.max(16, window.innerHeight - 120);
        return {
          x: Math.min(Math.max(16, prev.x), maxX),
          y: Math.min(Math.max(16, prev.y), maxY),
        };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Messages state dynamically adapted to image presence
  const [messages, setMessages] = useState<Message[]>([]);

  // Update initial message depending on whether room image is generated
  useEffect(() => {
    if (!hasGeneratedImage) {
      hasInitializedGreetingRef.current = false;
      isRefinedRef.current = false;
      waitingForRefinementRef.current = false;
      setMessages([
        {
          id: "no-image-notice",
          role: "assistant",
          content:
            "Hi, I’m Eera! Before we can refine details, please select or upload a room photo in the Staging Studio and generate your styled space. Once styled, I'll be right here to help you tweak and perfect every element.",
          timestamp: "Just now",
        },
      ]);
    } else if (!hasInitializedGreetingRef.current) {
      hasInitializedGreetingRef.current = true;
      setMessages([
        {
          id: "active-greeting",
          role: "assistant",
          content:
            "Hi, I’m Eera! Take a look at your newly styled room. What would you most like to tweak or enhance in this space? Describe any changes below, and I will update your room.",
          timestamp: "Just now",
        },
      ]);
    }
  }, [hasGeneratedImage]);

  // When a refined image finishes generating, check in with user whether the new image is fine
  useEffect(() => {
    if (prevIsRegeneratingRef.current && !isRegenerating) {
      if (waitingForRefinementRef.current && hasGeneratedImage) {
        waitingForRefinementRef.current = false;
        isRefinedRef.current = true;

        const checkinMessage: Message = {
          id: `assistant-checkin-${Date.now()}`,
          role: "assistant",
          content:
            "Here is your newly updated room design with your requested adjustments! Take a look—how does this new version look to you? Are you happy with this space, or is there anything else you'd like to adjust?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, checkinMessage]);
        speakText("Here is your newly updated room design! How does this look to you?");
      }
    }
    prevIsRegeneratingRef.current = isRegenerating;
  }, [isRegenerating, hasGeneratedImage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Dragging event handlers for header
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from header, ignore clicks on buttons
    if ((e.target as HTMLElement).closest("button")) return;
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - (position?.x || 0),
      y: e.clientY - (position?.y || 0),
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const newX = e.clientX - dragOffsetRef.current.x;
    const newY = e.clientY - dragOffsetRef.current.y;
    const maxX = Math.max(16, window.innerWidth - 390);
    const maxY = Math.max(16, window.innerHeight - 100);
    setPosition({
      x: Math.min(Math.max(10, newX), maxX),
      y: Math.min(Math.max(10, newY), maxY),
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  // Touch drag support for mobile/tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragOffsetRef.current = {
        x: e.touches[0].clientX - (position?.x || 0),
        y: e.touches[0].clientY - (position?.y || 0),
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const newX = e.touches[0].clientX - dragOffsetRef.current.x;
    const newY = e.touches[0].clientY - dragOffsetRef.current.y;
    const maxX = Math.max(16, window.innerWidth - 390);
    const maxY = Math.max(16, window.innerHeight - 100);
    setPosition({
      x: Math.min(Math.max(10, newX), maxX),
      y: Math.min(Math.max(10, newY), maxY),
    });
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Text to speech helper
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/---BACKEND_HANDOFF---[\s\S]*?---END_HANDOFF---/g, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore audio synthesis errors
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend || inputText).trim();
    if (!rawText || isLoading || !hasGeneratedImage) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            style: selectedStyle,
            roomType: selectedRoomType,
            hasGeneratedImage: true,
            isRefined: isRefinedRef.current,
            roomAnalysis: roomAnalysis,
          },
          apiKey: customApiKey || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to reach Eera.");
      }

      const botMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        handoff: data.handoff,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
      speakText(data.reply);

      // If Eera produced a handoff block, automatically trigger the refinement pipeline!
      if (data.handoff) {
        const modifications = data.handoff.modificationsRequested || rawText;
        const retain = data.handoff.elementsToRetain || "Walls, perimeter floor plane, and natural daylight orientation";
        const modifiers = data.handoff.promptModifiers || `${selectedStyle}, architectural photorealism, refined interior`;

        waitingForRefinementRef.current = true;
        onApplyRefinement({
          modificationsRequested: modifications,
          elementsToRetain: retain,
          promptModifiers: modifiers,
        });
      }
    } catch (err: any) {
      const cleanPrompt = rawText.trim();
      const isAffirmative = /^(it looks|looks|it's|is|i like|love|perfect|fine|good|yes|ok|okay|great|nice|amazing|superb)/i.test(cleanPrompt);

      if (isAffirmative) {
        const affirmativeMsg: Message = {
          id: `assistant-affirm-${Date.now()}`,
          role: "assistant",
          content: "I'm delighted you love the new makeover! Your space has come together beautifully. You can download your high-resolution render or make further tweaks anytime.",
          timestamp: "Just now",
        };
        setMessages((prev) => [...prev, affirmativeMsg]);
      } else {
        waitingForRefinementRef.current = true;
        onApplyRefinement({
          modificationsRequested: cleanPrompt,
          elementsToRetain: "Walls, flooring perspective, and window architecture",
          promptModifiers: `${selectedStyle}, photorealistic architectural design, ${cleanPrompt}`,
        });

        const fallbackMessage: Message = {
          id: `assistant-refine-${Date.now()}`,
          role: "assistant",
          content: `Updating your room with: "${cleanPrompt}". Let's see how the new version turns out!`,
          timestamp: "Just now",
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = (messageId: string, handoff: any) => {
    if (!handoff) return;
    setAppliedHandoffId(messageId);
    waitingForRefinementRef.current = true;
    onApplyRefinement({
      modificationsRequested: handoff.modificationsRequested || "",
      elementsToRetain: handoff.elementsToRetain || "",
      promptModifiers: handoff.promptModifiers || "",
    });
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* Subtle Attention Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c1917] text-[#ffffff] text-xs font-medium shadow-lg border border-[#e8e2d5] animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#c25e37] animate-pulse" />
            <span>Refine your room with <strong>Eera</strong></span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            type="button"
            aria-label="Open Eera AI Design Assistant"
            className="w-14 h-14 rounded-full bg-[#faf7f2] hover:bg-[#ffffff] border-2 border-[#c25e37] text-[#1c1917] flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 group active:scale-95 overflow-hidden p-0.5"
          >
            <div className="relative w-full h-full">
              <EeraLogo className="w-full h-full" />
              <span className={`absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                hasGeneratedImage ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
              }`} />
            </div>
          </button>
        </div>
      )}

      {/* Floating Draggable Chatbot Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          style={{
            left: position ? `${position.x}px` : undefined,
            top: position ? `${position.y}px` : undefined,
          }}
          className={`fixed z-50 w-[calc(100vw-2rem)] sm:w-[400px] bg-[#ffffff] rounded-3xl border-2 border-[#e8e2d5] shadow-2xl flex flex-col overflow-hidden transition-size duration-200 select-none ${
            isMinimized ? "h-[74px]" : "h-[580px] max-h-[88vh]"
          } ${!position ? "bottom-6 right-4 sm:right-6" : ""}`}
        >
          {/* Draggable Header */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="bg-[#fcfaf7] border-b border-[#e8e2d5] px-4 py-3 flex items-center justify-between cursor-move active:cursor-grabbing select-none"
            title="Click and drag to move Eera anywhere on your screen"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-[#faf7f2] border border-[#e8e2d5] flex items-center justify-center p-0.5 shadow-sm overflow-hidden">
                  <EeraLogo className="w-full h-full" />
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  hasGeneratedImage ? "bg-emerald-500" : "bg-amber-400"
                }`} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-[#1c1917]">Eera</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f4efe6] text-[#8c3817] font-semibold border border-[#e8e2d5]">
                    Relive Assistant
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#78716c]">
                  <GripHorizontal className="w-3 h-3 text-[#a8a29e]" />
                  <span>Drag to reposition</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[#78716c]">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? "Mute Eera's voice" : "Enable Eera's voice reading"}
                className={`p-1.5 rounded-lg hover:bg-[#eadecc] transition ${
                  voiceEnabled ? "text-[#c25e37]" : "text-[#78716c]"
                }`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
                className="p-1.5 rounded-lg hover:bg-[#eadecc] transition"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg hover:bg-[#eadecc] hover:text-[#1c1917] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#faf7f2]/50 select-text">
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-start gap-2 max-w-[88%]">
                        {!isUser && (
                          <div className="w-6 h-6 rounded-full border border-[#e8e2d5] flex-shrink-0 mt-0.5 overflow-hidden shadow-sm">
                            <EeraLogo className="w-full h-full" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                            isUser
                              ? "bg-[#1c1917] text-white rounded-tr-none"
                              : "bg-white text-[#1c1917] border border-[#e8e2d5] rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">
                            {msg.content
                              .replace(/---BACKEND_HANDOFF---[\s\S]*?---END_HANDOFF---/g, "")
                              .trim()}
                          </p>

                          {/* Action button if room image is not generated yet */}
                          {!hasGeneratedImage && msg.id === "no-image-notice" && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsOpen(false);
                                onScrollToStudio?.();
                              }}
                              className="mt-3 w-full py-2 px-3 rounded-xl bg-[#c25e37] hover:bg-[#a84e2b] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                            >
                              <span>Go to Staging Studio</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Render Handoff Card if Eera emitted structured refinement parameters */}
                          {msg.handoff && (
                            <div className="mt-3 p-3 rounded-xl bg-[#fcf9f5] border border-[#c25e37]/30 text-[#1c1917] space-y-2">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8c3817]">
                                <Sparkles className="w-3.5 h-3.5 text-[#c25e37]" />
                                <span>Refinement Plan Compiled</span>
                              </div>

                              <div className="text-[11px] space-y-1 text-[#57534e]">
                                {msg.handoff.elementsToRetain && (
                                  <div>
                                    <span className="font-semibold text-[#1c1917]">Retain: </span>
                                    <span>{msg.handoff.elementsToRetain}</span>
                                  </div>
                                )}
                                {msg.handoff.modificationsRequested && (
                                  <div>
                                    <span className="font-semibold text-[#1c1917]">Modify: </span>
                                    <span>{msg.handoff.modificationsRequested}</span>
                                  </div>
                                )}
                                {msg.handoff.atmosphere && (
                                  <div>
                                    <span className="font-semibold text-[#1c1917]">Mood: </span>
                                    <span>{msg.handoff.atmosphere}</span>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => handleApplyChanges(msg.id, msg.handoff)}
                                disabled={isRegenerating}
                                className={`w-full mt-2 py-2 px-3 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition ${
                                  appliedHandoffId === msg.id
                                    ? "bg-emerald-600 text-white"
                                    : "bg-[#c25e37] hover:bg-[#a84e2b] text-white shadow-sm"
                                }`}
                              >
                                {appliedHandoffId === msg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Refinement Applied to Studio</span>
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Apply Changes & Relive Room</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#a8a29e] mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-[#78716c]">
                    <div className="w-6 h-6 rounded-full border border-[#e8e2d5] flex-shrink-0 overflow-hidden shadow-sm">
                      <EeraLogo className="w-full h-full" />
                    </div>
                    <div className="bg-white px-3.5 py-2 rounded-2xl rounded-tl-none border border-[#e8e2d5] text-[11px] flex items-center gap-1.5 text-[#57534e]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c25e37] animate-ping" />
                      <span>Eera is refining your room changes...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Multi-line Prompt Textarea Area */}
              <div className="p-3.5 bg-white border-t border-[#e8e2d5]">
                {!hasGeneratedImage ? (
                  <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#e8e2d5] text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#8c3817]">
                      <Lock className="w-3.5 h-3.5 text-[#c25e37]" />
                      <span>Textarea Locked Until Room is Styled</span>
                    </div>
                    <p className="text-[11px] text-[#57534e] leading-relaxed">
                      First select and stage a room in the Staging Studio. Eera will then unlock to tweak and refine your final render.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onScrollToStudio?.();
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#1c1917] hover:bg-[#2d2926] text-white text-[11px] font-semibold transition inline-flex items-center gap-1"
                    >
                      <span>Stage Room Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="space-y-2"
                  >
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        rows={3}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Describe any adjustments or tweaks you would like to make (e.g., warmer lighting, cream linen sofa, wooden coffee table, large fiddle-leaf plant)..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e2d5] text-xs bg-[#faf7f2] focus:outline-none focus:border-[#c25e37] text-[#1c1917] resize-none leading-relaxed placeholder:text-[#a8a29e]"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="text-[10px] text-[#a8a29e]">
                        Press Enter to send &bull; Shift+Enter for new line
                      </span>

                      <button
                        type="submit"
                        disabled={!inputText.trim() || isLoading}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          !inputText.trim() || isLoading
                            ? "bg-[#e8e2d5] text-[#a8a29e] cursor-not-allowed"
                            : "bg-[#c25e37] hover:bg-[#a84e2b] text-white shadow-sm"
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Changes</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
