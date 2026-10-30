"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Minimize2,
  Maximize2,
  ArrowRight,
  Check,
  Palette
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
  isRegenerating?: boolean;
}

const QUICK_SUGGESTIONS = [
  "Warm up the lighting & add soft ambient lamps 💡",
  "Change sofa to cream linen with textured cushions 🛋️",
  "Add large indoor plants like fiddle-leaf fig 🌿",
  "Keep walls & flooring, swap the rug for woven jute 🧶",
  "Make the atmosphere more minimalist & spacious ✨",
];

export default function EeraAssistant({
  selectedStyle,
  selectedRoomType,
  generatedImage,
  roomAnalysis,
  customApiKey,
  onApplyRefinement,
  isRegenerating = false,
}: EeraAssistantProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appliedHandoffId, setAppliedHandoffId] = useState<string | null>(null);

  // Initial greeting
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      role: "assistant",
      content:
        "Hi, I’m Eera. Take a look at your newly styled room—what would you most like to tweak or enhance in this space?",
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Text to speech helper
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Remove markdown handoff blocks from speech
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
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
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
            hasGeneratedImage: Boolean(generatedImage),
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
    } catch (err: any) {
      const fallbackMessage: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "I'm listening closely. Could you tell me one specific detail—such as the rug, lighting, or sofa—you’d like to adjust in your space?",
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
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
          </button>
        </div>
      )}

      {/* Floating Chatbot Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] bg-[#ffffff] rounded-3xl border border-[#e8e2d5] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? "h-[74px]" : "h-[560px] max-h-[85vh]"
          }`}
        >
          {/* Header */}
          <div className="bg-[#fcfaf7] border-b border-[#e8e2d5] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#e8e2d5] flex items-center justify-center p-1 shadow-sm">
                  <AbstractFace className="w-8 h-8" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-[#1c1917]">Eera</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f4efe6] text-[#8c3817] font-semibold border border-[#e8e2d5]">
                    AI Designer
                  </span>
                </div>
                <p className="text-[11px] text-[#78716c]">
                  Refining {selectedRoomType} ({selectedStyle})
                </p>
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#faf7f2]/50">
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-start gap-2 max-w-[85%]">
                        {!isUser && (
                          <div className="w-6 h-6 rounded-full bg-white border border-[#e8e2d5] flex-shrink-0 mt-0.5 overflow-hidden p-0.5">
                            <AbstractFace className="w-full h-full" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                            isUser
                              ? "bg-[#1c1917] text-white rounded-tr-none"
                              : "bg-white text-[#1c1917] border border-[#e8e2d5] rounded-tl-none"
                          }`}
                        >
                          {/* Strip raw handoff tags from visible text if present */}
                          <p className="whitespace-pre-wrap">
                            {msg.content
                              .replace(/---BACKEND_HANDOFF---[\s\S]*?---END_HANDOFF---/g, "")
                              .trim()}
                          </p>

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
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Apply Changes & Re-Render Room</span>
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
                      <span>Eera is thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestions pills */}
              <div className="px-3 py-2 bg-white border-t border-[#f3ede2] overflow-x-auto flex gap-1.5 no-scrollbar">
                {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion)}
                    disabled={isLoading}
                    className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-[#f4efe6] hover:bg-[#eadecc] text-[#57534e] hover:text-[#1c1917] border border-[#e8e2d5] transition flex-shrink-0"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-white border-t border-[#e8e2d5]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Tell Eera what to tweak or enhance..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#e8e2d5] text-xs bg-[#faf7f2] focus:outline-none focus:border-[#c25e37] text-[#1c1917]"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                      !inputText.trim() || isLoading
                        ? "bg-[#e8e2d5] text-[#a8a29e] cursor-not-allowed"
                        : "bg-[#c25e37] hover:bg-[#a84e2b] text-white shadow-sm"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
