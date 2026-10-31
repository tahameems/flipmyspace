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
      className={`rounded-full shadow-sm flex-shrink-0 aspect-square object-contain ${className}`}
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
  isLoggedIn?: boolean;
  onOpenAuth?: () => void;
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
  isLoggedIn = false,
  onOpenAuth,
}: EeraAssistantProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appliedHandoffId, setAppliedHandoffId] = useState<string | null>(null);

  const hasGeneratedImage = Boolean(generatedImage);

  // Screen size detection for responsive mobile layout
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Position state for draggable floating window (used on desktop >= 640px)
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

  // Initialize position to bottom right of viewport on desktop
  useEffect(() => {
    if (typeof window !== "undefined" && !position && window.innerWidth >= 640) {
      const initialX = Math.max(16, window.innerWidth - 410);
      const initialY = Math.max(16, window.innerHeight - 620);
      setPosition({ x: initialX, y: initialY });
    }
  }, [position]);

  // Handle window resizing to keep chat window on screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        // On mobile, rely on fixed CSS bottom sheet docking
        return;
      }
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

  // Update initial message depending on authentication and whether room image is generated
  useEffect(() => {
    if (!isLoggedIn) {
      hasInitializedGreetingRef.current = false;
      isRefinedRef.current = false;
      waitingForRefinementRef.current = false;
      setMessages([
        {
          id: "auth-required-notice",
          role: "assistant",
          content:
            "Hi, I’m Eera! To stage your space, customize room typologies, and collaborate on interior design refinements, please sign in or create a free account.",
          timestamp: "Just now",
        },
      ]);
    } else if (!hasGeneratedImage) {
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
  }, [isLoggedIn, hasGeneratedImage]);

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

  // Dragging event handlers for header (desktop only, to keep mobile scroll pristine)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
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
    if (!isDraggingRef.current || isMobile) return;
    const newX = e.clientX - dragOffsetRef.current.x;
    const newY = e.clientY - dragOffsetRef.current.y;
    const maxX = Math.max(16, window.innerWidth - 390);
    const maxY = Math.max(16, window.innerHeight - 100);
    setPosition({
      x: Math.min(Math.max(10, newX), maxX),
      y: Math.min(Math.max(10, newY), maxY),
    });
  }, [isMobile]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  // Touch drag support for tablets/desktop with touchscreens (disabled on mobile phones)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile) return;
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
    if (isMobile || !isDraggingRef.current || e.touches.length !== 1) return;
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

  // Text to speech helper powered by Fish Audio with browser speech fallback
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const speakText = async (text: string, force = false) => {
    if (!voiceEnabled && !force) return;
    stopSpeaking();

    const cleanText = text
      .replace(/---BACKEND_HANDOFF---[\s\S]*?---END_HANDOFF---/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\*\*.*?\*\*/g, (m) => m.replace(/\*/g, ""))
      .replace(/[*_#`~]/g, "")
      .trim();

    if (!cleanText) return;

    setIsSpeaking(true);

    // 1. Primary: High-fidelity Fish Audio TTS stream
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
        return;
      }
    } catch {
      // Fall through to browser speech fallback
    }

    // 2. Fallback: Browser Web Speech API
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    } catch {
      setIsSpeaking(false);
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking();
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
      speakText("Voice enabled! I'm ready to discuss your room makeover.", true);
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
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 sm:gap-3">
          {/* Subtle Attention Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c1917] text-[#ffffff] text-xs font-medium shadow-lg border border-[#e8e2d5] animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#c25e37] animate-pulse" />
            <span>Refine your room with <strong>Eera</strong></span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            type="button"
            aria-label="Open Eera AI Design Assistant"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#faf7f2] hover:bg-[#ffffff] border-2 border-[#c25e37] text-[#1c1917] flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 group active:scale-95 overflow-hidden p-0.5 flex-shrink-0"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <EeraLogo className="w-full h-full" />
              <span className={`absolute top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white ${
                hasGeneratedImage ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
              }`} />
            </div>
          </button>
        </div>
      )}

      {/* Floating Responsive Chatbot Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          style={
            !isMobile && position
              ? {
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                }
              : undefined
          }
          className={`fixed z-50 bg-[#ffffff] border-2 border-[#e8e2d5] shadow-2xl flex flex-col overflow-hidden transition-all duration-200 select-none ${
            isMobile
              ? isMinimized
                ? "inset-x-3 bottom-3 h-[64px] rounded-2xl"
                : "inset-x-3 bottom-3 h-[520px] max-h-[85dvh] rounded-3xl"
              : isMinimized
              ? "w-[400px] h-[74px] rounded-3xl"
              : "w-[400px] h-[580px] max-h-[88vh] rounded-3xl"
          } ${!position && !isMobile ? "bottom-6 right-6" : ""}`}
        >
          {/* Draggable Header */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`bg-[#fcfaf7] border-b border-[#e8e2d5] px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between select-none ${
              !isMobile ? "cursor-move active:cursor-grabbing" : ""
            }`}
            title={!isMobile ? "Click and drag to move Eera anywhere on your screen" : undefined}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#faf7f2] border border-[#e8e2d5] flex items-center justify-center p-0.5 shadow-sm overflow-hidden">
                  <EeraLogo className="w-full h-full" />
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${
                  hasGeneratedImage ? "bg-emerald-500" : "bg-amber-400"
                }`} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-[#1c1917]">Eera</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f4efe6] text-[#8c3817] font-semibold border border-[#e8e2d5]">
                    Relive Assistant
                  </span>
                  {isSpeaking && (
                    <div className="flex items-center gap-0.5 h-3 ml-0.5" title="Speaking with Fish Audio">
                      <span className="w-0.5 h-3 bg-[#c25e37] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-0.5 h-2 bg-[#c25e37] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-0.5 h-3.5 bg-[#c25e37] rounded-full animate-bounce" />
                    </div>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#78716c]">
                  <GripHorizontal className="w-3 h-3 text-[#a8a29e]" />
                  <span>Drag to reposition</span>
                </div>
                <div className="sm:hidden text-[10px] text-[#78716c]">
                  <span>AI Design Companion</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 text-[#78716c]">
              <button
                onClick={toggleVoice}
                title={voiceEnabled ? "Mute Eera's voice" : "Enable Eera's voice (Fish Audio)"}
                className={`p-1.5 rounded-lg hover:bg-[#eadecc] transition ${
                  voiceEnabled ? "text-[#c25e37] bg-[#f4efe6]" : "text-[#78716c]"
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
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
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
              <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-4 space-y-3 sm:space-y-3.5 bg-[#faf7f2]/50 select-text">
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

                          {/* Action button if not signed in */}
                          {!isLoggedIn && msg.id === "auth-required-notice" && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsOpen(false);
                                onOpenAuth?.();
                              }}
                              className="mt-3 w-full py-2 px-3 rounded-xl bg-[#c25e37] hover:bg-[#a84e2b] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                              <span>Sign Up &bull; Get 5 Free Designs</span>
                            </button>
                          )}

                          {/* Action button if room image is not generated yet */}
                          {isLoggedIn && !hasGeneratedImage && msg.id === "no-image-notice" && (
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
                      <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-[#a8a29e]">
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => speakText(msg.content, true)}
                            className="hover:text-[#c25e37] transition inline-flex items-center gap-1 font-medium cursor-pointer"
                            title="Listen to Eera (Fish Audio)"
                          >
                            <Volume2 className="w-3 h-3 text-[#c25e37]" />
                            <span>Listen</span>
                          </button>
                        )}
                      </div>
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
              <div className="p-3 sm:p-3.5 bg-white border-t border-[#e8e2d5]">
                {!isLoggedIn ? (
                  <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#e8e2d5] text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#8c3817]">
                      <Lock className="w-3.5 h-3.5 text-[#c25e37]" />
                      <span>Account Required to Use Assistant</span>
                    </div>
                    <p className="text-[11px] text-[#57534e] leading-relaxed">
                      Sign in or create a free account to unlock Eera and get 5 free room transformations.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenAuth?.();
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#c25e37] hover:bg-[#a84e2b] text-white text-[11px] font-semibold transition inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-200" />
                      <span>Sign In / Sign Up</span>
                    </button>
                  </div>
                ) : !hasGeneratedImage ? (
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
                        rows={2}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Describe adjustments (e.g., warmer lighting, cream sofa, fiddle-leaf plant)..."
                        className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-[#e8e2d5] text-xs bg-[#faf7f2] focus:outline-none focus:border-[#c25e37] text-[#1c1917] resize-none leading-relaxed placeholder:text-[#a8a29e]"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="hidden sm:inline text-[10px] text-[#a8a29e]">
                        Press Enter to send &bull; Shift+Enter for new line
                      </span>
                      <span className="sm:hidden text-[10px] text-[#a8a29e]">
                        Tap Send to update
                      </span>

                      <button
                        type="submit"
                        disabled={!inputText.trim() || isLoading}
                        className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
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
