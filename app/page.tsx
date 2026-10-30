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
  Eye,
  Sparkles,
  Info,
  Check,
  HeartHandshake,
  Compass,
  ChevronLeft,
  ChevronRight,
  Key
} from "lucide-react";
import EeraAssistant from "./components/EeraAssistant";

interface StyleOption {
  id: string;
  name: string;
  tag: string;
  subtitle: string;
  paletteHint: string;
}

interface CarouselStyle {
  id: string;
  name: string;
  tag: string;
  description: string;
  paletteHint: string;
  image: string;
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

const CAROUSEL_STYLES: CarouselStyle[] = [
  {
    id: "Scandinavian",
    name: "Scandinavian",
    tag: "Clean & Light",
    description: "Features clean lines, functional furniture, light woods, and a soft palette of whites, greys, and pastels.",
    paletteHint: "Light Woods &bull; Soft Greys &bull; Whites & Pastels",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "Japandi",
    name: "Japandi",
    tag: "Zen Equilibrium",
    description: "Combines Japanese minimalism and Scandinavian warmth, using natural stone, paper, warm wood, and earthy tones like black and dark green.",
    paletteHint: "Natural Stone &bull; Paper &bull; Dark Green & Black",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "Modern",
    name: "Modern",
    tag: "Sleek & Architectural",
    description: "Emphasizes simplicity, clean architectural lines, neutral color schemes, and sleek materials like glass and metal.",
    paletteHint: "Glass & Metal &bull; Neutral Palettes &bull; Clean Lines",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "Mid-Century Modern",
    name: "Mid-Century Modern",
    tag: "1950s Retro Iconic",
    description: "Inspired by the 1950s and 1960s with retro organic shapes, iconic show-wood furniture, vibrant accents, and warm woods.",
    paletteHint: "Oiled Walnut &bull; Retro Organic Shapes &bull; Show-wood",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "Minimalism",
    name: "Minimalism",
    tag: "Open Negative Space",
    description: "Focuses on open negative space, uncluttered surfaces, multi-functional furniture, and a quiet, monochrome color scheme.",
    paletteHint: "Monochrome &bull; Uncluttered Surfaces &bull; Multi-functional",
    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "Industrial",
    name: "Industrial",
    tag: "Raw Architectural",
    description: "Uses raw, unfinished elements such as exposed brick walls, metal pipes, concrete floors, and weathered leather.",
    paletteHint: "Exposed Brick &bull; Metal Pipes &bull; Weathered Leather",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "Bohemian (Boho)",
    name: "Bohemian (Boho)",
    tag: "Eclectic & Layered",
    description: "Highlights an eclectic, free-spirited mix of vintage finds, vibrant layered patterns, plants, and natural textiles like rattan and cotton.",
    paletteHint: "Rattan & Cotton &bull; Vintage Patterns &bull; Botanicals",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "Traditional",
    name: "Traditional",
    tag: "European Heritage",
    description: "Draws from 18th- and 19th-century European heritage, featuring symmetrical layouts, dark ornate woods, and rich fabrics like velvet or brocade.",
    paletteHint: "Dark Ornate Woods &bull; Velvet &bull; Brocade Fabrics",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "Transitional",
    name: "Transitional",
    tag: "Classic Meets Modern",
    description: "Bridges classic and modern design by combining traditional architectural details with contemporary neutral furnishings.",
    paletteHint: "Architectural Moulding &bull; Contemporary Neutrals",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80",
  },
];

const STYLES: StyleOption[] = CAROUSEL_STYLES.map((s) => ({
  id: s.name,
  name: s.name,
  tag: s.tag,
  subtitle: s.description,
  paletteHint: s.paletteHint,
}));

// Verified 1:1 camera-angle matching virtual staging pairs
const DEMO_SAMPLES = [
  {
    id: "living-room",
    label: "Living Room Space",
    empty: "https://cdn.stagehq.ai/landing-virtualstaging/livingroom_01_before.jpg",
    styled: "https://cdn.stagehq.ai/landing-virtualstaging/livingroom_01_after.jpg",
    style: "Modern Minimalist",
    room: "Living Room",
  },
  {
    id: "bedroom",
    label: "Bedroom Space",
    empty: "https://cdn.stagehq.ai/landing-virtualstaging/bedroom_01_before.jpg",
    styled: "https://cdn.stagehq.ai/landing-virtualstaging/bedroom_01_after.jpg",
    style: "Scandinavian",
    room: "Bedroom",
  },
];

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState<string>("Scandinavian");
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
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Client-configurable API key for live Vercel deployments
  const [customApiKey, setCustomApiKey] = useState<string>("");
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);
  const [hasServerKey, setHasServerKey] = useState<boolean | null>(null);
  const [serverKeyPrefix, setServerKeyPrefix] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("flipmyspace_gemini_key");
      if (savedKey) {
        setCustomApiKey(savedKey);
        setApiKeyInput(savedKey);
      }

      fetch("/api/decorate")
        .then((res) => res.json())
        .then((data) => {
          setHasServerKey(Boolean(data.hasServerKey));
          if (data.keyPrefix) {
            setServerKeyPrefix(data.keyPrefix);
            // Hide modal because server key is already active in Vercel!
            setShowApiKeyModal(false);
            setIsApiKeyMissing(false);
          }
        })
        .catch(() => {
          setHasServerKey(false);
        });
    }
  }, []);

  const saveApiKey = (keyToSave: string) => {
    const trimmed = keyToSave.trim();
    setCustomApiKey(trimmed);
    if (typeof window !== "undefined") {
      if (trimmed) {
        localStorage.setItem("flipmyspace_gemini_key", trimmed);
      } else {
        localStorage.removeItem("flipmyspace_gemini_key");
      }
    }
    setShowApiKeyModal(false);
    setIsApiKeyMissing(false);
    setErrorMessage(null);
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleSelectCarouselStyle = (styleName: string) => {
    setSelectedStyle(styleName);
    studioRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Multi-phase loading status
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(15);
      setLoadingStatus("Measuring spatial perspective & natural daylight with Gemini 3.8...");

      const phases = [
        { at: 2000, prog: 42, text: "Locking wall perimeters, flooring plane & window frames..." },
        { at: 5000, prog: 72, text: `Arranging ${selectedStyle} furniture with balanced proportion...` },
        { at: 8500, prog: 90, text: "Simulating authentic ambient lighting & soft shadow falloff..." },
        { at: 12000, prog: 98, text: "Finalizing high-resolution staging render..." },
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

  // Client-side image compression to guarantee payloads stay safely below Vercel's 4.5MB limit
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1536; // 1536px provides pin-sharp resolution for Gemini vision while keeping payload < 500KB
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setErrorMessage("Please upload an image in JPEG, PNG, or WebP format.");
      return;
    }

    setErrorMessage(null);
    setImageFile(file);

    try {
      const optimizedBase64 = await compressImage(file);
      setImagePreview(optimizedBase64);
      setGeneratedImage(null);
      setRoomAnalysis(null);
      setGenerationNotice(null);
      setIsQuotaExceeded(false);
      setQuotaDetails(null);
    } catch {
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
    }
  };

  const loadSample = async (sampleIndex: number) => {
    const sample = DEMO_SAMPLES[sampleIndex];
    setSelectedStyle(sample.style);
    setSelectedRoomType(sample.room);
    setErrorMessage(null);

    try {
      const response = await fetch(sample.empty);
      const blob = await response.blob();
      const file = new File([blob], "sample.jpg", { type: "image/jpeg" });
      const optimized = await compressImage(file);
      setImagePreview(optimized);
      setGeneratedImage(null);
      setRoomAnalysis(null);
      setGenerationNotice(null);
      setIsQuotaExceeded(false);
      setQuotaDetails(null);
      studioRef.current?.scrollIntoView({ behavior: "smooth" });
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
      setErrorMessage("Please select or upload a room photo first.");
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
          apiKey: customApiKey || undefined,
        }),
      });

      let data: any = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const rawText = await response.text().catch(() => "");
        if (response.status === 413 || rawText.includes("Request Entity Too Large")) {
          throw new Error("The uploaded image exceeded transfer limits. We have enabled auto-compression—please re-select your photo and click Stage Space.");
        }
        throw new Error(rawText || `Server responded with status ${response.status}`);
      }

      if (!response.ok) {
        if (data?.isApiKeyMissing && !hasServerKey) {
          setIsApiKeyMissing(true);
          setShowApiKeyModal(true);
          setErrorMessage("Gemini API Key required: Configure your key in Settings below or in your Vercel Dashboard.");
          return;
        }

        if (data?.isQuotaError) {
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
        throw new Error(data?.error || "Failed to stage room. Please try again.");
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
      setErrorMessage(err.message || "An unexpected error occurred while processing your room.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyRefinement = async (refinement: {
    modificationsRequested: string;
    elementsToRetain: string;
    promptModifiers: string;
  }) => {
    if (!imagePreview) {
      setErrorMessage("Please select or upload a room photo first to apply refinements.");
      studioRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedImage(null);
    setGenerationNotice(`Refining with Eera: ${refinement.modificationsRequested}`);
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
          apiKey: customApiKey || undefined,
          refinementNotes: refinement.modificationsRequested,
          elementsToRetain: refinement.elementsToRetain,
          promptModifiers: refinement.promptModifiers,
        }),
      });

      let data: any = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const rawText = await response.text().catch(() => "");
        throw new Error(rawText || `Server responded with status ${response.status}`);
      }

      if (!response.ok) {
        if (data?.isQuotaError) {
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
        throw new Error(data?.error || "Failed to refine room design.");
      }

      setGeneratedImage(data.imageUrl);
      if (data.analysis) {
        setRoomAnalysis(data.analysis);
      }
      setGenerationNotice(`Refined with Eera (${refinement.modificationsRequested})`);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while refining your room.");
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
    <div className="min-h-screen bg-[#faf7f2] text-[#1c1917] flex flex-col font-sans">
      {/* Warm Announcement Sub-header */}
      <div className="bg-[#f3ede2] text-[#666057] text-xs py-2 px-4 text-center border-b border-[#e8e2d5] font-medium">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#c25e37]" />
          <span>Thoughtfully engineered AI virtual staging &bull; Form follows architecture</span>
        </span>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-[#ffffff]/90 backdrop-blur-md border-b border-[#e8e2d5] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#c25e37] text-[#ffffff] flex items-center justify-center font-bold text-base shadow-sm">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-[#1c1917]">
                FlipMy<span className="text-[#c25e37]">Space</span>
              </div>
              <div className="text-[11px] text-[#78716c] font-medium tracking-wide">
                Intelligent Interior Staging
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#57534e]">
            <button onClick={scrollToStudio} className="hover:text-[#1c1917] transition font-semibold">
              Staging Studio
            </button>
            <a href="#showcase" className="hover:text-[#1c1917] transition">
              Live Showcase
            </a>
            <a href="#styles-carousel" className="hover:text-[#1c1917] transition">
              Design Styles
            </a>
            <a href="#standards" className="hover:text-[#1c1917] transition">
              Standards
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadSample(0)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#57534e] bg-[#f4efe6] hover:bg-[#eadecc] rounded-xl border border-[#e8e2d5] transition"
            >
              <Eye className="w-3.5 h-3.5 text-[#78716c]" />
              View Sample
            </button>
            <button
              onClick={scrollToStudio}
              className="px-5 py-2.5 text-xs font-bold text-[#ffffff] bg-[#1c1917] hover:bg-[#2e2926] rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <span>Stage Your Space</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#e8e2d5]" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f4efe6] border border-[#e8e2d5] text-[#8c3817] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#c25e37]" />
              <span>Architectural Harmony &bull; Natural Light Fidelity</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1c1917] leading-[1.1]">
              Bring empty rooms to life with{" "}
              <span className="text-[#c25e37]">thoughtful design.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#57534e] max-w-xl font-normal leading-relaxed">
              Upload a photograph of any unfurnished space. Gemini 3.8 calculates the true camera perspective, preserving your actual walls, flooring, and daylight while furnishing it with designer warmth.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3.5">
              <button
                onClick={scrollToStudio}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#c25e37] hover:bg-[#a84e2b] text-[#ffffff] font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition"
              >
                <span>Upload Room Photograph</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => loadSample(0)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#ffffff] hover:bg-[#f4efe6] text-[#1c1917] border border-[#e8e2d5] font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-[#78716c]" />
                <span>See Interactive Demo</span>
              </button>
            </div>

            {/* Accessible Metric Strip */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-[#e8e2d5] text-[#1c1917]">
              <div>
                <div className="text-2xl font-extrabold tracking-tight">100%</div>
                <div className="text-xs text-[#78716c] font-medium mt-0.5">Structure Preserved</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold tracking-tight">&lt; 10s</div>
                <div className="text-xs text-[#78716c] font-medium mt-0.5">Instant Rendering</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold tracking-tight">8K UHD</div>
                <div className="text-xs text-[#78716c] font-medium mt-0.5">High-Fidelity Output</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Interactive Split Slider Showcase */}
          <div id="showcase" className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#78716c] font-medium px-1">
              <span>Interactive Transformation Showcase</span>
              <div className="flex gap-1.5">
                {DEMO_SAMPLES.map((sample, idx) => (
                  <button
                    key={sample.id}
                    onClick={() => setActiveDemoIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      activeDemoIndex === idx
                        ? "bg-[#1c1917] text-[#ffffff]"
                        : "bg-[#ffffff] text-[#57534e] border border-[#e8e2d5] hover:text-[#1c1917]"
                    }`}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Comparison Frame */}
            <div className="relative rounded-2xl border border-[#d4ccbd] bg-[#ffffff] aspect-[16/11] overflow-hidden shadow-sm select-none">
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
                  alt="Empty Room Before"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              {/* Subtle Dividing Line */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#ffffff] z-20 pointer-events-none shadow-[0_0_8px_rgba(0,0,0,0.4)]"
                style={{ left: `${heroSliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#ffffff] text-[#1c1917] border border-[#d4ccbd] flex items-center justify-center text-xs font-bold shadow-md">
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
                aria-label="Drag to inspect virtual staging transformation"
              />

              {/* Tags */}
              <div className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-md bg-[#1c1917]/80 text-[#ffffff] text-xs font-semibold backdrop-blur-sm pointer-events-none">
                Original Empty Room
              </div>
              <div className="absolute top-3.5 right-3.5 z-10 px-3 py-1 rounded-md bg-[#ffffff]/90 text-[#1c1917] text-xs font-semibold border border-[#e8e2d5] backdrop-blur-sm pointer-events-none">
                Staged ({DEMO_SAMPLES[activeDemoIndex].style})
              </div>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1 rounded-full bg-[#1c1917]/70 text-[#ffffff] text-[11px] font-medium pointer-events-none backdrop-blur-sm">
                Slide across to compare
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design Styles Carousel Section */}
      <section id="styles-carousel" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#e8e2d5]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8c3817] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#c25e37]" />
              <span>Interior Design Archetypes</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1c1917]">
              Explore Makeover Styles
            </h2>
            <p className="mt-1 text-sm text-[#57534e]">
              Browse 9 curated design styles calibrated for spatial harmony. Click any archetype to stage your room in that specific style.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => scrollCarousel("left")}
              type="button"
              aria-label="Scroll left"
              className="w-10 h-10 rounded-xl border border-[#e8e2d5] bg-white hover:bg-[#f4efe6] text-[#1c1917] flex items-center justify-center transition shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollCarousel("right")}
              type="button"
              aria-label="Scroll right"
              className="w-10 h-10 rounded-xl border border-[#e8e2d5] bg-white hover:bg-[#f4efe6] text-[#1c1917] flex items-center justify-center transition shadow-sm active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Track */}
        <div
          ref={carouselRef}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 pt-1 no-scrollbar scroll-smooth"
        >
          {CAROUSEL_STYLES.map((style) => {
            const isSelected = selectedStyle === style.name;
            return (
              <div
                key={style.id}
                className={`min-w-[300px] max-w-[320px] sm:min-w-[340px] sm:max-w-[360px] flex-shrink-0 snap-start bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden shadow-sm hover:shadow-md ${
                  isSelected ? "border-[#c25e37] ring-2 ring-[#c25e37]/20" : "border-[#e8e2d5] hover:border-[#1c1917]/30"
                }`}
              >
                <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-[#f4efe6]">
                  <img
                    src={style.image}
                    alt={style.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-3 py-1 rounded-full bg-[#1c1917]/85 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide shadow-sm">
                      {style.tag}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3.5 right-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#c25e37] text-white text-[11px] font-bold shadow-sm">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-[#1c1917] tracking-tight">{style.name}</h3>
                    <p className="text-xs text-[#57534e] leading-relaxed line-clamp-3">
                      {style.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[#f3ede2]">
                    <div className="text-[11px] text-[#8c3817] font-medium bg-[#faf7f2] px-3 py-1.5 rounded-lg border border-[#e8e2d5]/60 flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c25e37] flex-shrink-0" />
                      <span className="truncate" dangerouslySetInnerHTML={{ __html: style.paletteHint }} />
                    </div>

                    <button
                      onClick={() => handleSelectCarouselStyle(style.name)}
                      type="button"
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                        isSelected
                          ? "bg-[#1c1917] text-white"
                          : "bg-[#f4efe6] hover:bg-[#eadecc] text-[#1c1917] border border-[#e8e2d5]"
                      }`}
                    >
                      <span>{isSelected ? "Active in Studio" : "Stage in this Style"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Staging Studio */}
      <section ref={studioRef} className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#e8e2d5]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8c3817] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#c25e37]" />
              <span>Interactive Staging Studio</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1c1917]">
              Stage Your Space in Three Steps
            </h2>
            <p className="mt-1 text-sm text-[#57534e]">
              Select your room photo, specify the room type and desired aesthetic, then generate your staged design.
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowApiKeyModal(!showApiKeyModal)}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#e8e2d5] bg-white hover:bg-[#f4efe6] text-xs font-semibold transition shadow-sm"
            >
              <Key className="w-3.5 h-3.5 text-[#c25e37]" />
              {hasServerKey ? (
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Server Key Active ({serverKeyPrefix})</span>
                </span>
              ) : customApiKey ? (
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Browser Key Active</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[#8c3817]">
                  <span className="w-2 h-2 rounded-full bg-[#c25e37] animate-pulse" />
                  <span>Configure Gemini Key</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Gemini API Key Configuration Card */}
        {showApiKeyModal && (
          <div className="mb-8 p-6 rounded-2xl bg-white border-2 border-[#c25e37]/40 shadow-md space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-[#e8e2d5] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#f4efe6] text-[#c25e37] flex items-center justify-center font-bold text-xs border border-[#e8e2d5]">
                  <Key className="w-4 h-4 text-[#c25e37]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1c1917]">
                    Gemini API Key Configuration
                  </h3>
                  <p className="text-xs text-[#57534e]">
                    Configure your Google Gemini API key to run staging directly on Vercel or localhost.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="text-xs text-[#78716c] hover:text-[#1c1917] font-semibold"
              >
                &times;
              </button>
            </div>

            {/* Live Server Detection Status */}
            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              hasServerKey
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                : "bg-amber-50/80 border-amber-200 text-amber-900"
            }`}>
              {hasServerKey ? (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
                  <span>
                    <strong>Vercel Server Key Connected:</strong> <code>{serverKeyPrefix}</code> is actively loaded in this deployment.
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <span>Server Environment Variable Not Detected in Current Deployment</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    If you added <code>GEMINI_API_KEY</code> in Vercel Settings, Vercel requires a <strong>Redeploy</strong> to inject it into live containers. Either paste your key below for instant access, or click Redeploy in your Vercel Deployments dashboard.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-xs text-[#57534e] leading-relaxed">
                <p>
                  <strong>Direct Browser Staging:</strong> Paste your Google AI Studio Gemini API Key below. It is stored securely in your browser and sent with your staging requests.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="password"
                  placeholder="Paste your Gemini API key (AQ.Ab... or AIza...)"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#e8e2d5] text-xs font-mono bg-[#faf7f2] focus:outline-none focus:border-[#c25e37] text-[#1c1917]"
                />
                <button
                  type="button"
                  onClick={() => saveApiKey(apiKeyInput)}
                  className="px-5 py-2.5 rounded-xl bg-[#c25e37] hover:bg-[#a84e2b] text-white text-xs font-semibold shadow-sm transition whitespace-nowrap"
                >
                  Save Key
                </button>
                {customApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setApiKeyInput("");
                      saveApiKey("");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[#e8e2d5] bg-white hover:bg-[#f4efe6] text-xs font-semibold text-[#78716c] transition"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#e8e2d5] text-[11px] text-[#57534e] leading-relaxed">
                <p>
                  <strong>Permanent Vercel Server Setup:</strong> In your <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-[#c25e37] underline font-semibold">Vercel Project Dashboard</a>, go to <em>Settings &rarr; Environment Variables</em>, add Key: <code>GEMINI_API_KEY</code>, check <em>Production</em>, <em>Preview</em>, and <em>Development</em>, and click Redeploy.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Notice */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-xl bg-[#ffffff] border-l-4 border-[#c25e37] border-y border-r border-[#e8e2d5] text-[#1c1917] flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-[#c25e37] flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-bold text-[#8c3817]">Notice: </span>
              {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-[#78716c] hover:text-[#1c1917] text-sm font-semibold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Google API Quota Requirement Banner */}
        {isQuotaExceeded && (
          <div className="mb-8 p-6 rounded-2xl bg-[#ffffff] border border-[#e8e2d5] text-[#1c1917] shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-[#e8e2d5] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#f4efe6] text-[#8c3817] flex items-center justify-center font-bold text-xs border border-[#e8e2d5]">
                  API
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1c1917]">
                    Google GenAI Quota Notice // Free Tier Quota Required
                  </h3>
                  <p className="text-xs text-[#57534e]">
                    Spatial layout measurement was successful. Image synthesis requires billing activation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuotaExceeded(false)}
                className="text-xs text-[#78716c] hover:text-[#1c1917] font-semibold"
              >
                &times;
              </button>
            </div>

            {quotaDetails?.analysis && (
              <div className="p-3.5 rounded-xl bg-[#f8f5ee] border border-[#e8e2d5] text-xs text-[#47433c] leading-relaxed">
                <span className="font-bold text-[#1c1917]">Gemini 3.8 Spatial Scan: </span>
                {quotaDetails.analysis}
              </div>
            )}

            <div className="text-xs text-[#57534e] space-y-1.5 leading-relaxed">
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

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={quotaDetails?.billingUrl || "https://ai.google.dev/gemini-api/docs/rate-limits"}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#c25e37] hover:bg-[#a84e2b] text-[#ffffff] text-xs font-semibold transition inline-flex items-center gap-2"
              >
                <span>Enable Google Cloud Image Quota</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => loadSample(0)}
                className="px-4 py-2.5 rounded-xl bg-[#f4efe6] hover:bg-[#eadecc] text-[#1c1917] border border-[#e8e2d5] text-xs font-semibold transition"
              >
                Try Interactive Slider Demo
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Step 1: Upload Photo Container */}
          <div className="lg:col-span-5 bg-[#ffffff] rounded-2xl border border-[#e8e2d5] p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#f3ede2]">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-[#c25e37] text-[#ffffff] text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-[#1c1917] text-sm">
                  Upload Room Photo
                </h3>
              </div>
              {imagePreview && (
                <button
                  onClick={handleClear}
                  className="text-xs text-[#78716c] hover:text-[#c25e37] font-medium flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Drag & Drop Area */}
            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[280px] ${
                  isDragging
                    ? "border-[#c25e37] bg-[#fbf6f0]"
                    : "border-[#e0d8ca] hover:border-[#c25e37] bg-[#fcfbf9] hover:bg-[#fbf7f0]"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#f4efe6] border border-[#e8e2d5] flex items-center justify-center text-[#c25e37] mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-[#1c1917] text-sm">
                  Click or drag your room photo here
                </h4>
                <p className="text-xs text-[#78716c] mt-1 max-w-xs leading-relaxed">
                  Provide an unfurnished space photo (JPEG, PNG, or WebP up to 14MB).
                </p>
                <div className="mt-4 px-3 py-1 bg-[#ffffff] border border-[#e8e2d5] rounded-md text-[#57534e] text-xs font-medium">
                  Select photo from computer
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl border border-[#e8e2d5] bg-[#1c1917] aspect-[4/3] overflow-hidden group">
                <img
                  src={imagePreview}
                  alt="Original room preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#1c1917]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-[#ffffff] text-[#1c1917] text-xs font-semibold rounded-lg hover:bg-[#f4efe6]"
                  >
                    Change Photo
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-3.5 py-2 bg-[#c25e37] text-[#ffffff] text-xs font-semibold rounded-lg hover:bg-[#a84e2b]"
                  >
                    Remove
                  </button>
                </div>
                <span className="absolute bottom-3 left-3 bg-[#ffffff]/90 backdrop-blur-sm text-[#1c1917] text-xs font-semibold px-2.5 py-0.5 rounded-md border border-[#e8e2d5]">
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

            {/* Benchmark Samples Selector */}
            <div className="pt-2 border-t border-[#f3ede2]">
              <span className="text-xs font-semibold text-[#78716c] block mb-2">
                Or test with instant verified sample rooms:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_SAMPLES.map((sample, idx) => (
                  <button
                    key={sample.id}
                    onClick={() => loadSample(idx)}
                    type="button"
                    className="px-3 py-2 text-left bg-[#f8f5ee] hover:bg-[#eee8db] border border-[#e8e2d5] rounded-lg text-xs font-medium transition text-[#1c1917] flex items-center justify-between"
                  >
                    <span>{sample.label}</span>
                    <ArrowRight className="w-3 h-3 text-[#78716c]" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Steps 2 & 3: Typology & Aesthetic Selection */}
          <div className="lg:col-span-7 bg-[#ffffff] rounded-2xl border border-[#e8e2d5] p-6 space-y-6 shadow-sm">
            {/* Step 2: Room Type */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#f3ede2] mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#c25e37] text-[#ffffff] text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-bold text-[#1c1917] text-sm">
                    Select Room Category
                  </h3>
                </div>
                <span className="text-xs text-[#c25e37] font-semibold">
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
                      className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                        isSelected
                          ? "bg-[#1c1917] text-[#ffffff] border-[#1c1917] shadow-sm font-semibold"
                          : "bg-[#ffffff] text-[#57534e] border-[#e8e2d5] hover:border-[#1c1917] hover:bg-[#faf7f2]"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs truncate">{room.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Aesthetic Style */}
            <div id="aesthetics">
              <div className="flex items-center justify-between pb-3 border-b border-[#f3ede2] mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#c25e37] text-[#ffffff] text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="font-bold text-[#1c1917] text-sm">
                    Choose Design Aesthetic
                  </h3>
                </div>
                <span className="text-xs text-[#c25e37] font-semibold">
                  {selectedStyle}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {STYLES.map((style) => {
                  const isSelected = selectedStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      type="button"
                      className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#1c1917] text-[#ffffff] border-[#1c1917] shadow-sm"
                          : "bg-[#ffffff] text-[#1c1917] border-[#e8e2d5] hover:border-[#1c1917] hover:bg-[#fcfbf9]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                            isSelected ? "text-[#c25e37]" : "text-[#78716c]"
                          }`}>
                            {style.tag}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff]" />}
                        </div>
                        <h4 className="font-bold text-sm">{style.name}</h4>
                        <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                          isSelected ? "text-[#e8e2d5]" : "text-[#57534e]"
                        }`}>
                          {style.subtitle}
                        </p>
                      </div>
                      <div className={`mt-3 text-[11px] border-t pt-2 font-medium ${
                        isSelected ? "border-[#332f2a] text-[#d4ccbd]" : "border-[#f3ede2] text-[#78716c]"
                      }`}>
                        &bull; {style.paletteHint}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch Staging Button */}
            <div className="pt-2 border-t border-[#f3ede2]">
              <button
                onClick={handleDecorate}
                disabled={!imagePreview || isLoading}
                className={`w-full py-3.5 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition ${
                  !imagePreview || isLoading
                    ? "bg-[#e8e2d5] text-[#8c8273] cursor-not-allowed"
                    : "bg-[#c25e37] hover:bg-[#a84e2b] text-[#ffffff] font-bold cursor-pointer shadow-sm"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Room Staging...</span>
                  </>
                ) : (
                  <>
                    <span>Stage {selectedRoomType} in {selectedStyle}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* Progress Bar */}
              {isLoading && (
                <div className="mt-4 space-y-2">
                  <div className="w-full bg-[#f4efe6] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#c25e37] h-full transition-all duration-500 rounded-full"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#57534e]">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-[#c25e37]" />
                      {loadingStatus}
                    </span>
                    <span className="font-bold text-[#1c1917]">{loadingProgress}%</span>
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
            className="mt-16 bg-[#ffffff] rounded-2xl border border-[#e8e2d5] p-6 sm:p-10 shadow-sm space-y-8"
          >
            {/* Results Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#e8e2d5] gap-4">
              <div>
                <span className="text-xs font-semibold text-[#c25e37] uppercase tracking-wider">
                  Transformation Complete
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] mt-0.5">
                  {selectedStyle} {selectedRoomType}
                </h3>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl bg-[#f4efe6] p-1 border border-[#e8e2d5] text-xs font-medium">
                  <button
                    onClick={() => setComparisonMode("slider")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                      comparisonMode === "slider"
                        ? "bg-[#ffffff] text-[#1c1917] font-semibold shadow-sm"
                        : "text-[#57534e] hover:text-[#1c1917]"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Split Slider
                  </button>
                  <button
                    onClick={() => setComparisonMode("side-by-side")}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                      comparisonMode === "side-by-side"
                        ? "bg-[#ffffff] text-[#1c1917] font-semibold shadow-sm"
                        : "text-[#57534e] hover:text-[#1c1917]"
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    Side-by-Side
                  </button>
                </div>

                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-[#1c1917] hover:bg-[#2e2926] text-[#ffffff] text-xs font-semibold rounded-xl shadow-sm flex items-center gap-2 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download 8K
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-[#ffffff] border border-[#e8e2d5] hover:bg-[#f4efe6] text-[#1c1917] text-xs font-medium rounded-xl transition"
                >
                  Stage Another Room
                </button>
              </div>
            </div>

            {/* Comparison Display */}
            {comparisonMode === "slider" ? (
              <div className="relative rounded-2xl border border-[#d4ccbd] bg-[#ffffff] aspect-[16/10] sm:aspect-[16/9] overflow-hidden shadow-sm select-none">
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
                  className="absolute top-0 bottom-0 w-[2px] bg-[#ffffff] z-20 pointer-events-none shadow-[0_0_8px_rgba(0,0,0,0.4)]"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#ffffff] text-[#1c1917] border border-[#d4ccbd] flex items-center justify-center font-bold text-xs shadow-md">
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
                <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-md bg-[#1c1917]/80 text-[#ffffff] text-xs font-medium backdrop-blur-sm pointer-events-none">
                  Original Empty Space
                </div>
                <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-md bg-[#ffffff]/90 text-[#1c1917] border border-[#e8e2d5] text-xs font-semibold backdrop-blur-sm pointer-events-none">
                  Staged ({selectedStyle})
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Room */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-[#78716c]">
                    <span>Original Room</span>
                    <span className="font-semibold text-[#1c1917]">Before</span>
                  </div>
                  <div className="relative rounded-xl border border-[#e8e2d5] bg-[#1c1917] aspect-[4/3] overflow-hidden">
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
                  <div className="flex items-center justify-between text-xs font-medium text-[#1c1917]">
                    <span className="font-semibold text-[#c25e37]">Staged Result ({selectedStyle})</span>
                    <span className="font-semibold">After</span>
                  </div>
                  <div className="relative rounded-xl border border-[#d4ccbd] bg-[#1c1917] aspect-[4/3] overflow-hidden group shadow-sm">
                    <img
                      src={generatedImage}
                      alt="Decorated room"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#1c1917]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-[#ffffff] text-[#1c1917] text-xs font-semibold rounded-lg shadow-md hover:bg-[#f4efe6]"
                      >
                        Download 8K
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gemini Architectural Analysis Card */}
            {roomAnalysis && (
              <div className="p-4 rounded-xl bg-[#f8f5ee] border border-[#e8e2d5] text-xs text-[#47433c] leading-relaxed flex items-start gap-3">
                <Info className="w-4 h-4 text-[#c25e37] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1c1917]">Gemini 3.8 Spatial Analysis: </span>
                  <span>{roomAnalysis}</span>
                </div>
              </div>
            )}

            {/* Informational Notice */}
            {generationNotice && (
              <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#e8e2d5] text-xs text-[#57534e]">
                <span>{generationNotice}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Architectural Standards Section */}
      <section id="standards" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#e8e2d5]">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-semibold text-[#8c3817] uppercase tracking-wider mb-1">
            Core Principles
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1c1917]">
            Built with Architectural Respect
          </h2>
          <p className="mt-2 text-sm text-[#57534e] leading-relaxed">
            Eliminating false distortion and random furniture sizing. Every space is calculated with genuine structural perspective and natural daylighting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#ffffff] rounded-2xl border border-[#e8e2d5] p-7 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#f4efe6] text-[#c25e37] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1c1917]">
              Structural Perimeter Lock
            </h3>
            <p className="text-xs text-[#57534e] leading-relaxed">
              No wall or window distortion. Gemini 3.8 Flash anchors the horizon line, perimeter walls, and door openings before introducing furniture.
            </p>
          </div>

          <div className="bg-[#ffffff] rounded-2xl border border-[#e8e2d5] p-7 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#f4efe6] text-[#c25e37] flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1c1917]">
              Warm, Neutral Harmony
            </h3>
            <p className="text-xs text-[#57534e] leading-relaxed">
              Form over distraction. Soft linen, warm oak, and clay tones maintain high-contrast accessibility (WCAG AAA) while letting the photography shine.
            </p>
          </div>

          <div className="bg-[#ffffff] rounded-2xl border border-[#e8e2d5] p-7 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#f4efe6] text-[#c25e37] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1c1917]">
              Direct Spatial Ingestion
            </h3>
            <p className="text-xs text-[#57534e] leading-relaxed">
              Your uploaded photograph is fed inline as the direct spatial baseline. Furnishings are scaled accurately to the real floor dimensions.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e8e2d5] bg-[#ffffff] py-12 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-[#78716c]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-[#c25e37] text-[#ffffff] flex items-center justify-center font-bold text-[10px]">
              F
            </div>
            <span className="font-bold text-[#1c1917]">FlipMySpace</span>
            <span>&bull; Intelligent Room Staging Studio</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#showcase" className="hover:text-[#1c1917] transition">
              Showcase
            </a>
            <a href="#styles-carousel" className="hover:text-[#1c1917] transition">
              Design Styles
            </a>
            <a href="#standards" className="hover:text-[#1c1917] transition">
              Standards
            </a>
          </div>

          <div>
            &copy; {new Date().getFullYear()} FlipMySpace. All rights reserved.
          </div>
        </div>
      </footer>
      {/* Floating Eera AI Design Assistant */}
      <EeraAssistant
        selectedStyle={selectedStyle}
        selectedRoomType={selectedRoomType}
        generatedImage={generatedImage}
        roomAnalysis={roomAnalysis}
        customApiKey={customApiKey}
        onApplyRefinement={handleApplyRefinement}
        isRegenerating={isLoading}
      />
    </div>
  );
}
