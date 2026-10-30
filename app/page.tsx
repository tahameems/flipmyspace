"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  UploadCloud,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Palette,
  Loader2,
  Info,
  Sliders,
  Columns,
  Home as HomeIcon,
  Bed,
  Briefcase,
  Utensils,
  Coffee,
  Bath,
  ArrowRight,
  ShieldCheck,
  Zap,
  Eye,
  Flame,
  Layers,
  Wand2
} from "lucide-react";

interface StyleOption {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  imageHint: string;
}

interface RoomTypeOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROOM_TYPES: RoomTypeOption[] = [
  { id: "Living Room", name: "Living Room", icon: HomeIcon },
  { id: "Bedroom", name: "Bedroom", icon: Bed },
  { id: "Home Office", name: "Home Office", icon: Briefcase },
  { id: "Dining Room", name: "Dining Room", icon: Utensils },
  { id: "Kitchen", name: "Kitchen", icon: Coffee },
  { id: "Bathroom", name: "Bathroom", icon: Bath },
];

const STYLES: StyleOption[] = [
  {
    id: "Modern Minimalist",
    name: "Modern Minimalist",
    subtitle: "Tailored low-profile seating, warm neutral undertones & concealed architectural storage",
    tag: "Trending Now",
    imageHint: "Warm cream bouclé, slim black accents & diffuse cove lighting"
  },
  {
    id: "Scandinavian",
    name: "Scandinavian",
    subtitle: "Blond ash woodwork, luminous hygge textiles, linen drapes & sun-kissed textures",
    tag: "Fan Favorite",
    imageHint: "Natural shearling, floating timber shelves & ceramic vessels"
  },
  {
    id: "Japandi",
    name: "Japandi",
    subtitle: "Wabi-sabi balance bridging organic Japanese tranquility with sleek Nordic craft",
    tag: "Zen Aesthetic",
    imageHint: "Low timber platform, bonsai greenery & shoji paper accents"
  },
  {
    id: "Industrial",
    name: "Industrial",
    subtitle: "Exposed brick textures, aged iron rivets, cognac leather & dramatic warehouse windows",
    tag: "Bold Loft",
    imageHint: "Weathered oak, cast iron light bars & matte charcoal trims"
  },
  {
    id: "Mid-Century Modern",
    name: "Mid-Century Modern",
    subtitle: "Sculptural walnut curves, brass sconces, olive accents & iconic mid-century silhouettes",
    tag: "Timeless Classic",
    imageHint: "Tapered dowel legs, statement credenzas & retro geometric art"
  },
  {
    id: "Bohemian",
    name: "Bohemian",
    subtitle: "Lush cascading monstera, rich terracotta accents, Moroccan rugs & sunlit warmth",
    tag: "Warm & Earthy",
    imageHint: "Rattan armchairs, woven wall tapestries & warm amber glow"
  },
];

