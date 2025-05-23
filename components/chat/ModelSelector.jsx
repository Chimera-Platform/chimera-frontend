"use client";

import { useChat } from "@/context/ChatContext";
import { useState, useRef, useEffect, useMemo } from "react";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { XCircleIcon, FunnelIcon, ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

// --- Helper Functions ---

// Check if model is marked as free
const isFreeModel = (model) => model.name.toLowerCase().includes("(free)");

// Calculate price per million tokens from price per 1k tokens
const calculatePricePerMillion = (pricePer1k) => (pricePer1k || 0) * 1000000;

// Format price per million tokens
const formatPrice = (pricePerMillion) => `$${pricePerMillion.toFixed(2)}/M`;

// Define price thresholds (adjust as needed) - based on INPUT cost per Million
const PRICE_TIERS = {
    FREE: 0,
    LOW: 0.5,   // Up to $0.50 / M input tokens
    MEDIUM: 2.0, // Up to $2.00 / M input tokens
    HIGH: Infinity // Anything above
};

// Determine model price tier
const getModelPriceTier = (model) => {
    if (isFreeModel(model)) return "free";
    if (!model.pricePerToken?.prompt) return "unknown"; // Treat models without input price as unknown

    const inputCostPerMillion = calculatePricePerMillion(model.pricePerToken.prompt);

    if (inputCostPerMillion <= PRICE_TIERS.LOW) return "low";
    if (inputCostPerMillion <= PRICE_TIERS.MEDIUM) return "medium";
    return "high";
};

// Get display name for price tiers
const getPriceTierDisplayName = (tier) => {
    const map = {
        "all": "All",
        "free": "Free",
        "low": `Low Cost (<${formatPrice(PRICE_TIERS.LOW).split('/')[0]}/M)`,
        "medium": `Mid Cost (\u2248${formatPrice(PRICE_TIERS.LOW).split('/')[0]}-${formatPrice(PRICE_TIERS.MEDIUM).split('/')[0]}/M)`, // Use ≈ symbol
        "high": `High Cost (>${formatPrice(PRICE_TIERS.MEDIUM).split('/')[0]}/M)`,
        "unknown": "Unknown Price"
    };
    return map[tier] || "Unknown";
};

// Get color class for price tiers
const getPriceTierColorClass = (tier) => {
    const colorMap = {
        "free": "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
        "low": "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-700", // Blue/Sky for low cost
        "medium": "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700",
        "high": "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700",
        "unknown": "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    };
    return colorMap[tier] || colorMap["unknown"]; // Default to unknown style
};


export function ModelSelector({ variant = "default", className, contentClassName }) {
 const { models, selectedModel, selectModel, loading } = useChat();
 const [searchTerm, setSearchTerm] = useState("");
 const searchInputRef = useRef(null);
 const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 const dropdownRef = useRef(null);
 const [showMobileFilterPanel, setShowMobileFilterPanel] = useState(false);

 // Panel expansion state
 const [isPanelExpanded, setIsPanelExpanded] = useState(false);

 // Filter state - Updated to use arrays for multiple selection
 const [activeFilters, setActiveFilters] = useState({
  providers: [],
  free: false, 
  contextRanges: [], // Array of [min, max] ranges
  priceTiers: []     // Array of selected price tiers
 });

 // UI state for context slider
 const [contextRangeInput, setContextRangeInput] = useState([0, 200000]);

 // Get the currently selected model for display
 const currentModelId =
  selectedModel && typeof selectedModel === "object"
   ? selectedModel.id
   : selectedModel;
 const currentModel =
  selectedModel && typeof selectedModel === "object"
   ? selectedModel
   : models?.find((m) => m.id === currentModelId);

 // Automatically detect all providers from model data
 const detectedProviders = useMemo(() => {
    if (!models) return [];
    const providers = new Set();
    models.forEach(model => {
        if (model.provider) {
            providers.add(model.provider.toLowerCase());
        } else {
            const name = model.name.toLowerCase();
            if (name.includes("gpt")) providers.add("openai");
            else if (name.includes("claude")) providers.add("anthropic");
            else if (name.includes("gemini")) providers.add("google");
            else if (name.includes("llama")) providers.add("meta");
            else if (name.includes("mistral")) providers.add("mistral");
            else if (name.includes("command")) providers.add("cohere");
        }
    });
    return Array.from(providers).sort();
 }, [models]);

 // Context range presets
 const contextPresets = [
  { label: "All", min: 0, max: Infinity },
  { label: "Small (<8K)", min: 0, max: 8000 },
  { label: "Medium (8K-32K)", min: 8000, max: 32000 },
  { label: "Large (32K-100K)", min: 32000, max: 100000 },
  { label: "X-Large (>100K)", min: 100000, max: Infinity },
 ];

 // Find max context size for slider
 const maxContextSize = useMemo(() => {
    if (!models) return 200000; // Default max if no models
    // Calculate max context, ensuring it's at least the default
    return Math.max(...models.map(m => m.context || 0), 200000);
 }, [models]);

 // --- Display and Color Helpers ---

 const getProviderDisplayName = (provider) => {
    const map = { "openai": "OpenAI", "anthropic": "Anthropic", "google": "Google", "meta": "Meta AI", "mistral": "Mistral AI", "cohere": "Cohere" };
    return map[provider] || provider.charAt(0).toUpperCase() + provider.slice(1);
 };

 const getProviderColorClass = (provider) => {
    const colorMap = {
        "openai": "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700",
        "anthropic": "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700",
        "google": "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
        "meta": "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700",
        "mistral": "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700",
        "cohere": "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700",
    };
    // Added border color to provider map for consistency
    return colorMap[provider] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
 };


 const formatContextSize = (size) => {
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`;
    if (size >= 1000) return `${(size / 1000).toFixed(0)}K`; // Use toFixed(0) for cleaner K display
    return size?.toString() ?? '0'; // Handle potential null/undefined
 };

 // Get color class for context size
 const getContextSizeColorClass = (context) => {
     if (!context || context <= 0) return "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"; // Unknown/Zero context
     if (context >= 100000) return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"; // XL
     if (context >= 32000) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"; // Large
     if (context >= 8000) return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"; // Medium
     return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"; // Small
 }

 // Apply filters and search to models
 const filteredModels = useMemo(() => {
    if (!models) return [];

    return models.filter(model => {
        // Apply search filter
        if (searchTerm && !model.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Apply provider filter
        if (activeFilters.providers.length > 0) {
            const modelProvider = model.provider?.toLowerCase() || "";
            let providerMatch = activeFilters.providers.includes(modelProvider);
            if (!providerMatch) { // Fallback to name inference if provider field doesn't match
                const name = model.name.toLowerCase();
                providerMatch = activeFilters.providers.some(provider => {
                   if (provider === "openai" && name.includes("gpt")) return true;
                   if (provider === "anthropic" && name.includes("claude")) return true;
                   if (provider === "google" && name.includes("gemini")) return true;
                   if (provider === "meta" && name.includes("llama")) return true;
                   if (provider === "mistral" && name.includes("mistral")) return true;
                   if (provider === "cohere" && name.includes("command")) return true;
                   return false;
                });
            }
            if (!providerMatch) return false;
        }

        // Apply free filter (Checkbox - might be redundant with price tier)
        // If checkbox is checked, only show models containing "(free)"
        if (activeFilters.free && !isFreeModel(model)) {
             return false;
        }

        // Apply context range filter - Match any of the selected ranges
        if (activeFilters.contextRanges.length > 0) {
            const context = model.context || 0;
            const matchesAnyRange = activeFilters.contextRanges.some(range => 
                context >= range[0] && context <= range[1]
            );
            if (!matchesAnyRange) return false;
        }

        // Apply price tier filter - Match any of the selected tiers
        if (activeFilters.priceTiers.length > 0) {
            const modelTier = getModelPriceTier(model);
            // Special case: if filtering for any non-free tiers but not free, exclude free models
            const hasNonFreeTiers = activeFilters.priceTiers.some(tier => tier !== 'free');
            const hasFree = activeFilters.priceTiers.includes('free');
            
            if (hasNonFreeTiers && !hasFree && modelTier === 'free') {
                return false;
            }
            
            // Model must match at least one of the selected price tiers
            if (!activeFilters.priceTiers.includes(modelTier)) {
                return false;
            }
        }

        return true;
    }).sort((a, b) => {
        // Sort primarily by whether they are free (free models first)
        const aIsFree = isFreeModel(a);
        const bIsFree = isFreeModel(b);
        if (aIsFree && !bIsFree) return -1;
        if (!aIsFree && bIsFree) return 1;

        // Then sort by context size (descending) if context filter is active
        if (activeFilters.contextRanges.length > 0) {
             const contextSort = (b.context || 0) - (a.context || 0);
             if (contextSort !== 0) return contextSort;
        }

        // Then sort by price (ascending based on input price) if price filter is active
        if (activeFilters.priceTiers.length > 0) {
            const aPrice = calculatePricePerMillion(a.pricePerToken?.prompt);
            const bPrice = calculatePricePerMillion(b.pricePerToken?.prompt);
            const priceSort = aPrice - bPrice;
            if (priceSort !== 0) return priceSort;
        }


        // Fallback sort by name
        return a.name.localeCompare(b.name);
    });
 }, [models, searchTerm, activeFilters]);


 // --- Filter Control Handlers ---

 const toggleProviderFilter = (provider) => {
    setActiveFilters(prev => {
        const newProviders = prev.providers.includes(provider)
            ? prev.providers.filter(p => p !== provider)
            : [...prev.providers, provider];
        return { ...prev, providers: newProviders };
    });
 };

 const toggleFreeFilter = () => {
    setActiveFilters(prev => {
        const newState = !prev.free;
        // If turning on "Free only", also add 'free' to price tiers if not already there
        if (newState && !prev.priceTiers.includes('free')) {
            return { ...prev, free: newState, priceTiers: [...prev.priceTiers, 'free'] };
        }
        // If turning off and 'free' is the only price tier, remove it
        if (!newState && prev.priceTiers.length === 1 && prev.priceTiers[0] === 'free') {
            return { ...prev, free: newState, priceTiers: [] };
        }
        return { ...prev, free: newState };
    });
 };

 // Handle price tier selection - Toggle selection
 const togglePriceTier = (tier) => {
    setActiveFilters(prev => {
        // Check if tier is already selected
        const isSelected = prev.priceTiers.includes(tier);
        
        // Toggle the tier
        const newPriceTiers = isSelected
            ? prev.priceTiers.filter(t => t !== tier)
            : [...prev.priceTiers, tier];
        
        // Special handling for "all" tier
        if (tier === 'all') {
            // If selecting "all", clear all other tiers
            return { ...prev, priceTiers: isSelected ? [] : ['all'], free: false };
        } else {
            // If selecting any other tier, remove "all" if present
            const tiersWithoutAll = newPriceTiers.filter(t => t !== 'all');
            
            // Update free checkbox when toggling 'free' tier
            const newFreeState = tier === 'free' 
                ? !isSelected  // If toggling 'free', match its state
                : prev.free;   // Otherwise keep current state

            return { ...prev, priceTiers: tiersWithoutAll, free: newFreeState };
        }
    });
 };

// Toggle context range selection (preset butonları için)
const toggleContextRange = (min, max) => {
    setActiveFilters(prev => {
        // Eğer slider'dan bir değer varsa, onu temizle
        let newContextRanges = prev.contextRanges.filter(
            range => !(range[2] === 'slider')
        );
        // Preset zaten seçiliyse kaldır, değilse ekle
        const isSelected = newContextRanges.some(range =>
            range[0] === min && range[1] === max && range[2] === 'preset'
        );
        if (isSelected) {
            newContextRanges = newContextRanges.filter(
                range => !(range[0] === min && range[1] === max && range[2] === 'preset')
            );
        } else {
            newContextRanges.push([min, max, 'preset']);
        }
        return { ...prev, contextRanges: newContextRanges };
    });
};

// Slider ile context range ayarlama
const applyContextRange = () => {
    const min = contextRangeInput[0];
    const max = contextRangeInput[1] === maxContextSize ? Infinity : contextRangeInput[1];
    setActiveFilters(prev => {
        // Slider ile ayarlandığında tüm preset'leri temizle, sadece slider filtresi kalsın
        return {
            ...prev,
            contextRanges: [[min, max, 'slider']]
        };
    });
};

 const hasActiveFilters = useMemo(() => 
    activeFilters.providers.length > 0 ||
    activeFilters.free ||
    activeFilters.contextRanges.length > 0 ||
    activeFilters.priceTiers.length > 0,
    [activeFilters]
 );

 const activeFilterCount = useMemo(() => (
    activeFilters.providers.length +
    (activeFilters.free ? 1 : 0) +
    activeFilters.contextRanges.length +
    (activeFilters.priceTiers.length > 0 ? 1 : 0) // Count price tiers as one filter group
 ), [activeFilters]);

 const clearAllFilters = () => {
    setActiveFilters({
        providers: [],
        free: false,
        contextRanges: [],
        priceTiers: []
    });
    setContextRangeInput([0, maxContextSize]);
    setSearchTerm(""); // Also clear search term
 };

 const removeProviderFilter = (provider) => {
    setActiveFilters(prev => ({ ...prev, providers: prev.providers.filter(p => p !== provider) }));
 };

 // Removing free filter should reset both the checkbox and price tier
 const removeFreeFilter = () => {
    setActiveFilters(prev => ({ 
        ...prev, 
        free: false, 
        priceTiers: prev.priceTiers.filter(tier => tier !== 'free')
    }));
 };

 const removeContextRangeFilter = (min, max, type) => {
    setActiveFilters(prev => ({
        ...prev,
        contextRanges: prev.contextRanges.filter(range => 
            !(range[0] === min && range[1] === max && range[2] === type)
        )
    }));
 };

 // Remove all context range filters
 const removeAllContextRangeFilters = () => {
    setActiveFilters(prev => ({
        ...prev,
        contextRanges: []
    }));
    setContextRangeInput([0, maxContextSize]);
 };

 // Remove price tier filter
 const removePriceTierFilter = (tier) => {
    setActiveFilters(prev => {
        const newPriceTiers = prev.priceTiers.filter(t => t !== tier);
        // Also update free checkbox if removing 'free' tier
        const newFreeState = tier === 'free' ? false : prev.free;
        return {
            ...prev, 
            priceTiers: newPriceTiers,
            free: newFreeState
        };
    });
 };

 // Remove all price tier filters
 const removeAllPriceTierFilters = () => {
    setActiveFilters(prev => ({
        ...prev,
        priceTiers: [],
        free: false
    }));
 };

 // --- Component Lifecycle & UI Effects ---

 const handleToggleMobileFilterPanel = () => setShowMobileFilterPanel(!showMobileFilterPanel);

 useEffect(() => { if (!isDropdownOpen) setShowMobileFilterPanel(false); }, [isDropdownOpen]);

 // Focus management for search input
 useEffect(() => {
    const checkDropdownState = () => {
        const dropdown = document.querySelector('[role="listbox"]');
        const isOpen = !!dropdown;
        setIsDropdownOpen(isOpen);
        if (isOpen && searchInputRef.current && !showMobileFilterPanel && document.activeElement !== searchInputRef.current) {
            setTimeout(() => { try { searchInputRef.current?.focus(); } catch (error) { console.log("Focus error:", error); } }, 100);
        } else if (!isOpen) {
            setIsPanelExpanded(false);
            setShowMobileFilterPanel(false);
        }
    };
    const observer = new MutationObserver(checkDropdownState);
    observer.observe(document.body, { childList: true, subtree: true });
    checkDropdownState(); // Initial check
    return () => observer.disconnect();
 }, [isDropdownOpen, showMobileFilterPanel]); // Dependency added


 // Keyboard listener for search focus
 useEffect(() => {
     const handleKeyDown = (e) => {
         if (isDropdownOpen && searchInputRef.current && !showMobileFilterPanel &&
             e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey &&
             document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                 searchInputRef.current.focus();
         }
     };
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
 }, [isDropdownOpen, showMobileFilterPanel]);


 // Update context slider UI when dropdown opens or filters change
 useEffect(() => {
    if (isDropdownOpen) {
        // Just initialize to full range for the slider UI
        setContextRangeInput([0, maxContextSize]);
    }
 }, [isDropdownOpen, maxContextSize]);

 const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;

 const getContentWidth = () => {
    const isActuallyMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isActuallyMobile) return variant === "wide" ? "w-[90vw] max-w-[450px]" : "w-[90vw] max-w-[350px]";
    if (isPanelExpanded) return variant === "wide" ? "w-[700px]" : "w-[600px]";
    return variant === "wide" ? "w-[400px]" : "w-[350px]"; // Increased default non-expanded width slightly
 };

 const toggleFilterPanel = () => { if (!isMobileView) setIsPanelExpanded(!isPanelExpanded); };

 // --- Render Filter Controls ---
 const renderFilterControls = (isMobile = false) => (
    <div className={cn(
        "p-4 flex flex-col",
        isMobile ? "h-full" : "border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto",
    )}>
        {/* Mobile Header */}
        {isMobile && (
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-slate-900 py-2 z-10 -mt-4 -mx-4 px-4 pt-4 border-b border-slate-200 dark:border-slate-800">
                <button onClick={handleToggleMobileFilterPanel} className="flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 -ml-1">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back
                </button>
                <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Filter Options</h3>
                <div className="w-16 text-right">
                    {hasActiveFilters && <button onClick={clearAllFilters} className="text-xs text-red-500 dark:text-red-400 hover:underline"> Clear All </button>}
                </div>
            </div>
        )}

        {/* Providers Section */}
        <div className="mb-4">
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Providers</h4>
            <div className="flex flex-wrap gap-1.5">
                {detectedProviders.map(provider => (
                    <button key={provider} onClick={() => toggleProviderFilter(provider)}
                        className={cn("px-2 py-0.5 rounded-md text-xs font-medium border transition-colors duration-150",
                            activeFilters.providers.includes(provider)
                                ? cn(getProviderColorClass(provider), 'border-current opacity-100')
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 opacity-80 hover:opacity-100"
                        )}
                    > {getProviderDisplayName(provider)} </button>
                ))}
            </div>
        </div>

        {/* Price Range Section */}
        <div className="mb-4 pt-3 border-t border-slate-200 dark:border-slate-700/50">
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Price Range (Input)</h4>
            <div className="flex flex-wrap gap-1.5">
                 {["all", "free", "low", "medium", "high"].map(tier => (
                    <button key={tier} onClick={() => togglePriceTier(tier)}
                         className={cn("px-2 py-0.5 rounded-md text-xs font-medium border transition-colors duration-150",
                             activeFilters.priceTiers.includes(tier)
                                 ? cn(getPriceTierColorClass(tier), 'border-current opacity-100') // Active style
                                 : cn(getPriceTierColorClass(tier), 'bg-opacity-50 dark:bg-opacity-30 border-opacity-30 opacity-70 hover:opacity-100 hover:bg-opacity-70 dark:hover:bg-opacity-50') // Inactive style
                         )}
                    > {getPriceTierDisplayName(tier)} </button>
                 ))}
            </div>
        </div>


        {/* Context Range Section */}
        <div className="mb-4 pt-3 border-t border-slate-200 dark:border-slate-700/50">
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Context Size (Tokens)</h4>
            <div className="flex flex-wrap gap-1.5 mb-3">
                {contextPresets.map(preset => (
                    <button key={preset.label} onClick={() => toggleContextRange(preset.min, preset.max)}
                        className={cn("px-2 py-0.5 rounded-md text-xs font-medium border transition-colors duration-150",
                            activeFilters.contextRanges.some(range => range[0] === preset.min && range[1] === preset.max && range[2] === 'preset')
                                ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 opacity-100"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 opacity-80 hover:opacity-100"
                        )}
                    > {preset.label} </button>
                ))}
            </div>
            <div className="space-y-2 mb-2">
                <Slider value={contextRangeInput} min={0} max={maxContextSize} step={1000}
                    onValueChange={setContextRangeInput} onValueCommit={applyContextRange}
                    className="w-full [&>span:first-child]:h-1 [&>span:first-child>span]:h-1 [&>span:first-child>span]:bg-amber-500 [&>span:last-child>span]:border-amber-500 [&>span:last-child>span]:bg-white [&>span:last-child>span]:dark:bg-slate-900" />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatContextSize(contextRangeInput[0])}</span>
                    <span>{contextRangeInput[1] === maxContextSize ? formatContextSize(maxContextSize) + "+" : formatContextSize(contextRangeInput[1])}</span>
                </div>
            </div>
        </div>

        {/* Removed "Show Free Models Only" Checkbox */}

        {/* Desktop: Clear All Button & Active Filter Count */}
        {!isMobile && (
            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700/50">
                {hasActiveFilters && (
                    <>
                        <div className="mb-2 text-xs text-center text-slate-500 dark:text-slate-400">
                             <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                                 {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
                             </span>
                        </div>
                        <button onClick={clearAllFilters} className="w-full text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700">
                             Clear All Filters
                        </button>
                    </>
                )}
            </div>
        )}
    </div>
 );

 // --- Main Component Render ---

 if (loading) {
    return (
        <Select disabled>
            <SelectTrigger className={cn("w-full bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800", className)}>
                <SelectValue placeholder="Loading models..." />
            </SelectTrigger>
        </Select>
    );
 }

 return (
    <div className={cn("flex items-center justify-center relative", className)}>
        <Select value={currentModelId || ""}
            onValueChange={(value) => { if (value) selectModel(value); }}
            onOpenChange={(open) => { setIsDropdownOpen(open); if (!open) setSearchTerm(""); }}
        >
            <SelectTrigger className={cn(
                "w-full h-auto min-h-[50px] py-2 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 rounded-lg shadow-sm",
                variant === "wide" && "text-lg", className
            )}>
                <div className="flex items-center justify-center w-full text-center">
                    {currentModel ? (
                        <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2 whitespace-normal leading-tight">
                            {currentModel.name}
                        </span>
                    ) : (
                        <span className="text-slate-500 dark:text-slate-400"> Select a Model </span>
                    )}
                </div>
            </SelectTrigger>

            <SelectContent
                ref={dropdownRef}
                className={cn(
                    "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg max-h-[70vh] min-h-[300px] overflow-hidden p-0 transition-all duration-200 ease-out z-50",
                    "[&>[data-radix-select-scroll-button]]:hidden", // Hide scroll arrows
                    "[&_[data-radix-select-item-indicator]]:hidden", // Hide default radix-ui checkmark indicator
                    "[&_[data-radix-select-item]]:pl-3", // Ensure consistent left padding
                    getContentWidth(), contentClassName
                )}
                position="popper" side="bottom" align="center" sideOffset={5} avoidCollisions={true}
            >
                {showMobileFilterPanel ? (
                    <div className="h-[70vh] max-h-[500px]"> {renderFilterControls(true)} </div>
                ) : (
                    <div className={`flex flex-row h-[70vh] max-h-[500px] transition-all duration-300`}>
                        {/* Model List Panel */}
                        <div className={`flex flex-col ${isPanelExpanded && !isMobileView ? "w-[55%]" : "w-full"} h-full overflow-hidden transition-all duration-300`}>
                            {/* Search Header */}
                            <div className="px-2 py-2 sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-1">
                                    <input ref={searchInputRef} type="text" placeholder="Search models..." value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)} aria-label="Search models"
                                        className="px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-full"
                                    />
                                    {/* Desktop Filter Toggle */}
                                    {!isMobileView && (
                                        <button onClick={toggleFilterPanel} title={isPanelExpanded ? "Hide filters" : "Show filters"} aria-label={isPanelExpanded ? "Hide filters" : "Show filters"}
                                            className={cn("p-1.5 rounded-md border text-sm flex items-center gap-1 filter-button shrink-0",
                                                (isPanelExpanded || hasActiveFilters) ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            )}>
                                            <FunnelIcon className="h-4 w-4" />
                                            {hasActiveFilters && !isPanelExpanded && (<span className="bg-indigo-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium -mr-1 -mt-1 relative top-[-2px] right-[-2px]">{activeFilterCount}</span>)}
                                        </button>
                                    )}
                                     {/* Mobile Filter Toggle */}
                                    {isMobileView && (
                                        <button onClick={handleToggleMobileFilterPanel} title="Show/Hide Filters" aria-label="Show/Hide Filters"
                                            className={cn("p-1.5 rounded-md border text-sm flex items-center gap-1 filter-button shrink-0",
                                                hasActiveFilters ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            )}>
                                            <FunnelIcon className="h-4 w-4" />
                                            {hasActiveFilters && (<span className="bg-indigo-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium -mr-1 -mt-1 relative top-[-2px] right-[-2px]">{activeFilterCount}</span>)}
                                        </button>
                                    )}
                                </div>
                                {/* Active Filters Display (Desktop, Panel Closed) */}
                                {hasActiveFilters && !isPanelExpanded && !isMobileView && (
                                    <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1.5 mb-0.5 px-1 text-xs">
                                        {activeFilters.providers.map(p => (
                                            <Badge key={p} variant="outline" className={cn("h-5 gap-1 font-normal border", getProviderColorClass(p))}>
                                                {getProviderDisplayName(p)} <button onClick={(e) => { e.stopPropagation(); removeProviderFilter(p); }} className="ml-0.5 opacity-70 hover:opacity-100"><XCircleIcon className="h-3 w-3" /></button>
                                            </Badge>
                                        ))}
                                        
                                        {/* Price Tier Badges */}
                                        {activeFilters.priceTiers.length > 0 && (
                                            <div className="flex gap-1 items-center">
                                                <span className="text-slate-500 dark:text-slate-400">Price:</span>
                                                {activeFilters.priceTiers.map(tier => (
                                                    <Badge key={tier} variant="outline" className={cn("h-5 gap-1 font-normal border", getPriceTierColorClass(tier))}>
                                                        {getPriceTierDisplayName(tier).split('(')[0].trim()}
                                                        <button onClick={(e) => { e.stopPropagation(); removePriceTierFilter(tier); }} className="ml-0.5 opacity-70 hover:opacity-100">
                                                            <XCircleIcon className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                                {activeFilters.priceTiers.length > 1 && (
                                                    <button onClick={(e) => { e.stopPropagation(); removeAllPriceTierFilters(); }} className="text-xs text-red-400 hover:text-red-500">
                                                        <XCircleIcon className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Context Range Badges */}
                                        {activeFilters.contextRanges.length > 0 && (
                                            <div className="flex gap-1 items-center">
                                                <span className="text-slate-500 dark:text-slate-400">Context:</span>
                                                {activeFilters.contextRanges.map(range => (
                                                    <Badge key={`${range[0]}-${range[1]}-${range[2]}`} variant="outline" 
                                                        className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700 h-5 gap-1 font-normal">
                                                        {formatContextSize(range[0])}-{range[1] === Infinity ? "∞" : formatContextSize(range[1])}
                                                        <button onClick={(e) => { e.stopPropagation(); removeContextRangeFilter(range[0], range[1], range[2]); }} className="ml-0.5 opacity-70 hover:opacity-100">
                                                            <XCircleIcon className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                                {activeFilters.contextRanges.length > 1 && (
                                                    <button onClick={(e) => { e.stopPropagation(); removeAllContextRangeFilters(); }} className="text-xs text-red-400 hover:text-red-500">
                                                        <XCircleIcon className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Free Only Badge (show only if not already covered by price tiers) */}
                                        {activeFilters.free && !activeFilters.priceTiers.includes('free') && (
                                            <Badge variant="outline" className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 h-5 gap-1 font-normal">
                                                Free Only <button onClick={(e) => { e.stopPropagation(); removeFreeFilter(); }} className="ml-0.5 opacity-70 hover:opacity-100"><XCircleIcon className="h-3 w-3" /></button>
                                            </Badge>
                                        )}
                                        
                                        <button onClick={(e) => { e.stopPropagation(); clearAllFilters(); }} className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 underline ml-1 px-1"> Clear All </button>
                                    </div>
                                )}
                            </div>
                            {/* Results Count */}
                            <div className="px-3 py-1 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 shrink-0">
                                Showing {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''}
                            </div>
                            {/* Model List Scrollable Area */}
                            <div className="overflow-y-auto flex-1">
                                {filteredModels.length > 0 ? (
                                    filteredModels.map((model) => {
                                        const modelTier = getModelPriceTier(model);
                                        const isModelFree = isFreeModel(model);
                                        const inputPrice = calculatePricePerMillion(model.pricePerToken?.prompt);
                                        const outputPrice = calculatePricePerMillion(model.pricePerToken?.completion);

                                        return (
                                            <SelectItem key={model.id} value={model.id}
                                                className={cn(
                                                     `relative w-full cursor-pointer focus:bg-indigo-50 dark:focus:bg-indigo-900/40 outline-none data-[highlighted]:bg-indigo-50 dark:data-[highlighted]:bg-indigo-900/40 data-[state=checked]:bg-indigo-100 dark:data-[state=checked]:bg-indigo-900/50`,
                                                     `py-2.5 px-3`, // Adjusted padding
                                                     `flex flex-col items-center`, // Center content vertically and horizontally
                                                     `[&>span:first-child]:hidden` // Hide the indicator span completely
                                                 )}
                                            >
                                                {/* Centered Model Name */}
                                                <div className="w-full text-center mb-2">
                                                     <span className={cn(
                                                         `font-medium whitespace-normal leading-tight inline-block`,
                                                         model.id === currentModelId ? "text-indigo-700 dark:text-indigo-300" : "text-slate-800 dark:text-slate-200"
                                                     )}>
                                                         {model.name.replace("(free)", "").trim()} {/* Remove (free) tag from name display */}
                                                     </span>
                                                </div>

                                                {/* Badges and Price Info Row - Centered */}
                                                <div className="flex items-center justify-center gap-2 text-xs flex-wrap w-full"> {/* Changed justify-between to justify-center and added flex-wrap */}
                                                    {/* Left side badges */}
                                                    <div className="flex items-center justify-center gap-1.5 flex-wrap"> {/* Added justify-center */}
                                                        {model.provider && (
                                                            <Badge variant="outline" className={cn("px-1.5 py-0.5 text-xs border font-normal", getProviderColorClass(model.provider.toLowerCase()))}>
                                                                {getProviderDisplayName(model.provider.toLowerCase())}
                                                            </Badge>
                                                        )}
                                                        {model.context > 0 && (
                                                            <Badge variant="outline" className={cn("px-1.5 py-0.5 text-xs border font-normal", getContextSizeColorClass(model.context))}>
                                                                {formatContextSize(model.context)} ctx
                                                            </Badge>
                                                        )}
                                                        {/* Show Price Tier Badge */}
                                                        <Badge variant="outline" className={cn("px-1.5 py-0.5 text-xs border font-normal", getPriceTierColorClass(modelTier))}>
                                                            {getPriceTierDisplayName(modelTier).split('(')[0].trim()} {/* Show just tier name */}
                                                        </Badge>
                                                    </div>

                                                    {/* Right side price info - Centered */}
                                                    <div className="flex flex-col items-center text-slate-500 dark:text-slate-400 shrink-0"> {/* Changed items-end to items-center, removed ml-2 */}
                                                         {!(model.pricePerToken && (inputPrice > 0 || outputPrice > 0)) ? (
                                                             <></>
                                                         ) : (
                                                             <>
                                                                 <span className="truncate" title={`Input: ${formatPrice(inputPrice)} tokens`}>
                                                                     In: {formatPrice(inputPrice)}
                                                                 </span>
                                                                 <span className="truncate" title={`Output: ${formatPrice(outputPrice)} tokens`}>
                                                                     Out: {formatPrice(outputPrice)}
                                                                 </span>
                                                             </>
                                                         )}
                                                    </div>
                                                
                                                </div>
                                                
                                                {/* Removed the explicit CheckCircleIcon checkmark here */}
                                            </SelectItem>
                                        );
                                    })
                                ) : (
                                    <div className="py-6 text-center text-slate-500 dark:text-slate-400"> No models found matching your criteria. </div>
                                )}
                            </div> {/* End Scrollable Model List */}
                        </div>
                        {/* Filter Panel (Desktop) */}
                        {isPanelExpanded && !isMobileView && (
                            <div className="w-[45%] h-full overflow-hidden border-l border-slate-200 dark:border-slate-800 transition-all duration-300 flex-shrink-0">
                                {renderFilterControls()}
                            </div>
                        )}
                    </div>
                )}
            </SelectContent>
        </Select>
    </div>
 );
}
