
export type LayoutType = 
  | 'THOUGHT_LEADERSHIP'
  | 'VENTURE_SPOTLIGHT'
  | 'GROWTH_METRICS'
  | 'TEAM_CULTURE'
  | 'CONVERSION'
  | 'VISUAL_STORY'
  | 'PHOTO_COLLAGE'
  | 'KNOWLEDGE_SHARE'
  | 'PROCESS_TIMELINE'
  | 'COMPARISON';

export type AspectRatio = 'SQUARE' | 'PORTRAIT' | 'LANDSCAPE' | 'STORY';

export type ImageSize = '1K' | '2K' | '4K';

export interface LayoutOption {
  id: LayoutType;
  label: string;
  icon: string;
  hasImage: boolean;
}

export interface FormatOption {
  id: AspectRatio;
  label: string;
  icon: string;
  dimensions: string; // Tailwind classes for aspect ratio
}

export interface GeneratedContent {
  imageBase64: string | null;
  secondaryImage: string | null;
  tertiaryImage: string | null;
  tagline: string;
  headline: string;
  subtext: string;
  body: string;
  cta: string;
  imagePrompt?: string;
  icon?: string;
}

export interface ContentVisibility {
  tagline: boolean;
  headline: boolean;
  subtext: boolean;
  body: boolean;
  cta: boolean;
  icon: boolean;
  logo: boolean;
  box: boolean;
}

export type GenerationMode = 'SINGLE' | 'CAROUSEL';

export interface GenerationStatus {
  isGenerating: boolean;
  step: 'IDLE' | 'ANALYZING' | 'GENERATING_TEXT' | 'GENERATING_IMAGE' | 'DONE' | 'ERROR';
  error?: string;
}

export const IMAGE_SIZE_OPTIONS: ImageSize[] = ['1K', '2K', '4K'];

export const LAYOUT_OPTIONS: LayoutOption[] = [
  { id: 'THOUGHT_LEADERSHIP', label: 'Review / Quote', icon: 'la-star', hasImage: false },
  { id: 'VENTURE_SPOTLIGHT', label: 'Feature Highlight', icon: 'la-bolt', hasImage: true },
  { id: 'COMPARISON', label: 'Comparison / VS', icon: 'la-balance-scale', hasImage: true },
  { id: 'KNOWLEDGE_SHARE', label: 'Did You Know?', icon: 'la-question-circle', hasImage: false },
  { id: 'VISUAL_STORY', label: 'Photo Overlay', icon: 'la-camera', hasImage: true },
  { id: 'GROWTH_METRICS', label: 'Stats / Metrics', icon: 'la-chart-line', hasImage: false },
  { id: 'TEAM_CULTURE', label: 'Team Profile', icon: 'la-user-circle', hasImage: true },
  { id: 'CONVERSION', label: 'Pricing / Sales', icon: 'la-tags', hasImage: false },
  { id: 'PHOTO_COLLAGE', label: 'Collage', icon: 'la-th-large', hasImage: true },
  { id: 'PROCESS_TIMELINE', label: 'Timeline', icon: 'la-stream', hasImage: true },
];

export const FORMAT_OPTIONS: FormatOption[] = [
  { id: 'SQUARE', label: 'Square (1:1)', icon: 'la-square', dimensions: 'h-[540px] w-[540px]' }, // 1080x1080 scale
  { id: 'PORTRAIT', label: 'Portrait (4:5)', icon: 'la-portrait', dimensions: 'h-[540px] w-[432px]' }, // 1080x1350 scale
  { id: 'STORY', label: 'Story (9:16)', icon: 'la-mobile', dimensions: 'h-[540px] w-[304px]' }, // 1080x1920 scale
  { id: 'LANDSCAPE', label: 'Landscape (1.91:1)', icon: 'la-image', dimensions: 'h-[283px] w-[540px]' }, // 1080x566 scale
];

