"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
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
  Layers,
  ArrowUpRight,
  Maximize2
} from "lucide-react";

interface StyleOption {
  id: string;
  name: string;
  code: string;
  subtitle: string;
  material: string;
}

interface RoomTypeOption {
  id: string;
  name: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROOM_TYPES: RoomTypeOption[] = [
  { id: "Living Room", name: "Living Room", code: "R-01", icon: HomeIcon },
  { id: "Bedroom", name: "Bedroom", code: "R-02", icon: Bed },
  { id: "Home Office", name: "Home Office", code: "R-03", icon: Briefcase },
  { id: "Dining Room", name: "Dining Room", code: "R-04", icon: Utensils },
  { id: "Kitchen", name: "Kitchen", code: "R-05", icon: Coffee },
  { id: "Bathroom", name: "Bathroom", code: "R-06", icon: Bath },
];

const STYLES: StyleOption[] = [
  {
    id: "Modern Minimalist",
    name: "Modern Minimalist",
    code: "ST-01",
    subtitle: "Low-profile geometric planes, monolithic forms & concealed structural storage",
    material: "Plaster &bull; Linen &bull; Matte Iron"
  },
  {
    id: "Scandinavian",
    name: "Scandinavian",
    code: "ST-02",
    subtitle: "Blond ash woodwork, tactile hygge wool, linen textiles & diffuse daylighting",
    material: "Light Oak &bull; Wool &bull; Ceramic"
  },
  {
    id: "Japandi",
    name: "Japandi",
    code: "ST-03",
    subtitle: "Wabi-sabi equilibrium uniting organic Japanese restraint with Nordic utilitarianism",
    material: "Cedar &bull; Paper Lanterns &bull; Clay"
  },
  {
    id: "Industrial",
    name: "Industrial",
    code: "ST-04",
    subtitle: "Exposed brick masonry, structural black steel, cognac leather & grid glazing",
    material: "Cold-Rolled Steel &bull; Brick &bull; Leather"
  },
  {
    id: "Mid-Century Modern",
    name: "Mid-Century Modern",
    code: "ST-05",
    subtitle: "Functional curved walnut silhouettes, brass accents & disciplined 1950s ergonomics",
    material: "Oiled Walnut &bull; Brass &bull; Olive Weave"
  },
  {
    id: "Bohemian",
    name: "Bohemian",
    code: "ST-06",
    subtitle: "Textured terracotta, layered kilim weaves, organic rattan & abundant botanicals",
    material: "Terracotta &bull; Rattan &bull; Jute"
  },
];

// Verified 1:1 camera-angle matching virtual staging pairs
const DEMO_SAMPLES = [
  {
    id: "living-room",
    label: "Living Room (Study 01)",
    empty: "https://cdn.stagehq.ai/landing-virtualstaging/livingroom_01_before.jpg",
    styled: "https://cdn.stagehq.ai/landing-virtualstaging/livingroom_01_after.jpg",
    style: "Modern Minimalist",
    room: "Living Room",
  },
  {
    id: "bedroom",
    label: "Bedroom (Study 02)",
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
  const [heroSliderPos, setHeroSliderPos] = useState<number>(48);
  const [activeDemoIndex, setActiveDemoIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const studioRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Structural loading progression
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(14);
      setLoadingStatus("Measuring spatial coordinates & ceiling lines with Gemini 3.8...");

      const phases = [
        { at: 2000, prog: 40, text: "Locking perimeter walls, floor horizon & fenestration..." },
        { at: 5000, prog: 70, text: `Synthesizing ${selectedStyle} furniture layout to scale...` },
        { at: 8500, prog: 90, text: "Balancing natural shadow falloff & material reflectance..." },
        { at: 12000, prog: 98, text: "Generating architectural master render..." },
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
      setErrorMessage("Please supply an image in JPEG, PNG, or WebP format.");
      return;
    }

    if (file.size > 14 * 1024 * 1024) {
      setErrorMessage("File exceeds the 14MB size limit. Please provide a lighter asset.");
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
      setIsQuotaExceeded(false);
      setQuotaDetails(null);
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
        setIsQuotaExceeded(false);
        setQuotaDetails(null);
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
      setErrorMessage("Please select or upload a room photograph first.");
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
        throw new Error(data.error || "Failed to process room staging. Please reattempt.");
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
      setErrorMessage(err.message || "An unexpected processing error occurred.");
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
    <div className="min-h-screen bg-[#f7f5f0] text-[#141312] flex flex-col font-sans">
      {/* Top Architectural Rule Bar */}
      <div className="bg-[#141312] text-[#f7f5f0] text-[11px] font-mono tracking-widest uppercase py-1.5 px-4 sm:px-8 flex justify-between items-center border-b border-[#2a2825]">
        <span>BAUHAUS SPATIAL SYSTEM &bull; EDITION 2026</span>
        <span className="hidden sm:inline">FORM FOLLOWS FUNCTION &bull; WCAG AAA ACCESSIBLE</span>
      </div>

      {/* Main Modernist Navigation */}
      <nav className="bg-[#ffffff] border-b border-[#ded9cd] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Geometric Bauhaus Identity Mark */}
            <div className="w-10 h-10 bg-[#141312] text-[#ffffff] flex items-center justify-center font-bold text-base tracking-tighter">
              FM
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-[#141312]">
                FLIP<span className="text-[#8a857b]">MY</span>SPACE
              </div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-[#736e64]">
                Architectural Staging Engine
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider uppercase text-[#47433c]">
            <button onClick={scrollToStudio} className="hover:text-[#141312] transition font-bold">
              01 // Studio
            </button>
            <a href="#demo" className="hover:text-[#141312] transition">
              02 // Proof
            </a>
            <a href="#typology" className="hover:text-[#141312] transition">
              03 // Aesthetics
            </a>
            <a href="#principles" className="hover:text-[#141312] transition">
              04 // Principles
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadSample(0)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#141312] bg-[#f7f5f0] hover:bg-[#eeeae0] border border-[#ded9cd] transition"
            >
              <Eye className="w-3.5 h-3.5 text-[#736e64]" />
              Study Sample
            </button>
            <button
              onClick={scrollToStudio}
              className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-[#ffffff] bg-[#141312] hover:bg-[#2b2926] transition font-bold flex items-center gap-2"
            >
              <span>Initialize Staging</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Header Section */}
      <section className="border-b border-[#ded9cd] bg-[#ffffff] pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Asymmetric Bauhaus Grid Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-12 border-b border-[#ece8df]">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#736e64] bg-[#f7f5f0] px-3 py-1 border border-[#ded9cd]">
                <span>System // Spatial Staging</span>
                <span className="text-[#ded9cd]">&bull;</span>
                <span>Gemini 3.8 Precision</span>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#141312] leading-[1.05]">
                Architectural Clarity in Room Staging.
              </h1>
              <p className="text-base sm:text-lg text-[#5c574e] max-w-2xl font-normal leading-relaxed pt-2">
                Uncompromising functional realism. We preserve structural envelopes, daylighting axes, and floor boundaries—populating empty spaces with calibrated international design.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <button
                onClick={scrollToStudio}
                className="w-full py-4 px-6 bg-[#141312] hover:bg-[#2b2926] text-[#ffffff] font-mono text-xs uppercase tracking-wider flex items-center justify-between transition font-bold"
              >
                <span>Upload Room Photograph</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => loadSample(0)}
                className="w-full py-4 px-6 bg-[#f7f5f0] hover:bg-[#eeeae0] text-[#141312] border border-[#ded9cd] font-mono text-xs uppercase tracking-wider flex items-center justify-between transition"
              >
                <span>Examine Benchmark Flip</span>
                <ArrowUpRight className="w-4 h-4 text-[#736e64]" />
              </button>
            </div>
          </div>

          {/* Metric Ledger */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-[#ece8df] text-[#141312]">
            <div className="p-6 border-r border-[#ece8df]">
              <div className="text-xs font-mono uppercase tracking-widest text-[#8a857b]">01 / Precision</div>
              <div className="text-3xl font-extrabold mt-1 tracking-tight">100%</div>
              <div className="text-xs text-[#5c574e] mt-1">Perimeter Lock</div>
            </div>
            <div className="p-6 md:border-r border-[#ece8df]">
              <div className="text-xs font-mono uppercase tracking-widest text-[#8a857b]">02 / Turnaround</div>
              <div className="text-3xl font-extrabold mt-1 tracking-tight">&lt; 10s</div>
              <div className="text-xs text-[#5c574e] mt-1">Algorithmic Synthesis</div>
            </div>
            <div className="p-6 border-r border-[#ece8df] border-t md:border-t-0">
              <div className="text-xs font-mono uppercase tracking-widest text-[#8a857b]">03 / Resolution</div>
              <div className="text-3xl font-extrabold mt-1 tracking-tight">8K UHD</div>
              <div className="text-xs text-[#5c574e] mt-1">Architectural Output</div>
            </div>
            <div className="p-6 border-t md:border-t-0">
              <div className="text-xs font-mono uppercase tracking-widest text-[#8a857b]">04 / Accessibility</div>
              <div className="text-3xl font-extrabold mt-1 tracking-tight">AAA</div>
              <div className="text-xs text-[#5c574e] mt-1">High Contrast Ratio</div>
            </div>
          </div>

          {/* Interactive Split Slider Section (Matching Benchmark Images) */}
          <div id="demo" className="mt-12">
            <div className="flex flex-col sm:flex-row items-baseline justify-between mb-4 gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-widest text-[#8a857b]">
                  Fig. 01 — Structural Comparison
                </span>
                <span className="text-xs text-[#5c574e]">
                  ({DEMO_SAMPLES[activeDemoIndex].style})
                </span>
              </div>
              {/* Sample Switcher Tabs */}
              <div className="flex gap-2">
                {DEMO_SAMPLES.map((sample, idx) => (
                  <button
                    key={sample.id}
                    onClick={() => setActiveDemoIndex(idx)}
                    className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition ${
                      activeDemoIndex === idx
                        ? "bg-[#141312] text-[#ffffff] font-bold"
                        : "bg-[#f7f5f0] text-[#5c574e] border border-[#ded9cd] hover:text-[#141312]"
                    }`}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Comparison Frame */}
            <div className="relative border-2 border-[#141312] bg-[#ffffff] aspect-[16/10] sm:aspect-[16/9] overflow-hidden select-none">
              {/* After Staged Base Image */}
              <img
                src={DEMO_SAMPLES[activeDemoIndex].styled}
                alt="Architecturally Staged Room After"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />

              {/* Before Empty Image with responsive clipPath */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${heroSliderPos}% 0, ${heroSliderPos}% 100%, 0 100%)` }}
              >
                <img
                  src={DEMO_SAMPLES[activeDemoIndex].empty}
                  alt="Empty Spatial Void Before"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              {/* Vertical Bauhaus Dividing Rule */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#ffffff] z-20 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                style={{ left: `${heroSliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#ffffff] text-[#141312] border-2 border-[#141312] flex items-center justify-center font-mono font-black text-xs shadow-md">
                  &harr;
                </div>
              </div>

              {/* Drag Input Range */}
              <input
                type="range"
                min="0"
                max="100"
                value={heroSliderPos}
                onChange={(e) => setHeroSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                aria-label="Drag to inspect architectural staging"
              />

              {/* Corner Indicators */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#141312] text-[#ffffff] font-mono text-[11px] uppercase tracking-widest pointer-events-none">
                01 // BARE SHELL
              </div>
              <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-[#ffffff] text-[#141312] border border-[#141312] font-mono text-[11px] uppercase tracking-widest pointer-events-none font-bold">
                02 // STAGED PROJECTION
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-[#ffffff]/90 text-[#141312] border border-[#ded9cd] text-[11px] font-mono uppercase tracking-wider pointer-events-none backdrop-blur">
                Drag rule left / right to compare alignment
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Studio Workspace */}
      <section ref={studioRef} className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="pb-8 border-b border-[#ded9cd] mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-[#8a857b] mb-1">
              Workspace // Sequential Configuration
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141312]">
              Spatial Staging Studio
            </h2>
          </div>
          <div className="text-xs font-mono text-[#5c574e]">
            Follow steps 01 through 03 to render
          </div>
        </div>

        {/* Global Error Notice */}
        {errorMessage && (
          <div className="mb-8 p-4 bg-[#ffffff] border-l-4 border-[#141312] border-y border-r border-[#ded9cd] text-[#141312] flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-[#141312] flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs font-mono">
              <span className="font-bold">SYSTEM NOTICE // </span>
              {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-[#8a857b] hover:text-[#141312] text-sm font-mono font-bold"
            >
              [CLOSE]
            </button>
          </div>
        )}

        {/* Google API Quota Requirement Box */}
        {isQuotaExceeded && (
          <div className="mb-8 p-6 bg-[#ffffff] border-2 border-[#141312] text-[#141312] space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-[#ded9cd] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#141312] text-[#ffffff] flex items-center justify-center font-mono font-bold text-xs">
                  API
                </div>
                <div>
                  <h3 className="text-sm font-extrabold font-mono uppercase tracking-wider text-[#141312]">
                    Google GenAI Quota Notice // Free Tier Quota Required
                  </h3>
                  <p className="text-xs text-[#5c574e]">
                    Spatial layout measurement was successful. Image synthesis requires billing activation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuotaExceeded(false)}
                className="text-xs font-mono text-[#8a857b] hover:text-[#141312] font-bold"
              >
                [DISMISS]
              </button>
            </div>

            {quotaDetails?.analysis && (
              <div className="p-3.5 bg-[#f7f5f0] border border-[#ded9cd] font-mono text-xs text-[#47433c] leading-relaxed">
                <span className="font-bold text-[#141312]">GEMINI 3.8 SPATIAL SCAN // </span>
                {quotaDetails.analysis}
              </div>
            )}

            <div className="text-xs text-[#5c574e] space-y-1.5 leading-relaxed font-sans">
              <p>
                <strong>Diagnostic:</strong> Your Google API key successfully used <code>gemini-3.8-flash</code> to inspect the floor lines, wall perspective, and daylight from your uploaded photo.
              </p>
              <p>
                However, Google Cloud assigns a <strong>0-request limit (limit: 0)</strong> on free-tier projects for image-generation models (<code>gemini-3.1-flash-image</code> and <code>imagen-3.0</code>).
              </p>
              <p>
                To enable Google to return full photorealistic staged renders of your uploaded room, link a Pay-As-You-Go billing account in Google AI Studio or Google Cloud Console.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={quotaDetails?.billingUrl || "https://ai.google.dev/gemini-api/docs/rate-limits"}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-[#141312] text-[#ffffff] hover:bg-[#2b2926] font-mono text-xs uppercase tracking-wider font-bold inline-flex items-center gap-2 transition"
              >
                <span>Enable Google Cloud Image Quota</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => loadSample(0)}
                className="px-4 py-2.5 bg-[#f7f5f0] hover:bg-[#eeeae0] text-[#141312] border border-[#ded9cd] font-mono text-xs uppercase tracking-wider transition"
              >
                Examine Benchmark Slider
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Step 01: Photo Input Container */}
          <div className="lg:col-span-5 bauhaus-card p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#ece8df]">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 bg-[#141312] text-[#ffffff] font-mono text-xs font-bold flex items-center justify-center">
                  01
                </span>
                <h3 className="font-extrabold text-[#141312] text-sm uppercase tracking-wider font-mono">
                  Room Input Asset
                </h3>
              </div>
              {imagePreview && (
                <button
                  onClick={handleClear}
                  className="text-xs font-mono text-[#8a857b] hover:text-[#141312] flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Drag & Drop Upload Zone */}
            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[290px] ${
                  isDragging
                    ? "border-[#141312] bg-[#eeeae0]"
                    : "border-[#ded9cd] hover:border-[#141312] bg-[#faf8f5] hover:bg-[#f7f5f0]"
                }`}
              >
                <div className="w-12 h-12 bg-[#ffffff] border border-[#ded9cd] flex items-center justify-center text-[#141312] mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-[#141312] text-sm uppercase tracking-wider font-mono">
                  Drop Room Photograph
                </h4>
                <p className="text-xs text-[#736e64] mt-1.5 max-w-xs leading-relaxed">
                  Supply an unfurnished or vacant interior photograph (JPG, PNG, WebP up to 14MB).
                </p>
                <div className="mt-4 px-3 py-1 bg-[#ffffff] border border-[#ded9cd] text-[#5c574e] text-[11px] font-mono uppercase tracking-wider">
                  Select Local File
                </div>
              </div>
            ) : (
              <div className="relative border border-[#ded9cd] bg-[#141312] aspect-[4/3] overflow-hidden group">
                <img
                  src={imagePreview}
                  alt="Original room preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#141312]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-[#ffffff] text-[#141312] text-xs font-mono uppercase tracking-wider font-bold hover:bg-[#f7f5f0]"
                  >
                    Replace Asset
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-3.5 py-2 bg-[#141312] text-[#ffffff] border border-[#ffffff] text-xs font-mono uppercase tracking-wider hover:bg-[#2b2926]"
                  >
                    Remove
                  </button>
                </div>
                <span className="absolute bottom-3 left-3 bg-[#ffffff] text-[#141312] text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border border-[#ded9cd]">
                  Source Spatial Void
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

            {/* Benchmark Samples Selector */}
            <div className="pt-2 border-t border-[#ece8df]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#736e64] block mb-2 font-bold">
                Or Load Benchmark Case Study:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_SAMPLES.map((sample, idx) => (
                  <button
                    key={sample.id}
                    onClick={() => loadSample(idx)}
                    type="button"
                    className="px-3 py-2 text-left bg-[#faf8f5] hover:bg-[#eeeae0] border border-[#ded9cd] text-xs font-mono transition text-[#141312] flex items-center justify-between"
                  >
                    <span>{sample.label}</span>
                    <ArrowRight className="w-3 h-3 text-[#8a857b]" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Steps 02 & 03: Typology & Aesthetic Selectors */}
          <div className="lg:col-span-7 bauhaus-card p-6 sm:p-7 space-y-6">
            {/* Step 02: Room Typology */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-[#141312] text-[#ffffff] font-mono text-xs font-bold flex items-center justify-center">
                    02
                  </span>
                  <h3 className="font-extrabold text-[#141312] text-sm uppercase tracking-wider font-mono">
                    Room Typology
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#736e64] font-bold">
                  {selectedRoomType}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROOM_TYPES.map((room) => {
                  const isSelected = selectedRoomType === room.id;
                  const Icon = room.icon;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomType(room.id)}
                      type="button"
                      className={`p-3 border text-left transition flex items-center gap-2.5 ${
                        isSelected
                          ? "bg-[#141312] text-[#ffffff] border-[#141312] font-bold"
                          : "bg-[#ffffff] text-[#47433c] border-[#ded9cd] hover:border-[#141312] hover:bg-[#faf8f5]"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs leading-none truncate">{room.name}</div>
                        <div className={`text-[9px] font-mono mt-1 ${isSelected ? "text-[#a39e93]" : "text-[#8a857b]"}`}>
                          {room.code}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 03: Aesthetic Style */}
            <div id="typology">
              <div className="flex items-center justify-between pb-3 border-b border-[#ece8df] mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-[#141312] text-[#ffffff] font-mono text-xs font-bold flex items-center justify-center">
                    03
                  </span>
                  <h3 className="font-extrabold text-[#141312] text-sm uppercase tracking-wider font-mono">
                    Interior Aesthetic
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#736e64] font-bold">
                  {selectedStyle}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {STYLES.map((style) => {
                  const isSelected = selectedStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      type="button"
                      className={`p-4 border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#141312] text-[#ffffff] border-[#141312] shadow-sm"
                          : "bg-[#ffffff] text-[#141312] border-[#ded9cd] hover:border-[#141312] hover:bg-[#faf8f5]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-mono tracking-widest ${isSelected ? "text-[#a39e93]" : "text-[#8a857b]"}`}>
                            {style.code}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff]" />}
                        </div>
                        <h4 className="font-extrabold text-sm">{style.name}</h4>
                        <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isSelected ? "text-[#ded9cd]" : "text-[#5c574e]"}`}>
                          {style.subtitle}
                        </p>
                      </div>
                      <div className={`mt-3 text-[10px] font-mono border-t pt-2 ${
                        isSelected ? "border-[#2a2825] text-[#ded9cd]" : "border-[#ece8df] text-[#736e64]"
                      }`} dangerouslySetInnerHTML={{ __html: style.material }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Staging Execution Button */}
            <div className="pt-2 border-t border-[#ece8df]">
              <button
                onClick={handleDecorate}
                disabled={!imagePreview || isLoading}
                className={`w-full py-4 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition ${
                  !imagePreview || isLoading
                    ? "bg-[#ded9cd] text-[#8a857b] cursor-not-allowed border border-[#ded9cd]"
                    : "bg-[#141312] hover:bg-[#2b2926] text-[#ffffff] font-bold cursor-pointer"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Spatial Staging...</span>
                  </>
                ) : (
                  <>
                    <span>Render {selectedRoomType} // {selectedStyle}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* Progress Indicator */}
              {isLoading && (
                <div className="mt-4 space-y-2">
                  <div className="w-full bg-[#eeeae0] h-1.5 overflow-hidden">
                    <div
                      className="bg-[#141312] h-full transition-all duration-500"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#5c574e]">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-[#141312]" />
                      {loadingStatus}
                    </span>
                    <span className="font-bold text-[#141312]">{loadingProgress}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Presentation Deck */}
        {generatedImage && (
          <div
            ref={resultsRef}
            className="mt-16 bauhaus-card p-6 sm:p-10 border-2 border-[#141312] space-y-8"
          >
            {/* Results Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#ded9cd] gap-4">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#736e64] mb-1">
                  Staging Manifest // Completed
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141312]">
                  {selectedStyle} {selectedRoomType}
                </h3>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex border border-[#141312] text-xs font-mono uppercase">
                  <button
                    onClick={() => setComparisonMode("slider")}
                    className={`px-3 py-1.5 flex items-center gap-1.5 transition ${
                      comparisonMode === "slider"
                        ? "bg-[#141312] text-[#ffffff] font-bold"
                        : "bg-[#ffffff] text-[#141312] hover:bg-[#faf8f5]"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Split Rule
                  </button>
                  <button
                    onClick={() => setComparisonMode("side-by-side")}
                    className={`px-3 py-1.5 flex items-center gap-1.5 transition ${
                      comparisonMode === "side-by-side"
                        ? "bg-[#141312] text-[#ffffff] font-bold"
                        : "bg-[#ffffff] text-[#141312] hover:bg-[#faf8f5]"
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    Side-by-Side
                  </button>
                </div>

                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-[#141312] text-[#ffffff] hover:bg-[#2b2926] text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export 8K Asset
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-[#ffffff] border border-[#ded9cd] hover:border-[#141312] text-[#141312] text-xs font-mono uppercase tracking-wider transition"
                >
                  New Spatial Shell
                </button>
              </div>
            </div>

            {/* Comparison Display */}
            {comparisonMode === "slider" ? (
              <div className="relative border-2 border-[#141312] bg-[#ffffff] aspect-[16/10] sm:aspect-[16/9] overflow-hidden select-none">
                {/* Background Staged Image */}
                <img
                  src={generatedImage}
                  alt="Decorated room after"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />

                {/* Foreground Original Empty Image */}
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

                {/* Vertical Dividing Rule */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-[#ffffff] z-20 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#ffffff] text-[#141312] border-2 border-[#141312] flex items-center justify-center font-mono font-black text-xs shadow-md">
                    &harr;
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
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#141312] text-[#ffffff] font-mono text-[11px] uppercase tracking-widest pointer-events-none">
                  01 // BARE SHELL
                </div>
                <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-[#ffffff] text-[#141312] border border-[#141312] font-mono text-[11px] uppercase tracking-widest pointer-events-none font-bold">
                  02 // STAGED ({selectedStyle})
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Room */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#736e64]">
                    <span>01 // Source Spatial Void</span>
                    <span className="font-bold text-[#141312]">BEFORE</span>
                  </div>
                  <div className="relative border border-[#ded9cd] bg-[#141312] aspect-[4/3] overflow-hidden">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Original room"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Staged Room */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#141312]">
                    <span className="font-bold">02 // Staged Synthesis ({selectedStyle})</span>
                    <span className="font-bold">AFTER</span>
                  </div>
                  <div className="relative border-2 border-[#141312] bg-[#141312] aspect-[4/3] overflow-hidden group">
                    <img
                      src={generatedImage}
                      alt="Decorated room"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#141312]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-[#ffffff] text-[#141312] font-mono text-xs uppercase tracking-wider font-bold shadow-md hover:bg-[#f7f5f0]"
                      >
                        Export 8K Asset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gemini Architectural Analysis Card */}
            {roomAnalysis && (
              <div className="p-5 bg-[#f7f5f0] border border-[#ded9cd] text-xs font-mono text-[#47433c] leading-relaxed">
                <div className="font-bold text-[#141312] uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span>Gemini 3.8 Spatial Analysis Log //</span>
                </div>
                <p>{roomAnalysis}</p>
              </div>
            )}

            {/* Informational Notice */}
            {generationNotice && (
              <div className="p-4 bg-[#fcfbf9] border border-[#ded9cd] text-xs font-mono text-[#5c574e]">
                <span>SYSTEM DISPATCH // {generationNotice}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Bauhaus Architectural Principles Section */}
      <section id="principles" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#ded9cd]">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-[#8a857b] mb-1">
            Methodology // International Standard
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#141312]">
            Bauhaus Principles in Computational Staging
          </h2>
          <p className="mt-2 text-sm text-[#5c574e] leading-relaxed">
            Eliminating superfluous decoration in software. Designed for architectural integrity, instant comprehension, and universal accessibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bauhaus-card p-8 space-y-3">
            <div className="font-mono text-2xl font-black text-[#141312]">01</div>
            <h3 className="text-base font-extrabold uppercase tracking-wider font-mono text-[#141312]">
              Structural Invariance
            </h3>
            <p className="text-xs text-[#5c574e] leading-relaxed font-sans">
              No architectural warping. Gemini 3.8 Flash locks the horizon line, perimeter walls, and window embrasures before placing furnishings into the void.
            </p>
          </div>

          <div className="bauhaus-card p-8 space-y-3">
            <div className="font-mono text-2xl font-black text-[#141312]">02</div>
            <h3 className="text-base font-extrabold uppercase tracking-wider font-mono text-[#141312]">
              Disciplined Analogous Tones
            </h3>
            <p className="text-xs text-[#5c574e] leading-relaxed font-sans">
              Form over neon flash. Neutral whites, concrete greys, and warm stone beiges prioritize the photography and provide WCAG AAA universal contrast.
            </p>
          </div>

          <div className="bauhaus-card p-8 space-y-3">
            <div className="font-mono text-2xl font-black text-[#141312]">03</div>
            <h3 className="text-base font-extrabold uppercase tracking-wider font-mono text-[#141312]">
              Direct Spatial Ingestion
            </h3>
            <p className="text-xs text-[#5c574e] leading-relaxed font-sans">
              Your uploaded photograph is fed inline as the direct spatial baseline. Furnishings are computed to scale with natural light reflectance.
            </p>
          </div>
        </div>
      </section>

      {/* Modernist Footer */}
      <footer className="border-t border-[#ded9cd] bg-[#ffffff] py-12 px-4 sm:px-6 lg:px-8 mt-auto text-xs font-mono text-[#736e64]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#141312] text-[#ffffff] flex items-center justify-center font-bold text-[10px]">
              FM
            </div>
            <span className="font-bold text-[#141312] uppercase tracking-wider">FlipMySpace</span>
            <span>&bull; Architectural Spatial Remodeling</span>
          </div>

          <div className="flex items-center gap-6 uppercase tracking-wider">
            <a href="#demo" className="hover:text-[#141312] transition">
              Comparison
            </a>
            <a href="#typology" className="hover:text-[#141312] transition">
              Typology
            </a>
            <a href="#principles" className="hover:text-[#141312] transition">
              Principles
            </a>
          </div>

          <div>
            &copy; {new Date().getFullYear()} FlipMySpace. Bauhaus Edition.
          </div>
        </div>
      </footer>
    </div>
  );
}
