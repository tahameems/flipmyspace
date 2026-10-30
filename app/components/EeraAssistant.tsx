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

// Friendly Abstract Face Logo (Bauhaus-inspired warm geometric face)
export function AbstractFace({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Eera Abstract Face Logo"
    >
      {/* Soft rounded head silhouette */}
      <circle cx="50" cy="50" r="46" fill="#fcf7ee" stroke="#1c1917" strokeWidth="3" />
      {/* Warm terracotta blush circle */}
      <circle cx="72" cy="54" r="14" fill="#c25e37" opacity="0.25" />
      <circle cx="28" cy="54" r="14" fill="#c25e37" opacity="0.25" />
      {/* Friendly abstract curved eyes */}
      <path
        d="M32 44 Q40 38 46 44"
        stroke="#1c1917"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M54 44 Q60 38 68 44"
        stroke="#1c1917"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Gentle abstract nose line */}
      <path
        d="M50 42 L48 57 L54 57"
        stroke="#c25e37"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Warm confident smile curve */}
      <path
        d="M38 68 Q50 78 62 68"
        stroke="#1c1917"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Small beauty dot / subtle artistic accent */}
      <circle cx="67" cy="62" r="2.5" fill="#c25e37" />
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
      setMessages([
        {
          id: "no-image-notice",
          role: "assistant",
          content:
            "Hi, I’m Eera! Before we can refine details, please select or upload a room photo in the Staging Studio and generate your styled space. Once styled, I'll be right here to help you tweak and perfect every element.",
          timestamp: "Just now",
        },
      ]);
    } else {
      setMessages([
        {
          id: "active-greeting",
          role: "assistant",
          content:
            "Hi, I’m Eera! Take a look at your newly styled room. Please list all the changes and tweaks you'd like to make to this space in the text area below, then type 'Relive' (or press Send) to regenerate your transformed room.",
          timestamp: "Just now",
        },
      ]);
    }
  }, [hasGeneratedImage]);

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

    // Check if user included the keyword "Relive" or if this is the refinement prompt
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

      // If the user typed "Relive" or Eera produced a handoff, automatically trigger the refinement pipeline!
      if (data.handoff || /relive/i.test(rawText)) {
        const modifications = data.handoff?.modificationsRequested || rawText.replace(/relive/gi, "").trim();
        const retain = data.handoff?.elementsToRetain || "Walls, perimeter floor plane, and natural daylight orientation";
        const modifiers = data.handoff?.promptModifiers || `${selectedStyle}, architectural photorealism, refined interior`;

        onApplyRefinement({
          modificationsRequested: modifications,
          elementsToRetain: retain,
          promptModifiers: modifiers,
        });
      }
    } catch (err: any) {
      // If offline or error, directly take the user's single prompt and trigger Relive re-generation
      const cleanPrompt = rawText.replace(/relive/gi, "").trim();
      onApplyRefinement({
        modificationsRequested: cleanPrompt,
        elementsToRetain: "Walls, flooring perspective, and window architecture",
        promptModifiers: `${selectedStyle}, photorealistic architectural design, ${cleanPrompt}`,
      });

      const fallbackMessage: Message = {
        id: `assistant-refine-${Date.now()}`,
        role: "assistant",
        content: `I've collected all your requested changes: "${cleanPrompt}". I am re-generating your room with these updates now. Let's see how the new version turns out!`,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = (messageId: string, handoff: any) => {
    if (!handoff) return;
    setAppliedHandoffId(messageId);
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
            className="w-14 h-14 rounded-full bg-[#ffffff] hover:bg-[#faf7f2] border-2 border-[#c25e37] text-[#1c1917] flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 group active:scale-95"
          >
            <div className="relative">
              <AbstractFace className="w-9 h-9" />
              <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
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
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#e8e2d5] flex items-center justify-center p-1 shadow-sm">
                  <AbstractFace className="w-8 h-8" />
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
                          <div className="w-6 h-6 rounded-full bg-white border border-[#e8e2d5] flex-shrink-0 mt-0.5 overflow-hidden p-0.5 shadow-sm">
                            <AbstractFace className="w-full h-full" />
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
                    <div className="w-6 h-6 rounded-full bg-white border border-[#e8e2d5] flex-shrink-0 p-0.5">
                      <AbstractFace className="w-full h-full" />
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
                        placeholder="List all changes you want (e.g., warmer lighting, cream linen sofa, wooden coffee table, large fiddle-leaf plant). Type 'Relive' to apply."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e2d5] text-xs bg-[#faf7f2] focus:outline-none focus:border-[#c25e37] text-[#1c1917] resize-none leading-relaxed placeholder:text-[#a8a29e]"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const addition = inputText.trim() ? `${inputText.trim()} - Relive` : "Warm amber lighting, lighter walnut wood, textured cushions, and indoor botanicals. Relive";
                            setInputText(addition);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#f4efe6] hover:bg-[#eadecc] text-[#8c3817] text-[11px] font-semibold border border-[#e8e2d5] transition"
                        >
                          + Type Relive
                        </button>
                        <span className="text-[10px] text-[#a8a29e] hidden sm:inline">
                          Press Enter to send
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={!inputText.trim() || isLoading}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          !inputText.trim() || isLoading
                            ? "bg-[#e8e2d5] text-[#a8a29e] cursor-not-allowed"
                            : "bg-[#c25e37] hover:bg-[#a84e2b] text-white shadow-sm"
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Relive Room</span>
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