// Sample demo images for instant one-click testing
const DEMO_SAMPLES = [
  {
    id: "empty-living",
    label: "Living Room Flip",
    empty: "https://cdn.stagehq.ai/landing-virtualstaging/livingroom_01_before.jpg",
    styled: "https://cdn.stagehq.ai/landing-virtualstaging/livingroom_01_after.jpg",
    style: "Modern Minimalist",
    room: "Living Room",
  },
  {
    id: "empty-bedroom",
    label: "Bedroom Flip",
    empty: "https://cdn.stagehq.ai/landing-virtualstaging/bedroom_01_before.jpg",
    styled: "https://cdn.stagehq.ai/landing-virtualstaging/bedroom_01_after.jpg",
    style: "Scandinavian",
    room: "Bedroom",
  },
];

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState<string>("Modern Minimalist");
  const [selectedRoomType, setSelectedRoomType] = useState<string>("Living Room");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Loading & generation state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>("");
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Results
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [roomAnalysis, setRoomAnalysis] = useState<string | null>(null);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState<boolean>(false);
  const [quotaDetails, setQuotaDetails] = useState<{
    help?: string;
    billingUrl?: string;
    analysis?: string;
  } | null>(null);

  // View mode for results (slider vs side-by-side)
  const [comparisonMode, setComparisonMode] = useState<"slider" | "side-by-side">("slider");
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Interactive Hero Demo Slider state
  const [heroSliderPos, setHeroSliderPos] = useState<number>(45);
  const [activeDemoIndex, setActiveDemoIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const studioRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Multi-phase realistic loading animation
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(12);
      setLoadingStatus("Scanning perspective, ceiling height & wall alignment with Gemini...");

      const phases = [
        { at: 2200, prog: 38, text: "Locking structural boundaries, doors & window daylight..." },
        { at: 5200, prog: 68, text: `Staging custom ${selectedStyle} furniture layout...` },
        { at: 8800, prog: 89, text: "Generating photorealistic textures, shadows & designer lighting..." },
        { at: 12200, prog: 97, text: "Putting the final touches on your space flip..." },
      ];

      const timeouts = phases.map((phase) =>
        setTimeout(() => {
          setLoadingProgress(phase.prog);
          setLoadingStatus(phase.text);
        }, phase.at)
      );

      return () => {
        timeouts.forEach(clearTimeout);
      };
    } else {
      setLoadingProgress(0);
    }
  }, [isLoading, selectedStyle]);

  const handleFile = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setErrorMessage("Please upload a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > 14 * 1024 * 1024) {
      setErrorMessage("Image is larger than 14MB. Please choose a smaller photo.");
      return;
    }

    setErrorMessage(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setGeneratedImage(null);
      setRoomAnalysis(null);
      setGenerationNotice(null);
    };
    reader.readAsDataURL(file);
  };

  const loadSample = async (sampleIndex: number) => {
    const sample = DEMO_SAMPLES[sampleIndex];
    setSelectedStyle(sample.style);
    setSelectedRoomType(sample.room);
    setErrorMessage(null);

    try {
      const response = await fetch(sample.empty);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setGeneratedImage(null);
        setRoomAnalysis(null);
        setGenerationNotice(null);
        studioRef.current?.scrollIntoView({ behavior: "smooth" });
      };
      reader.readAsDataURL(blob);
    } catch {
      setImagePreview(sample.empty);
      studioRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setImageFile(null);
    setImagePreview(null);
    setGeneratedImage(null);
    setRoomAnalysis(null);
    setGenerationNotice(null);
    setErrorMessage(null);
    setIsQuotaExceeded(false);
    setQuotaDetails(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDecorate = async () => {
    if (!imagePreview) {
      setErrorMessage("Please upload a room photo first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedImage(null);
    setGenerationNotice(null);
    setIsQuotaExceeded(false);
    setQuotaDetails(null);

    try {
      const response = await fetch("/api/decorate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: imagePreview,
          style: selectedStyle,
          roomType: selectedRoomType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isQuotaError) {
          setIsQuotaExceeded(true);
          setQuotaDetails({
            help: data.helpMessage,
            billingUrl: data.billingUrl,
            analysis: data.analysis,
          });
          if (data.analysis) {
            setRoomAnalysis(data.analysis);
          }
          return;
        }
        throw new Error(data.error || "Failed to flip room. Please try again.");
      }

      setGeneratedImage(data.imageUrl);
      if (data.analysis) {
        setRoomAnalysis(data.analysis);
      }
      if (data.notice) {
        setGenerationNotice(data.notice);
      }

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `flipmyspace-${selectedStyle.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollToStudio = () => {
    studioRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative overflow-hidden">
      {/* Luminous Warm Gradient Orbs & Active Energetic Overlays */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-gradient-to-b from-rose-500/25 via-amber-500/20 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[400px] -left-32 w-[650px] h-[650px] bg-gradient-to-tr from-pink-600/20 via-purple-600/15 to-transparent blur-[150px] rounded-full" />
        <div className="absolute top-[1100px] -right-32 w-[700px] h-[700px] bg-gradient-to-bl from-amber-500/25 via-orange-600/20 to-transparent blur-[160px] rounded-full" />
        <div className="absolute top-[2000px] left-1/4 w-[800px] h-[500px] bg-gradient-to-r from-rose-600/15 via-violet-600/15 to-amber-500/15 blur-[150px] rounded-full" />
      </div>

      {/* Navigation Bar */}
      <nav className="glass-nav-warm sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-orange-400 flex items-center justify-center text-white shadow-lg glow-amber transform hover:rotate-6 transition">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-2xl tracking-tight text-white font-sans">
                FlipMy<span className="bg-gradient-to-r from-amber-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">Space</span>
              </span>
              <span className="hidden sm:inline-flex items-center text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-amber-400/30 text-amber-300">
                AI Studio
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-200">
            <button onClick={scrollToStudio} className="hover:text-amber-300 transition flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-rose-400" />
              Flip Studio
            </button>
            <a href="#demo" className="hover:text-amber-300 transition">
              Live Slider
            </a>
            <a href="#styles" className="hover:text-amber-300 transition">
              Vibes &amp; Aesthetics
            </a>
            <a href="#features" className="hover:text-amber-300 transition">
              Why Us
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadSample(0)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/15 text-white transition backdrop-blur shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Try Demo
            </button>
            <button
              onClick={scrollToStudio}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 hover:from-rose-600 hover:via-amber-600 hover:to-orange-600 text-white shadow-lg glow-warm transition active:scale-95"
            >
              Start Free Flip
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Floating Energetic Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold mb-6 shadow-sm backdrop-blur">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>Next-Generation Spatial AI Remodeling</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Flip Any Space into a{" "}
          <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-orange-400 bg-clip-text text-transparent">
            Dream Room
          </span>{" "}
          in Seconds
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
          Snap a picture of an empty room or dated interior. Our spatial Gemini AI preserves your structural walls and daylight, instantly remodeling the space with high-end designer furniture.
        </p>

        {/* Hero CTA row */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={scrollToStudio}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-black bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 hover:from-rose-600 hover:via-amber-600 hover:to-orange-600 text-white shadow-2xl glow-warm flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-100" />
            Upload Photo &amp; Flip Room
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          <button
            onClick={() => loadSample(0)}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl text-sm font-bold bg-white/10 hover:bg-white/15 border border-white/20 text-white transition flex items-center justify-center gap-2 backdrop-blur shadow-sm"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            See Live Demo Flip
          </button>
        </div>

        {/* Social Proof Stats with Warm Accent Dividers */}
        <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
          <div className="border-l-2 border-rose-500/60 pl-4 bg-white/[0.02] py-2 rounded-r-xl">
            <div className="text-2xl font-black text-white tracking-tight">500,000+</div>
            <div className="text-xs text-amber-200/80 font-medium mt-0.5">Spaces Remodeled</div>
          </div>
          <div className="border-l-2 border-amber-500/60 pl-4 bg-white/[0.02] py-2 rounded-r-xl">
            <div className="text-2xl font-black text-white tracking-tight">100%</div>
            <div className="text-xs text-amber-200/80 font-medium mt-0.5">Architecture Maintained</div>
          </div>
          <div className="border-l-2 border-orange-500/60 pl-4 bg-white/[0.02] py-2 rounded-r-xl">
            <div className="text-2xl font-black text-white tracking-tight">&lt; 10s</div>
            <div className="text-xs text-amber-200/80 font-medium mt-0.5">Instant Rendering</div>
          </div>
          <div className="border-l-2 border-purple-500/60 pl-4 bg-white/[0.02] py-2 rounded-r-xl">
            <div className="text-2xl font-black text-white tracking-tight">8K Ultra</div>
            <div className="text-xs text-amber-200/80 font-medium mt-0.5">Photorealistic Output</div>
          </div>
        </div>

        {/* Interactive Before/After Split Hero Slider Demo */}
        <div id="demo" className="mt-16 relative max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black aspect-[16/10] sm:aspect-[16/9] group select-none ring-1 ring-amber-400/20">
            {/* Background Styled Image */}
            <img
              src={DEMO_SAMPLES[activeDemoIndex].styled}
              alt="Flipped Room After"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/* Foreground Empty Image with clip path */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `polygon(0 0, ${heroSliderPos}% 0, ${heroSliderPos}% 100%, 0 100%)` }}
            >
              <img
                src={DEMO_SAMPLES[activeDemoIndex].empty}
                alt="Empty Space Before"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* Slider Dividing Bar with Glow */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-rose-500 to-amber-300 shadow-2xl z-20 pointer-events-none"
              style={{ left: `${heroSliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-orange-400 text-white shadow-xl flex items-center justify-center font-black text-sm tracking-tighter border-2 border-white">
                &lsaquo;&rsaquo;
              </div>
            </div>

            {/* Interactive Slider Input */}
            <input
              type="range"
              min="0"
              max="100"
              value={heroSliderPos}
              onChange={(e) => setHeroSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              aria-label="Drag before and after transformation"
            />

            {/* Labels */}
            <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Before: Empty Space
            </div>
            <div className="absolute top-4 right-4 z-10 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 backdrop-blur-md text-white text-xs font-bold border border-white/25 flex items-center gap-1.5 pointer-events-none shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              After: FlipMySpace ({DEMO_SAMPLES[activeDemoIndex].style})
            </div>

            {/* Floating Instruction Hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-black/70 backdrop-blur border border-white/15 text-amber-200 text-xs pointer-events-none flex items-center gap-2 shadow-lg">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Slide back and forth to inspect the flip</span>
            </div>
          </div>

          {/* Demo switcher pills */}
          <div className="mt-4 flex items-center justify-center gap-2.5">
            {DEMO_SAMPLES.map((sample, idx) => (
              <button
                key={sample.id}
                onClick={() => setActiveDemoIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  activeDemoIndex === idx
                    ? "bg-gradient-to-r from-rose-500/30 to-amber-500/30 text-amber-200 border border-amber-400/50 shadow-amber-500/20"
                    : "bg-white/5 text-slate-300 border border-white/10 hover:text-white hover:bg-white/10"
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Staging Studio */}
      <section ref={studioRef} className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-3">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Interactive Staging Studio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Remodel Your Space in 3 Clicks
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Upload your room, pick the layout and aesthetic, and let FlipMySpace generate the staged render.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-100 flex items-start gap-3 backdrop-blur shadow-xl animate-fade-in max-w-4xl mx-auto">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <span className="font-bold text-white">Notice: </span>
              {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-300 hover:text-white text-sm font-bold p-1"
            >
              &times;
            </button>
          </div>
        )}

        {/* Google API Quota Requirement Banner */}
        {isQuotaExceeded && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-rose-950/60 border border-amber-400/50 text-white backdrop-blur shadow-2xl animate-fade-in max-w-4xl mx-auto space-y-4 ring-1 ring-amber-400/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Google GenAI Image Staging: Free Tier Quota Required
                  </h3>
                  <p className="text-xs text-amber-300/90 font-medium">
                    Your Gemini vision analysis succeeded, but image generation requires billing enabled.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuotaExceeded(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            {quotaDetails?.analysis && (
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200">
                <span className="font-bold text-amber-300">Gemini 3.8 Spatial Room Analysis: </span>
                {quotaDetails.analysis}
              </div>
            )}

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-white/[0.03] p-4 rounded-xl border border-white/10">
              <p>
                <strong>Why this happened:</strong> Your Google API key successfully used{" "}
                <span className="text-amber-300 font-mono">gemini-3.8-flash</span> to inspect the floor lines, wall perspective, and daylight from your uploaded photo.
              </p>
              <p>
                However, Google Cloud assigns a <span className="text-rose-300 font-semibold">0-request limit (limit: 0)</span> on free-tier projects for image generation models (<span className="text-amber-300 font-mono">gemini-3.1-flash-image</span> and <span className="text-amber-300 font-mono">imagen-3.0</span>).
              </p>
              <p>
                To enable Google to return full photorealistic staged renders of your uploaded room, link a Pay-As-You-Go billing account in Google AI Studio or Google Cloud Console.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={quotaDetails?.billingUrl || "https://ai.google.dev/gemini-api/docs/rate-limits"}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-lg transition flex items-center gap-1.5"
              >
                <span>Enable Google Cloud Image Quota</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => loadSample(0)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Interactive Slider Demo</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Step 1: Upload Room Photo */}
          <div className="lg:col-span-5 glass-panel-warm rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md">
                  1
                </span>
                <h3 className="font-bold text-white text-base">Upload Your Room</h3>
              </div>
              {imagePreview && (
                <button
                  onClick={handleClear}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>

            {/* Drag & Drop Upload Container */}
            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[300px] ${
                  isDragging
                    ? "border-amber-400 bg-amber-500/15 scale-[0.99]"
                    : "border-white/20 hover:border-amber-400/70 bg-black/30 hover:bg-black/50"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500/20 via-amber-500/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-white text-base">
                  Click or drag your room photo
                </h4>
                <p className="text-xs text-slate-300 mt-1.5 max-w-xs leading-relaxed">
                  Unfurnished space or messy room photo (JPEG, PNG, or WebP up to 14MB).
                </p>
                <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-amber-200 text-xs font-medium">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  Supports JPG, PNG &amp; WebP
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black group aspect-[4/3] shadow-lg">
                <img
                  src={imagePreview}
                  alt="Room to flip preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-black shadow-lg hover:bg-slate-100 transition"
                  >
                    Change Photo
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-black shadow-lg hover:bg-rose-700 transition"
                  >
                    Remove
                  </button>
                </div>
                <span className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-lg font-bold border border-white/20">
                  Target Room
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            {/* Quick Demo Pre-load Bar */}
            <div className="pt-2">
              <span className="text-xs text-amber-200/90 block mb-2 font-semibold">
                No photo on hand? Try instant demo rooms:
              </span>
              <div className="flex gap-2">
                {DEMO_SAMPLES.map((sample, idx) => (
                  <button
                    key={sample.id}
                    onClick={() => loadSample(idx)}
                    type="button"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 hover:border-amber-400/50 text-xs text-slate-200 hover:text-white transition flex items-center justify-center gap-1.5 font-semibold backdrop-blur"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2 & 3: Room Type & Aesthetic Selection */}
          <div className="lg:col-span-7 glass-panel-warm rounded-3xl p-6 sm:p-7 space-y-6">
            {/* Step 2: Room Type */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md">
                    2
                  </span>
                  <h3 className="font-bold text-white text-base">Select Room Category</h3>
                </div>
                <span className="text-xs text-amber-300 font-bold">{selectedRoomType}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ROOM_TYPES.map((room) => {
                  const isSelected = selectedRoomType === room.id;
                  const Icon = room.icon;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomType(room.id)}
                      type="button"
                      className={`p-3 rounded-xl border transition-all text-left flex items-center gap-2.5 ${
                        isSelected
                          ? "border-amber-400 bg-gradient-to-r from-rose-500/25 to-amber-500/25 text-white shadow-md ring-1 ring-amber-400/50"
                          : "border-white/10 bg-black/30 hover:bg-black/50 text-slate-300"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-gradient-to-tr from-rose-500 to-amber-500 text-white" : "bg-white/10 text-slate-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold">{room.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Interior Style */}
            <div id="styles">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md">
                    3
                  </span>
                  <h3 className="font-bold text-white text-base">Choose Design Aesthetic</h3>
                </div>
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  {selectedStyle}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {STYLES.map((style) => {
                  const isSelected = selectedStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      type="button"
                      className={`p-4 rounded-2xl border transition-all text-left relative flex flex-col justify-between overflow-hidden group card-hover-warm ${
                        isSelected
                          ? "border-amber-400 bg-gradient-to-br from-rose-950/70 via-purple-950/60 to-black ring-2 ring-amber-400/50 shadow-xl glow-warm"
                          : "border-white/15 bg-black/35 hover:border-white/30 hover:bg-black/55"
                      }`}
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-amber-400/25 text-amber-200 border border-amber-300/40"
                                : "bg-white/10 text-slate-300"
                            }`}
                          >
                            {style.tag}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </div>
                        <h4 className="font-black text-sm text-white">{style.name}</h4>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {style.subtitle}
                        </p>
                      </div>
                      <div className="mt-3 text-[10px] text-amber-300/90 font-mono flex items-center gap-1">
                        &bull; {style.imageHint}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={handleDecorate}
                disabled={!imagePreview || isLoading}
                className={`w-full py-4 rounded-2xl font-black text-sm text-white shadow-2xl flex items-center justify-center gap-2.5 transition transform active:scale-98 ${
                  !imagePreview || isLoading
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/10"
                    : "bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 hover:from-rose-600 hover:via-amber-600 hover:to-orange-600 shadow-amber-500/25 cursor-pointer glow-warm"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Flipping Room with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-200" />
                    <span>
                      Flip {selectedRoomType} into {selectedStyle}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* Progress feedback bar */}
              {isLoading && (
                <div className="mt-4 space-y-2 animate-fade-in">
                  <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/15">
                    <div
                      className="bg-gradient-to-r from-rose-500 via-amber-400 to-orange-400 h-full transition-all duration-500 rounded-full shadow-lg"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-amber-200">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      {loadingStatus}
                    </span>
                    <span className="font-mono text-amber-300 font-bold">{loadingProgress}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Studio Showcase */}
        {generatedImage && (
          <div
            ref={resultsRef}
            className="mt-16 glass-panel-warm rounded-3xl p-6 sm:p-10 border border-amber-400/40 shadow-2xl space-y-8 animate-fade-in ring-1 ring-amber-400/20"
          >
            {/* Results Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Space Flip Completed
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {selectedStyle} {selectedRoomType}
                </h3>
              </div>

              {/* View Switcher & Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-xl bg-black/60 p-1 border border-white/15 text-xs font-bold">
                  <button
                    onClick={() => setComparisonMode("slider")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                      comparisonMode === "slider"
                        ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Split Slider
                  </button>
                  <button
                    onClick={() => setComparisonMode("side-by-side")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                      comparisonMode === "side-by-side"
                        ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    Side-by-Side
                  </button>
                </div>

                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 hover:from-rose-600 hover:via-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-lg glow-amber flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4" />
                  Download 8K
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-bold flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Flip Another Room
                </button>
              </div>
            </div>

            {/* Comparison Display */}
            {comparisonMode === "slider" ? (
              <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black aspect-[16/10] sm:aspect-[16/9] select-none">
                {/* Background (After image) */}
                <img
                  src={generatedImage}
                  alt="Decorated room after"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />

                {/* Foreground (Before image) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                >
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Original room before"
                      className="absolute inset-0 w-full h-full object-cover"
                      draggable={false}
                    />
                  )}
                </div>

                {/* Vertical Divider */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-rose-500 to-amber-300 shadow-2xl z-20 pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-orange-400 text-white shadow-xl flex items-center justify-center font-black text-sm tracking-tighter border-2 border-white">
                    &lsaquo;&rsaquo;
                  </div>
                </div>

                {/* Interactive Slider Input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  aria-label="Drag before and after transformation"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-bold border border-white/20 pointer-events-none">
                  Before: Empty Room
                </div>
                <div className="absolute top-4 right-4 z-10 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 backdrop-blur-md text-white text-xs font-bold border border-white/25 flex items-center gap-1.5 pointer-events-none shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  After: FlipMySpace ({selectedStyle})
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-black/70 backdrop-blur border border-white/15 text-amber-200 text-xs pointer-events-none flex items-center gap-2 shadow-lg">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Drag slider left and right to inspect the flip</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Room */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-slate-300">
                    <span>Original Room</span>
                    <span className="uppercase text-[10px] tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15">
                      Before
                    </span>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black aspect-[4/3] shadow-md">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Original room"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* AI Staged Room */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      FlipMySpace Render ({selectedStyle})
                    </span>
                    <span className="uppercase text-[10px] tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500/30 to-amber-500/30 text-amber-200 border border-amber-400/40 font-black">
                      After
                    </span>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/60 bg-black aspect-[4/3] group shadow-2xl">
                    <img
                      src={generatedImage}
                      alt="Decorated room"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={handleDownload}
                        className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-black shadow-lg hover:bg-slate-100 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download High-Res
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gemini Architectural Analysis Card */}
            {roomAnalysis && (
              <div className="p-5 rounded-2xl bg-black/50 border border-white/15 flex items-start gap-3.5 text-xs text-slate-200 backdrop-blur">
                <Info className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-black text-white text-sm mb-1 flex items-center gap-1.5">
                    Gemini 3.8 Spatial Layout Scan
                  </h4>
                  <p className="leading-relaxed text-slate-300">{roomAnalysis}</p>
                </div>
              </div>
            )}

            {/* Informational Notice */}
            {generationNotice && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/50 to-amber-950/50 border border-amber-400/30 text-xs text-amber-200 flex items-start gap-3 backdrop-blur">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{generationNotice}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Feature Section with Warm Energetic Cards */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black text-amber-400 tracking-wider uppercase">
            Built for Real Estate &amp; Homeowners
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            Why FlipMySpace Outperforms Traditional Staging
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300">
            Powered by spatial computer vision that respects true room dimensions without artificial warping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel-warm p-8 rounded-3xl space-y-4 hover:border-amber-400/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Zero Structural Distortion</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our Gemini 3.8 vision pipeline pins walls, doorways, floor transitions, and ceiling lines so your space stays authentic to real-life dimensions.
            </p>
          </div>

          <div className="glass-panel-warm p-8 rounded-3xl space-y-4 hover:border-amber-400/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Curated Luxury Aesthetics</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Choose from Modern Minimalist, Japandi, Scandinavian, and retro styles. Each theme sources designer-grade furniture, bouclé textures, and warm lighting.
            </p>
          </div>

          <div className="glass-panel-warm p-8 rounded-3xl space-y-4 hover:border-amber-400/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Instant Listing-Ready Renders</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Skip weeks of expensive physical furniture staging or complex 3D CAD modeling. Receive high-res staged spaces in seconds ready for social media or MLS.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/60 backdrop-blur-xl py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Flame className="w-4 h-4" />
            </div>
            <span className="font-black text-white text-sm">FlipMySpace</span>
            <span>&bull; AI Spatial Room Remodeling &amp; Virtual Staging</span>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <a href="#demo" className="hover:text-amber-300 transition">
              Live Slider
            </a>
            <a href="#styles" className="hover:text-amber-300 transition">
              Aesthetics
            </a>
            <a href="#features" className="hover:text-amber-300 transition">
              Technology
            </a>
          </div>
          <div className="text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} FlipMySpace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
