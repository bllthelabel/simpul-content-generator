import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent } from "../types";

// Using Flash for Text/Structure Generation
const TEXT_MODEL = 'gemini-3-flash-preview';
// Using Pro Image Preview for Image Generation
const IMAGE_MODEL = 'gemini-3-pro-image-preview';

const getLayoutSpecificInstructions = (layout: string): string => {
  switch (layout) {
    case 'THOUGHT_LEADERSHIP':
      return `
        LAYOUT GOAL: A Customer Review or Strong Quote.
        TAGLINE: "Customer Review" or "Expert Quote".
        HEADLINE: A short, punchy quote from a landscaper (max 12 words). "E.g. Finally overview in my planning."
        SUBTEXT: Name of the person (e.g. "Jan de Hovenier").
        BODY: Their company name (e.g. "Green Garden BV").
        CTA: A trust badge text (e.g. "5 STARS", "VERIFIED").
      `;
    case 'VENTURE_SPOTLIGHT':
      return `
        LAYOUT GOAL: New Feature Announcement.
        TAGLINE: "NIEUW" or "UPDATE".
        HEADLINE: The Feature Name (e.g., "DIGITAL WORK ORDER", "PLANT ENCYCLOPEDIA").
        SUBTEXT: The main benefit (e.g., "Never lose paper again.").
        BODY: Detailed explanation. You can use multiple lines.
        CTA: Button text (e.g., "TRY NOW", "READ MORE").
      `;
    case 'GROWTH_METRICS':
      return `
        LAYOUT GOAL: Time or Money Savings.
        TAGLINE: "Efficiency" or "Savings".
        HEADLINE: A big number (e.g., "4 HOURS", "€500", "100%").
        SUBTEXT: Per week/month/project.
        BODY: What is saved/gained? (e.g. "Saved on administration per week").
        CTA: Brand tagline (e.g. "PROFITABLE GROWTH").
      `;
    case 'KNOWLEDGE_SHARE':
      return `
        LAYOUT GOAL: "Did You Know?" Fact.
        TAGLINE: "WIST JE DAT?" (Did you know?).
        HEADLINE: A surprising fact about landscaping business or software efficiency.
        SUBTEXT: The 'reveal' or answer.
        BODY: Short context.
        CTA: Action (e.g. "CALCULATE PROFIT").
      `;
    case 'VISUAL_STORY':
      return `
        LAYOUT GOAL: High impact photography with text overlay.
        TAGLINE: Short label (e.g. "IN THE FIELD").
        HEADLINE: Action-oriented short phrase (e.g. "DIGITAL GARDENING").
        SUBTEXT: Short context (e.g. "Anywhere, Anytime").
        BODY: Explanatory text. You can use multiple lines.
        CTA: Link in bio.
      `;
    case 'CONVERSION':
      return `
        LAYOUT GOAL: Pricing or Sales Card.
        TAGLINE: "MEEST GEKOZEN" (Most Popular) or "DEAL".
        HEADLINE: Plan Name (e.g. "MKB", "ZZP", "PRO").
        SUBTEXT: Price (e.g. "€174/mnd").
        BODY: Multiple key features bullet points (separated by newlines).
        CTA: Button (e.g. "START TRIAL").
      `;
    case 'COMPARISON':
      return `
        LAYOUT GOAL: Before/After or Problem/Solution comparison.
        TAGLINE: "VS" or "HET VERSCHIL".
        HEADLINE: The topic being compared (e.g. "Administratie").
        SUBTEXT: The 'Before' or 'Negative' side (e.g. "Chaos, Paperwork, Late nights"). Use newlines for list.
        BODY: The 'After' or 'Positive/Simpul' side (e.g. "Overview, Digital, Home on time"). Use newlines for list.
        CTA: Action (e.g. "SWITCH NOW").
      `;
    default:
      return `
        TAGLINE: Topic.
        HEADLINE: Main Title.
        SUBTEXT: Subtitle.
        BODY: Description. You can use multiple lines.
        CTA: Action.
      `;
  }
};

