import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import Artboard from './components/Artboard';
import { 
  LayoutType, 
  AspectRatio, 
  LAYOUT_OPTIONS, 
  FORMAT_OPTIONS, 
  GeneratedContent, 
  GenerationStatus, 
  ContentVisibility, 
  GenerationMode, 
  ImageSize, 
  IMAGE_SIZE_OPTIONS 
} from './types';
import { generateAllLayoutsText, generateBrandImage } from './services/geminiService';
import BrandLogo from './components/BrandLogo';
import { LAYOUT_DEFAULTS, LAYOUT_DESCRIPTIONS } from './constants';

const DEFAULT_CONTENT: GeneratedContent = {
  imageBase64: null,
  secondaryImage: null,
  tertiaryImage: null,
  tagline: 'Review',
  headline: 'Eindelijk overzicht in mijn planning.',
  subtext: 'Jan de Hovenier',
  body: 'Green Gardens BV',
  cta: '5 Sterren',
  imagePrompt: '',
  icon: 'fa-solid fa-star'
};

const AVAILABLE_ICONS = [
  'fa-solid fa-star', 'fa-solid fa-id-badge', 'fa-solid fa-tags',
  'fa-solid fa-circle-question', 'fa-solid fa-rocket', 'fa-solid fa-leaf',
  'fa-solid fa-handshake', 'fa-solid fa-lightbulb', 'fa-solid fa-bullhorn',
  'fa-solid fa-chart-line', 'fa-solid fa-users', 'fa-solid fa-trophy',
  'fa-solid fa-gem', 'fa-solid fa-crown', 'fa-solid fa-heart',
  'fa-solid fa-check', 'fa-solid fa-xmark', 'fa-solid fa-arrow-right',
  'fa-solid fa-circle-check', 'fa-solid fa-shield-halved'
];

export default function App() {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [checkingKey, setCheckingKey] = useState<boolean>(true);
  
  const [caption, setCaption] = useState('');
  const [generationMode, setGenerationMode] = useState<GenerationMode>('SINGLE');
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('THOUGHT_LEADERSHIP');
  const [selectedFormat, setSelectedFormat] = useState<AspectRatio>('SQUARE');
  const [selectedImageSize, setSelectedImageSize] = useState<ImageSize>('1K');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [applyEffect, setApplyEffect] = useState(false); 
  const [isImageSpread, setIsImageSpread] = useState(false);
  const [status, setStatus] = useState<GenerationStatus>({ isGenerating: false, step: 'IDLE' });
  
  // Initialize with layout defaults if available
  const [slides, setSlides] = useState<GeneratedContent[]>([{
     ...DEFAULT_CONTENT,
     ...LAYOUT_DEFAULTS['THOUGHT_LEADERSHIP']
  }]);
  const [generatedLayouts, setGeneratedLayouts] = useState<Record<LayoutType, GeneratedContent[]> | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [visibility, setVisibility] = useState<ContentVisibility>({
    tagline: true,
    headline: true,
    subtext: true,
    body: true,
    cta: true,
    icon: true,
    logo: true,
    box: true
  });

  const artboardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const secondaryFileInputRef = useRef<HTMLInputElement>(null);
  const tertiaryFileInputRef = useRef<HTMLInputElement>(null);

  const getLayoutDefaultIcon = (layout: LayoutType) => {
      switch(layout) {
          case 'THOUGHT_LEADERSHIP': return 'fa-solid fa-star';
          case 'TEAM_CULTURE': return 'fa-solid fa-id-badge';
          case 'CONVERSION': return 'fa-solid fa-tags';
          case 'KNOWLEDGE_SHARE': return 'fa-solid fa-circle-question';
          case 'GROWTH_METRICS': return 'fa-solid fa-circle-check';
          case 'COMPARISON': return 'fa-solid fa-check';
          case 'PROCESS_TIMELINE': return 'fa-solid fa-arrow-right';
          case 'VENTURE_SPOTLIGHT': return 'fa-solid fa-arrow-right';
          case 'VISUAL_STORY': return 'fa-solid fa-arrow-right';
          default: return 'fa-solid fa-star';
      }
  };

  const activeLayoutConfig = LAYOUT_OPTIONS.find(opt => opt.id === selectedLayout);
  const activeContent = slides[activeSlideIndex] || DEFAULT_CONTENT;
  const layoutDescription = LAYOUT_DESCRIPTIONS[selectedLayout];
  const currentIcon = activeContent.icon || getLayoutDefaultIcon(selectedLayout);

  useEffect(() => {
    const checkKey = async () => {
      const win = window as any;
      let attempts = 0;
      while (!win.aistudio && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (win.aistudio) {
        try {
          const hasKey = await win.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } catch (e) {
          console.error("Error checking for API key:", e);
        }
      } else {
        console.warn("window.aistudio not available.");
      }
      setCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleConnectApiKey = async () => {
    const win = window as any;
    if (win.aistudio) {
      try {
        await win.aistudio.openSelectKey();
        setHasApiKey(true);
      } catch (e) {
        console.error("API Key selection failed or cancelled", e);
      }
    } else {
      setHasApiKey(true);
    }
  };

  const handleLayoutChange = (newLayout: LayoutType) => {
    // Save current slides to the old layout
    if (generatedLayouts) {
        setGeneratedLayouts(prev => ({
            ...prev!,
            [selectedLayout]: slides
        }));
    }

    setSelectedLayout(newLayout);
    
    // Load the new layout's slides if they exist
    if (generatedLayouts && generatedLayouts[newLayout]) {
        const newLayoutSlides = generatedLayouts[newLayout].map((slide, index) => {
            const currentSlide = slides[index] || slides[0];
            return {
                ...slide,
                imageBase64: currentSlide?.imageBase64 || slide.imageBase64,
                secondaryImage: currentSlide?.secondaryImage || slide.secondaryImage,
                tertiaryImage: currentSlide?.tertiaryImage || slide.tertiaryImage,
            };
        });
        setSlides(newLayoutSlides);
    } else {
        // Apply layout-specific default text to the active slide
        const defaults = LAYOUT_DEFAULTS[newLayout];
        if (defaults) {
            setSlides(prevSlides => {
                const newSlides = [...prevSlides];
                // Only update text fields, keep images if they exist
                newSlides[activeSlideIndex] = {
                    ...newSlides[activeSlideIndex],
                    ...defaults,
                    // Preserve existing images if valid, otherwise keep default behavior
                    imageBase64: newSlides[activeSlideIndex].imageBase64,
                    secondaryImage: newSlides[activeSlideIndex].secondaryImage,
                    tertiaryImage: newSlides[activeSlideIndex].tertiaryImage,
                };
                return newSlides;
            });
        }
    }
  };

  const updateSlideContent = (index: number, field: keyof GeneratedContent, value: string) => {
    setSlides(prevSlides => {
      const newSlides = [...prevSlides];
      newSlides[index] = { ...newSlides[index], [field]: value };
      return newSlides;
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, target: 'imageBase64' | 'secondaryImage' | 'tertiaryImage' = 'imageBase64') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         const targetIndex = isImageSpread && generationMode === 'CAROUSEL' && target === 'imageBase64' ? 0 : activeSlideIndex;
         updateSlideContent(targetIndex, target, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextChange = (field: keyof GeneratedContent, value: string) => {
    updateSlideContent(activeSlideIndex, field, value);
  };

  const toggleVisibility = (field: keyof ContentVisibility) => {
    setVisibility(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleGenerate = async (manualCaption?: string | unknown) => {
    // Check if manualCaption is a string, otherwise fallback to state caption
    const textToProcess = typeof manualCaption === 'string' ? manualCaption : caption;
    
    if (!textToProcess.trim()) return;
    
    // Update caption state if triggered manually so UI reflects what is being generated
    if (typeof manualCaption === 'string' && manualCaption !== caption) {
        setCaption(manualCaption);
    }

    setStatus({ isGenerating: true, step: 'ANALYZING' });
    try {
      const isCarousel = generationMode === 'CAROUSEL';
      const result = await generateAllLayoutsText(textToProcess, isCarousel);
      
      const newGeneratedLayouts: Record<LayoutType, GeneratedContent[]> = {} as any;
      
      for (const layoutId of Object.keys(result)) {
          const layoutResult = result[layoutId];
          if (Array.isArray(layoutResult)) {
              newGeneratedLayouts[layoutId as LayoutType] = layoutResult.map((content) => ({
                  ...DEFAULT_CONTENT, 
                  ...content,         
                  imageBase64: slides[0]?.imageBase64 || null,
                  secondaryImage: slides[0]?.secondaryImage || null,
                  tertiaryImage: slides[0]?.tertiaryImage || null
              }));
          } else {
              newGeneratedLayouts[layoutId as LayoutType] = [{ ...slides[0], ...layoutResult }];
          }
      }
      
      setGeneratedLayouts(newGeneratedLayouts);
      
      if (newGeneratedLayouts[selectedLayout]) {
          setSlides(newGeneratedLayouts[selectedLayout]);
      }
      
      setActiveSlideIndex(0);
      setVisibility({ tagline: true, headline: true, subtext: true, body: true, cta: true, icon: true });
      setStatus({ isGenerating: false, step: 'DONE' });
    } catch (error) {
      console.error(error);
      setStatus({ isGenerating: false, step: 'ERROR', error: 'Generation failed.' });
    }
  };

  const handleAiSuggestion = () => {
    let suggestion = "Maak een professionele social media post voor een hoveniersbedrijf.";

    switch(selectedLayout) {
        case 'THOUGHT_LEADERSHIP':
            suggestion = "Een korte, positieve review van familie Jansen over de aanleg van hun nieuwe moderne voortuin.";
            break;
        case 'VENTURE_SPOTLIGHT':
            suggestion = "Kondig onze nieuwe '3D Tuinontwerp' service aan. Nadruk op visualisatie vooraf.";
            break;
        case 'GROWTH_METRICS':
            suggestion = "Focus op hoeveel tijd klanten besparen met onze onderhoudsservice. Bijvoorbeeld 4 uur per weekend.";
            break;
        case 'KNOWLEDGE_SHARE':
            suggestion = "Wist je dat? Een feitje over wanneer je het beste kunt snoeien in het voorjaar.";
            break;
        case 'VISUAL_STORY':
            suggestion = "Een sfeervolle post over genieten van de tuin in de zomer. Focus op beeld.";
            break;
        case 'CONVERSION':
            suggestion = "Promoot onze 'Voorjaarsbeurt' actie. Nu voor €250 incl afvoer groenafval.";
            break;
        case 'TEAM_CULTURE':
            suggestion = "Stel onze nieuwe collega Mark voor. Hij is specialist in vijveraanleg.";
            break;
        case 'PHOTO_COLLAGE':
            suggestion = "Toon een voor en na van een recente renovatie in Amsterdam.";
            break;
        case 'PROCESS_TIMELINE':
            suggestion = "Leg uit hoe ons ontwerpproces werkt in 3 simpele stappen: Kennismaking, Ontwerp, Aanleg.";
            break;
        case 'COMPARISON':
            suggestion = "Vergelijk 'Zelf doen' (zwaar, tijdrovend) vs 'Laten doen' (genieten, vakwerk).";
            break;
    }
    setCaption(suggestion);
  };

  const handleDownload = async () => {
    const currentRef = artboardRefs.current[activeSlideIndex];
    if (currentRef) {
      try {
        const dataUrl = await toPng(currentRef, { cacheBust: true, pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `simpul-social-${selectedLayout}-${activeSlideIndex + 1}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Download failed', err);
      }
    }
  };

  const handleDownloadAll = async () => {
    for (let i = 0; i < slides.length; i++) {
        const ref = artboardRefs.current[i];
        if (ref) {
            try {
                // Small delay to prevent browser throttling
                await new Promise(r => setTimeout(r, 200));
                const dataUrl = await toPng(ref, { cacheBust: true, pixelRatio: 2 });
                const link = document.createElement('a');
                link.download = `simpul-social-${selectedLayout}-slide-${i + 1}.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error(`Download failed for slide ${i}`, err);
            }
        }
    }
  };

  const handleGenerateImage = async () => {
    if (!caption.trim()) return;
    setStatus({ isGenerating: true, step: 'GENERATING_IMAGE' });
    
    try {
      // Determine aspect ratio string for the API
      const activeFormat = FORMAT_OPTIONS.find(f => f.id === selectedFormat);
      // Map our internal IDs to Gemini API aspect ratios if needed, or pass directly if they match
      // Gemini supports: "1:1", "3:4", "4:3", "9:16", "16:9"
      let apiAspectRatio = "1:1";
      if (selectedFormat === 'PORTRAIT') apiAspectRatio = "3:4"; // Close approximation or exact? 4:5 is standard IG, but API supports 3:4. Let's use 3:4 or 4:3. 
      // Wait, documentation says: "1:1", "3:4", "4:3", "9:16", "16:9".
      // My formats: SQUARE (1:1), PORTRAIT (4:5 - not supported directly, use 3:4?), STORY (9:16), LANDSCAPE (1.91:1 - not supported, use 16:9?)
      
      switch(selectedFormat) {
          case 'SQUARE': apiAspectRatio = "1:1"; break;
          case 'PORTRAIT': apiAspectRatio = "3:4"; break; // Best fit
          case 'STORY': apiAspectRatio = "9:16"; break;
          case 'LANDSCAPE': apiAspectRatio = "16:9"; break; // Best fit
      }

      const imageUrl = await generateBrandImage(caption, selectedImageSize, apiAspectRatio);
      
      if (imageUrl) {
        setSlides(prev => {
            const newSlides = [...prev];
            // If spread mode is on, apply to all? Or just the first one and let the spread logic handle it?
            // The spread logic in Artboard uses the image from the current slide (or first if configured).
            // Let's update the active slide.
            newSlides[activeSlideIndex] = {
                ...newSlides[activeSlideIndex],
                imageBase64: imageUrl
            };
            return newSlides;
        });
      }
      setStatus({ isGenerating: false, step: 'DONE' });
    } catch (error) {
      console.error(error);
      setStatus({ isGenerating: false, step: 'ERROR', error: 'Image generation failed.' });
    }
  };

  if (checkingKey) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
            <BrandLogo className="w-32 h-auto mb-4" white={true} />
            <div className="text-sm font-mono text-slate-400">Initializing System...</div>
        </div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 tech-grid-pattern opacity-10"></div>
        <div className="relative z-10 max-w-md w-full bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl border border-slate-700 shadow-2xl">
            <BrandLogo className="w-40 h-auto mx-auto mb-8" white={true} />
            <h1 className="text-2xl font-bold text-white mb-4">Welcome to Simpul Social</h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Connect your Gemini API key to unlock the power of AI-generated brand content.
            </p>
            <button 
              onClick={handleConnectApiKey}
              className="w-full py-4 bg-brand-primary hover:bg-[#4d7c3a] text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-3"
            >
              <i className="fa-brands fa-google text-xl"></i>
              <span>Connect Gemini API</span>
            </button>
            <p className="mt-6 text-xs text-slate-500">
              Powered by Google Gemini 2.0 Flash & Pro Models
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans overflow-hidden selection:bg-brand-primary selection:text-white">
      
      {/* LEFT SIDEBAR - CONTROLS */}
      <aside className="w-[400px] flex flex-col border-r border-slate-800 bg-slate-900/95 backdrop-blur z-20 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center border border-brand-primary/20">
             <BrandLogo className="w-6 h-auto" />
          </div>
          <div>
              <h1 className="font-bold text-white text-lg leading-none">Simpul Social</h1>
              <div className="text-[10px] font-mono text-brand-primary mt-1 tracking-wider uppercase">Generator v{import.meta.env.VITE_APP_VERSION || '1.0'}</div>
          </div>
        </div>

        {/* Scrollable Controls */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* 1. INPUT SECTION */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <i className="fa-solid fa-pen-to-square mr-2"></i>Content Input
                </label>
                <button onClick={handleAiSuggestion} className="text-[10px] text-brand-primary hover:text-white transition-colors cursor-pointer font-bold uppercase tracking-wider">
                    <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> Auto-Fill
                </button>
            </div>
            
            <div className="relative group">
                <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What do you want to post about? (e.g., 'New garden design in Utrecht', 'Spring maintenance tips')"
                className="w-full h-32 bg-slate-800 border-2 border-slate-700 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:border-brand-primary focus:ring-0 transition-all resize-none shadow-inner"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                    <button 
                        onClick={handleGenerateImage}
                        disabled={status.isGenerating || !caption.trim()}
                        className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Generate Image Only"
                    >
                        <i className="fa-solid fa-image"></i>
                    </button>
                    <button 
                        onClick={() => handleGenerate()}
                        disabled={status.isGenerating || !caption.trim()}
                        className="w-8 h-8 rounded-lg bg-brand-primary hover:bg-[#4d7c3a] text-white flex items-center justify-center transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Generate Text & Layout"
                    >
                        {status.isGenerating ? (
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                        ) : (
                            <i className="fa-solid fa-paper-plane"></i>
                        )}
                    </button>
                </div>
            </div>
          </section>

          {/* 2. LAYOUT SELECTION */}
          <section className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                <i className="fa-solid fa-layer-group mr-2"></i>Layout Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleLayoutChange(option.id)}
                  className={`
                    relative p-3 rounded-xl border-2 text-left transition-all duration-200 group
                    ${selectedLayout === option.id 
                      ? 'bg-brand-primary/10 border-brand-primary' 
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'}
                  `}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors
                        ${selectedLayout === option.id ? 'bg-brand-primary text-white' : 'bg-slate-700 text-slate-400 group-hover:text-white'}
                    `}>
                        <i className={`las ${option.icon}`}></i>
                    </div>
                    <span className={`text-xs font-bold ${selectedLayout === option.id ? 'text-white' : 'text-slate-300'}`}>
                        {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {/* Layout Description Helper */}
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <div className="text-xs font-bold text-white mb-1">{layoutDescription.title}</div>
                <div className="text-[10px] text-slate-400 leading-relaxed">{layoutDescription.description}</div>
            </div>
          </section>

          {/* 3. FORMAT & SETTINGS */}
          <section className="space-y-4">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                <i className="fa-solid fa-sliders mr-2"></i>Configuration
            </label>
            
            {/* Format Selector */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                {FORMAT_OPTIONS.map((fmt) => (
                    <button
                        key={fmt.id}
                        onClick={() => setSelectedFormat(fmt.id)}
                        className={`
                            flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all
                            ${selectedFormat === fmt.id ? 'bg-slate-700 border-white text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}
                        `}
                        title={fmt.label}
                    >
                        <i className={`las ${fmt.icon} text-xl mb-1`}></i>
                        <span className="text-[9px] font-bold uppercase">{fmt.id}</span>
                    </button>
                ))}
            </div>

            {/* Toggles */}
            <div className="space-y-2">
                {/* Carousel Mode */}
                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-slate-300">
                            <i className="fa-solid fa-images"></i>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">Carousel Mode</div>
                            <div className="text-[10px] text-slate-400">Generate multi-slide post</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            const newMode = generationMode === 'SINGLE' ? 'CAROUSEL' : 'SINGLE';
                            setGenerationMode(newMode);
                            // Reset slides if switching back to single
                            if (newMode === 'SINGLE') {
                                setSlides([slides[0]]);
                                setActiveSlideIndex(0);
                            } else {
                                // Add dummy slides if switching to carousel
                                if (slides.length === 1) {
                                    setSlides([slides[0], {...slides[0], headline: 'Slide 2'}, {...slides[0], headline: 'Slide 3'}]);
                                }
                            }
                        }}
                        className={`w-10 h-5 rounded-full relative transition-colors ${generationMode === 'CAROUSEL' ? 'bg-brand-primary' : 'bg-slate-600'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${generationMode === 'CAROUSEL' ? 'left-6' : 'left-1'}`}></div>
                    </button>
                </div>

                 {/* Image Spread (Only for Carousel) */}
                 {generationMode === 'CAROUSEL' && (
                    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-slate-300">
                                <i className="fa-solid fa-panorama"></i>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white">Panorama Spread</div>
                                <div className="text-[10px] text-slate-400">One image across all slides</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsImageSpread(!isImageSpread)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${isImageSpread ? 'bg-brand-primary' : 'bg-slate-600'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${isImageSpread ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>
                 )}

                 {/* Image Size Selector */}
                 <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-slate-300">
                            <i className="fa-solid fa-expand"></i>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">Image Quality</div>
                            <div className="text-[10px] text-slate-400">Gemini Pro Resolution</div>
                        </div>
                    </div>
                    <div className="flex bg-slate-900 rounded p-1">
                        {IMAGE_SIZE_OPTIONS.map(size => (
                            <button
                                key={size}
                                onClick={() => setSelectedImageSize(size)}
                                className={`px-2 py-1 text-[9px] font-bold rounded transition-colors ${selectedImageSize === size ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                 </div>
            </div>
          </section>

          {/* 4. VISIBILITY TOGGLES */}
          <section className="space-y-4">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                <i className="fa-solid fa-eye mr-2"></i>Element Visibility
            </label>
            <div className="flex flex-wrap gap-2">
                {(Object.keys(visibility) as Array<keyof ContentVisibility>).map((key) => (
                    <button
                        key={key}
                        onClick={() => toggleVisibility(key)}
                        className={`
                            px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all
                            ${visibility[key] 
                                ? 'bg-slate-700 border-slate-600 text-white' 
                                : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-600'}
                        `}
                    >
                        {key}
                    </button>
                ))}
            </div>
          </section>

          {/* 5. ICON SELECTOR */}
          <section className="space-y-4">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                <i className="fa-solid fa-icons mr-2"></i>Icoon
            </label>
            <div className="grid grid-cols-5 gap-2">
                {AVAILABLE_ICONS.map(iconClass => (
                    <button
                        key={iconClass}
                        onClick={() => handleTextChange('icon', iconClass)}
                        className={`
                            h-10 rounded-lg flex items-center justify-center text-lg transition-all border
                            ${currentIcon === iconClass 
                                ? 'bg-brand-primary border-brand-primary text-white shadow-md' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-600'}
                        `}
                        title={iconClass.replace('fa-solid fa-', '')}
                    >
                        <i className={iconClass}></i>
                    </button>
                ))}
            </div>
            <div className="mt-2">
                <input 
                    type="text" 
                    value={activeContent.icon || ''} 
                    onChange={(e) => handleTextChange('icon', e.target.value)}
                    placeholder="Of vul een FontAwesome class in (bijv. fa-solid fa-heart)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors"
                />
            </div>
          </section>

        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur z-10">
            <div className="flex items-center gap-4">
                 {/* Slide Navigation (Carousel Mode) */}
                 {generationMode === 'CAROUSEL' && (
                    <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveSlideIndex(idx)}
                                className={`
                                    w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all
                                    ${activeSlideIndex === idx ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:bg-slate-700'}
                                `}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                 )}
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={handleDownload}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
                >
                    <i className="fa-solid fa-download"></i> Download Current
                </button>
                {generationMode === 'CAROUSEL' && (
                    <button 
                        onClick={handleDownloadAll}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
                    >
                        <i className="fa-solid fa-file-zipper"></i> Download All
                    </button>
                )}
            </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-10 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 tech-grid-pattern opacity-5 pointer-events-none"></div>
            
            {/* Artboard Container */}
            <div className="relative z-10 transition-all duration-500 transform">
               {slides.map((slideContent, index) => (
                   <div 
                    key={index} 
                    className={`${activeSlideIndex === index ? 'block' : 'hidden'}`}
                   >
                        <Artboard
                            ref={(el) => (artboardRefs.current[index] = el)}
                            layout={selectedLayout}
                            format={selectedFormat}
                            content={slideContent}
                            visibility={visibility}
                            isDarkMode={isDarkMode}
                            applyEffect={applyEffect}
                            slideIndex={index}
                            totalSlides={slides.length}
                            isImageSpread={isImageSpread}
                        />
                   </div>
               ))}
            </div>
        </div>

        {/* Editor Panel (Bottom) */}
        <div className="h-64 border-t border-slate-800 bg-slate-900 z-20 flex flex-col">
            <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <i className="fa-solid fa-pen-nib mr-2"></i>Editor
                </span>
                <div className="flex gap-2">
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition-colors"
                     >
                        <i className="fa-solid fa-upload mr-1"></i> Upload Image
                     </button>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'imageBase64')} 
                     />
                     
                     {/* Secondary Image Upload (if layout supports it) */}
                     {activeLayoutConfig?.hasImage && (
                        <>
                             <button 
                                onClick={() => secondaryFileInputRef.current?.click()}
                                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition-colors"
                            >
                                <i className="fa-solid fa-upload mr-1"></i> 2nd Image
                            </button>
                            <input 
                                type="file" 
                                ref={secondaryFileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'secondaryImage')} 
                            />
                        </>
                     )}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Tagline</label>
                            <input 
                                type="text" 
                                value={activeContent.tagline} 
                                onChange={(e) => handleTextChange('tagline', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-brand-primary focus:ring-0"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Headline</label>
                            <textarea 
                                value={activeContent.headline} 
                                onChange={(e) => handleTextChange('headline', e.target.value)}
                                rows={2}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-brand-primary focus:ring-0 resize-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Subtext</label>
                            <textarea 
                                value={activeContent.subtext} 
                                onChange={(e) => handleTextChange('subtext', e.target.value)}
                                rows={2}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-brand-primary focus:ring-0 resize-none"
                            />
                        </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">CTA Button</label>
                            <input 
                                type="text" 
                                value={activeContent.cta} 
                                onChange={(e) => handleTextChange('cta', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-brand-primary focus:ring-0"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 h-full flex flex-col">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Body Text</label>
                        <textarea 
                            value={activeContent.body} 
                            onChange={(e) => handleTextChange('body', e.target.value)}
                            className="w-full flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-brand-primary focus:ring-0 resize-y min-h-[100px]"
                        />
                    </div>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}