export const generateBrandText = async (caption: string, layout: string, isCarousel: boolean = false): Promise<GeneratedContent | GeneratedContent[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const layoutInstructions = getLayoutSpecificInstructions(layout);

    const contentSchema = {
      type: Type.OBJECT,
      properties: {
        tagline: { type: Type.STRING },
        headline: { type: Type.STRING },
        subtext: { type: Type.STRING },
        body: { type: Type.STRING },
        cta: { type: Type.STRING },
        icon: { 
          type: Type.STRING, 
          description: "A FontAwesome solid icon class name that best represents the content, e.g., 'fa-solid fa-rocket', 'fa-solid fa-leaf'. Must include 'fa-solid' prefix." 
        },
      },
      required: ["tagline", "headline", "subtext", "body", "cta", "icon"]
    };

    let responseSchema;
    let taskPrompt;

    if (isCarousel) {
      responseSchema = {
        type: Type.ARRAY,
        items: contentSchema
      };
      
      taskPrompt = `
        Task: Generate a CAROUSEL sequence of 3 to 5 slides based on the caption.
        Structure:
        - Slide 1: Hook/Title.
        - Slide 2-3: Value/Steps.
        - Last Slide: CTA.
        Ensure slides follow: ${layoutInstructions}
      `;
    } else {
      responseSchema = contentSchema;
      taskPrompt = `
        Task: Generate content for a single social media post.
        ${layoutInstructions}
      `;
    }

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `
        You are the Brand Copywriter for "Simpul", a Software Platform for Landscapers (Hoveniers).
        
        Brand Voice:
        - Down-to-earth ("Niet lullen maar poetsen").
        - Friendly but professional.
        - Focused on Growth, Simplicity, and Insight.
        - Language: DUTCH (unless caption is explicitly English).
        
        User Caption: "${caption}"
        
        ${taskPrompt}
        
        Return JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    let jsonText = response.text;
    if (!jsonText) throw new Error("No text generated");
    
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonStart = jsonText.indexOf(isCarousel ? '[' : '{');
    const jsonEnd = jsonText.lastIndexOf(isCarousel ? ']' : '}') + 1;
    if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonText = jsonText.substring(jsonStart, jsonEnd);
    }
    
    const parsedData = JSON.parse(jsonText);

    if (Array.isArray(parsedData)) {
      return parsedData.map((item: any) => ({
        ...item,
        imageBase64: null,
        secondaryImage: null,
        tertiaryImage: null
      }));
    }

    return {
      ...parsedData,
      imageBase64: null,
      secondaryImage: null,
      tertiaryImage: null
    };
  } catch (error) {
    console.error("Text generation failed:", error);
    const fallback: GeneratedContent = { 
      tagline: "Update", 
      headline: "Foutje", 
      subtext: "Probeer het opnieuw", 
      body: "", 
      cta: "Retry",
      icon: "fa-solid fa-triangle-exclamation",
      imageBase64: null,
      secondaryImage: null,
      tertiaryImage: null
    };
    return isCarousel ? [fallback, fallback, fallback] : fallback;
  }
};

export const generateAllLayoutsText = async (caption: string, isCarousel: boolean = false): Promise<Record<string, GeneratedContent | GeneratedContent[]>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const contentSchema = {
      type: Type.OBJECT,
      properties: {
        tagline: { type: Type.STRING },
        headline: { type: Type.STRING },
        subtext: { type: Type.STRING },
        body: { type: Type.STRING },
        cta: { type: Type.STRING },
        icon: { 
          type: Type.STRING, 
          description: "A FontAwesome solid icon class name that best represents the content, e.g., 'fa-solid fa-rocket', 'fa-solid fa-leaf'. Must include 'fa-solid' prefix." 
        },
      },
      required: ["tagline", "headline", "subtext", "body", "cta", "icon"]
    };

    const layoutKeys = [
      'THOUGHT_LEADERSHIP', 'VENTURE_SPOTLIGHT', 'COMPARISON', 
      'KNOWLEDGE_SHARE', 'VISUAL_STORY', 'GROWTH_METRICS', 
      'TEAM_CULTURE', 'CONVERSION', 'PHOTO_COLLAGE', 'PROCESS_TIMELINE'
    ];

    const properties: Record<string, any> = {};
    const required: string[] = [];

    layoutKeys.forEach(layout => {
      const layoutInstructions = getLayoutSpecificInstructions(layout);
      
      if (isCarousel) {
        properties[layout] = {
          type: Type.ARRAY,
          items: contentSchema,
          description: `Generate a CAROUSEL sequence of 3 to 5 slides based on the caption. Structure: Slide 1: Hook/Title. Slide 2-3: Value/Steps. Last Slide: CTA. Ensure slides follow: ${layoutInstructions}`
        };
      } else {
        properties[layout] = {
          ...contentSchema,
          description: `Generate content for a single social media post. Ensure it follows: ${layoutInstructions}`
        };
      }
      required.push(layout);
    });

    const responseSchema = {
      type: Type.OBJECT,
      properties,
      required
    };

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `
        You are the Brand Copywriter for "Simpul", a Software Platform for Landscapers (Hoveniers).
        
        Brand Voice:
        - Down-to-earth ("Niet lullen maar poetsen").
        - Friendly but professional.
        - Focused on Growth, Simplicity, and Insight.
        - Language: DUTCH (unless caption is explicitly English).
        
        User Caption: "${caption}"
        
        Task: Generate content for ALL the provided layout styles based on the user caption.
        Each layout has specific instructions in its schema description.
        
        Return JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    let jsonText = response.text;
    if (!jsonText) throw new Error("No text generated");
    
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}') + 1;
    if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonText = jsonText.substring(jsonStart, jsonEnd);
    }
    
    const parsedData = JSON.parse(jsonText);
    
    const result: Record<string, GeneratedContent | GeneratedContent[]> = {};
    for (const key of layoutKeys) {
        if (parsedData[key]) {
            if (Array.isArray(parsedData[key])) {
                result[key] = parsedData[key].map((item: any) => ({
                    ...item,
                    imageBase64: null,
                    secondaryImage: null,
                    tertiaryImage: null
                }));
            } else {
                result[key] = {
                    ...parsedData[key],
                    imageBase64: null,
                    secondaryImage: null,
                    tertiaryImage: null
                };
            }
        } else {
            // Fallback if the model missed a layout
            const fallback: GeneratedContent = { 
              tagline: "Update", 
              headline: "Foutje", 
              subtext: "Probeer het opnieuw", 
              body: "", 
              cta: "Retry",
              icon: "fa-solid fa-triangle-exclamation",
              imageBase64: null,
              secondaryImage: null,
              tertiaryImage: null
            };
            result[key] = isCarousel ? [fallback, fallback, fallback] : fallback;
        }
    }

    return result;
  } catch (error) {
    console.error("Text generation failed:", error);
    throw error;
  }
};

export const generateBrandImage = async (contextPrompt: string, size: '1K' | '2K' | '4K', aspectRatio: string, referenceImageBase64?: string | null): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const parts: any[] = [];
    let textPrompt = '';

    if (referenceImageBase64) {
      const match = referenceImageBase64.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }

      textPrompt = `
        Task: Refine the provided reference image.
        Style: Professional Landscaping Photography. Bright, natural lighting, vivid greens, blue skies.
        Subject: Landscapers working, gardens, modern tablets/phones in outdoor settings.
        Brand Feel: Friendly, Efficient, Growth.
        Avoid: Dark filters, grayscale, suits, abstract matrix code.
        
        Specific Edit: ${contextPrompt}
      `;
    } else {
      textPrompt = `
        Generate a professional photograph for a Landscaping Software brand "Simpul".
        Style: High-quality, bright, natural sunlight, vibrant green vegetation, depth of field.
        Subject: A professional landscaper (polo shirt, work boots) using a tablet or phone in a beautiful garden or construction site. 
        Mood: Productive, happy, organized.
        Context: ${contextPrompt}
        
        NO TEXT in the image. NO dark filters.
      `;
    }

    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: aspectRatio
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

