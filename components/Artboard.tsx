import React, { forwardRef } from 'react';
import { GeneratedContent, LayoutType, AspectRatio, ContentVisibility, FORMAT_OPTIONS } from '../types';
import BrandLogo from './BrandLogo';
import { AutoScaler } from './AutoScaler';

interface ArtboardProps {
  layout: LayoutType;
  format: AspectRatio;
  content: GeneratedContent;
  visibility: ContentVisibility;
  isDarkMode: boolean;
  applyEffect: boolean;
  slideIndex?: number;
  totalSlides?: number;
  isImageSpread?: boolean;
}

const Artboard = forwardRef<HTMLDivElement, ArtboardProps>(({ 
  layout, 
  format, 
  content, 
  visibility, 
  isDarkMode, 
  applyEffect,
  slideIndex = 0,
  totalSlides = 1,
  isImageSpread = false
}, ref) => {
  const { imageBase64, secondaryImage, tertiaryImage, tagline, headline, subtext, body, cta, icon } = content;

  const getLayoutDefaultIcon = (layoutType: string) => {
      switch(layoutType) {
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

  const displayIcon = icon || getLayoutDefaultIcon(layout);

  const isCarousel = totalSlides > 1;

  // Determine size based on format
  const activeFormat = FORMAT_OPTIONS.find(f => f.id === format) || FORMAT_OPTIONS[0];
  const sizeClasses = activeFormat.dimensions;

  // Base container styles
  // We use specific borders/backgrounds per layout, so base class is minimal
  const containerClass = `relative overflow-hidden shadow-2xl mx-auto font-sans ${sizeClasses} flex-shrink-0 flex flex-col ${
    isCarousel ? 'rounded-none first:rounded-l-2xl last:rounded-r-2xl' : 'rounded-2xl'
  } bg-white`;
  
  const imgClass = `w-full h-full object-cover ${applyEffect ? 'img-bright' : ''}`;

  // Default images
  const displayImage = imageBase64 || "https://images.unsplash.com/photo-1558904541-efa843a96f01?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  const displaySecondary = secondaryImage || "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  const RenderSpreadImage = ({ src, className = "" }: { src: string, className?: string }) => {
    if (!isImageSpread || !isCarousel) {
      return <img src={src} crossOrigin="anonymous" alt="Visual" className={`${imgClass} ${className}`} />;
    }
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <div style={{ width: `${totalSlides * 100}%`, height: '100%', position: 'absolute', left: `-${slideIndex * 100}%`, top: 0 }}>
          <img src={src} crossOrigin="anonymous" alt="Visual Spread" className={`w-full h-full object-cover ${applyEffect ? 'img-bright' : ''}`} />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (layout) {
      // 1. REVIEW / QUOTE
      case 'THOUGHT_LEADERSHIP':
        return (
          <div className="h-full w-full flex flex-col bg-white border-[12px] border-brand-primary box-border relative">
             <div className="flex-1 p-8 flex flex-col items-center justify-center text-center overflow-hidden">
                <AutoScaler alignment="center" className="w-full h-full">
                  {/* Mint Circle with Icon */}
                  {visibility.icon && (
                      <div className="w-20 h-20 bg-brand-mint rounded-full flex items-center justify-center mb-6 flex-shrink-0 shadow-sm">
                          <i className={`${displayIcon} text-4xl text-brand-primary`}></i>
                      </div>
                  )}

                  {/* Quote */}
                  {visibility.headline && (
                      <h3 className="text-3xl font-bold text-brand-dark leading-tight mb-6">
                      "{headline}"
                      </h3>
                  )}

                  {/* Divider Line */}
                  <div className="w-12 h-1.5 bg-brand-red rounded-full mb-6 flex-shrink-0"></div>

                  {/* Author */}
                  {visibility.subtext && <p className="text-slate-500 font-bold text-sm mb-1">{subtext}</p>}
                  
                  {/* Footer / Body if needed */}
                  {visibility.body && <p className="text-slate-400 text-xs font-medium uppercase tracking-wide whitespace-pre-wrap">{body}</p>}
                  
                  {/* Rating CTA */}
                  {visibility.cta && (
                      <div className="mt-4 flex gap-1 text-brand-primary text-xs">
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                      </div>
                  )}
                </AutoScaler>
             </div>

             {/* Footer with Logo */}
             <div className="h-24 bg-brand-dark flex items-center justify-center w-full flex-shrink-0 relative">
                 {visibility.logo && <BrandLogo className="h-12 w-auto" white={true} />}
             </div>
          </div>
        );

      // 2. FEATURE POST
      case 'VENTURE_SPOTLIGHT':
        return (
          <div className="h-full w-full flex flex-col bg-brand-offwhite relative overflow-hidden">
             {/* Logo Top Left */}
             <div className="absolute top-8 left-8 z-20">
                 {visibility.logo && <BrandLogo className="w-28 h-auto" />}
             </div>

             {/* Skewed Background Shape */}
             <div className="absolute top-0 right-0 w-2/3 h-full bg-brand-primary opacity-5 transform skew-x-12 translate-x-20 pointer-events-none"></div>
             
             <div className="flex-1 p-10 flex flex-col justify-end relative z-10 pb-8 mt-20 overflow-hidden">
                <AutoScaler alignment="bottom-left" className="w-full h-full" contentClassName="items-start text-left">
                  {visibility.tagline && (
                    <span className="bg-brand-red text-white text-xs font-bold px-3 py-1 rounded w-fit mb-4 uppercase tracking-wider shadow-sm">
                      {tagline}
                    </span>
                  )}
                  {visibility.headline && (
                    <h3 className="text-5xl font-extrabold text-brand-dark leading-none mb-4 uppercase">
                      {headline}
                    </h3>
                  )}
                  {visibility.subtext && <p className="text-xl font-medium text-slate-500">{subtext}</p>}
                  
                  {visibility.body && <p className="text-sm text-slate-400 mt-4 max-w-[80%] leading-relaxed whitespace-pre-wrap">{body}</p>}
                </AutoScaler>
             </div>

             {/* Green Footer Bar */}
             <div className="h-20 bg-brand-primary w-full flex items-center justify-center flex-shrink-0 relative z-20">
                 {visibility.cta ? (
                    <span className="text-white font-bold tracking-widest text-sm uppercase flex items-center gap-2">
                        {cta} {visibility.icon && <i className={displayIcon}></i>}
                    </span>
                 ) : (
                    <span className="text-white font-bold tracking-widest text-lg">SIMPUL SOFTWARE</span>
                 )}
             </div>
          </div>
        );

      // 3. STATS / METRICS
      case 'GROWTH_METRICS':
        return (
          <div className="h-full w-full p-8 flex flex-col justify-center items-center bg-brand-offwhite relative">
             <div className="w-full max-w-[90%] bg-white p-8 rounded-xl shadow-xl border border-slate-100 relative overflow-hidden z-10 flex flex-col">
                {/* Red Badge Top Right */}
                {visibility.tagline && (
                  <div className="absolute top-0 right-0 bg-brand-red text-white text-[10px] font-bold px-4 py-2 rounded-bl-xl uppercase tracking-widest shadow-sm z-20">
                    {tagline}
                  </div>
                )}
                <AutoScaler alignment="center" className="w-full flex-1">
                  {visibility.headline && <div className="text-6xl font-bold text-brand-primary mb-2 tracking-tight">{headline}</div>}
                  {visibility.subtext && <h5 className="font-bold text-xl text-brand-dark mb-6">{subtext}</h5>}
                  
                  {visibility.body && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                       {body.split('\n').filter(line => line.trim() !== '').map((line, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                             {visibility.icon && <i className={`${displayIcon} text-brand-primary flex-shrink-0`}></i>}
                             <span>{line}</span>
                          </div>
                       ))}
                    </div>
                  )}

                  {visibility.cta && (
                    <div className="mt-8 text-center">
                        <button className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b-2 border-brand-mint pb-1 hover:text-brand-primary transition-colors">
                            {cta}
                        </button>
                    </div>
                  )}
                </AutoScaler>
             </div>
             
             {/* Branding at bottom */}
             <div className="mt-12 opacity-60">
               {visibility.logo && <BrandLogo className="w-28 h-auto text-brand-dark" />}
             </div>
          </div>
        );

      // 4. TEAM PROFILE
      case 'TEAM_CULTURE':
        return (
          <div className="h-full w-full p-6 flex flex-col bg-brand-offwhite">
             {/* Header Logo */}
             <div className="flex justify-between items-center mb-6 px-2">
                 {visibility.logo && <BrandLogo className="w-24 h-auto text-brand-primary" />}
                 {visibility.icon && (
                     <div className="w-8 h-8 bg-brand-mint rounded-full flex items-center justify-center text-brand-primary">
                        <i className={displayIcon}></i>
                     </div>
                 )}
             </div>

             <div className="flex-1 relative rounded-xl overflow-hidden shadow-lg mb-6 group bg-white border border-slate-200">
                <RenderSpreadImage src={displayImage} />
                {visibility.tagline && (
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold text-brand-primary shadow-sm">
                    {tagline}
                    </div>
                )}
             </div>
             
             <div className="px-2 pb-4 overflow-hidden h-[35%] flex-shrink-0">
               <AutoScaler alignment="bottom-left" className="w-full h-full" contentClassName="items-start text-left">
                 {visibility.headline && <div className="text-3xl font-bold text-brand-dark mb-1">{headline}</div>}
                 {visibility.subtext && <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">{subtext}</div>}
                 {visibility.body && (
                     <div className="bg-white p-4 rounded-lg border border-slate-100 italic text-slate-500 text-xs leading-relaxed whitespace-pre-wrap">
                         "{body}"
                     </div>
                 )}
                 {visibility.cta && <div className="mt-4 text-right text-[10px] font-bold text-slate-300 uppercase tracking-widest w-full">{cta}</div>}
               </AutoScaler>
             </div>
          </div>
        );

      // 5. PRICING / SALES (Conversion)
      case 'CONVERSION':
        return (
           <div className="h-full w-full p-10 flex flex-col justify-center items-center bg-brand-dark text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full diagonal-lines-white opacity-10 pointer-events-none"></div>
              
              <div className="relative z-10 w-full max-w-[90%] text-center overflow-hidden flex-1 flex flex-col justify-center">
                 <AutoScaler alignment="center" className="w-full h-full">
                   {visibility.icon && (
                       <div className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-8 text-3xl shadow-lg shadow-brand-primary/20 transform -rotate-6 border-4 border-brand-dark">
                          <i className={displayIcon}></i>
                       </div>
                   )}
                   {visibility.tagline && <div className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-4 bg-white/10 w-fit mx-auto px-3 py-1 rounded-full">{tagline}</div>}
                   {visibility.headline && <h1 className="text-5xl font-bold mb-4 leading-tight">{headline}</h1>}
                   {visibility.subtext && <div className="text-2xl font-medium text-slate-300 mb-8">{subtext}</div>}

                   {visibility.body && <div className="text-sm text-slate-400 mb-8 whitespace-pre-wrap">{body}</div>}

                   {visibility.cta && (
                      <button className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl shadow-xl hover:bg-[#4d7c3a] transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                      {cta} <i className="fa-solid fa-arrow-right"></i>
                      </button>
                   )}
                   
                   <div className="mt-12 opacity-30">
                      {visibility.logo && <BrandLogo className="w-20 h-auto mx-auto" white={true} />}
                   </div>
                 </AutoScaler>
              </div>
           </div>
        );

      // 6. PHOTO OVERLAY
      case 'VISUAL_STORY':
        return (
          <div className="h-full w-full relative group bg-black">
            <RenderSpreadImage src={displayImage} className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
            
            {/* Logo Overlay */}
            <div className="absolute top-8 left-0 right-0 flex justify-center z-20">
                {visibility.logo && <BrandLogo className="w-24 h-auto drop-shadow-lg" white={true} />}
            </div>

            {visibility.box && (
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
                 <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl max-w-[95%] border-l-4 border-brand-primary pointer-events-auto overflow-hidden max-h-full flex flex-col">
                    <AutoScaler alignment="bottom-left" className="w-full h-full" contentClassName="items-start text-left">
                      {visibility.tagline && <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{tagline}</div>}
                      {visibility.headline && <h3 className="text-3xl font-bold text-brand-dark mb-2 uppercase leading-none">{headline}</h3>}
                      {visibility.subtext && <p className="text-sm text-slate-600 mb-0 font-medium">{subtext}</p>}
                      {visibility.body && <p className="text-xs text-slate-500 mt-2 whitespace-pre-wrap">{body}</p>}
                      
                      {(visibility.cta) && (
                          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center w-full">
                            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">{cta}</span>
                            {visibility.icon && <i className={`${displayIcon} text-brand-primary text-sm`}></i>}
                          </div>
                      )}
                    </AutoScaler>
                 </div>
              </div>
            )}
          </div>
        );

      // 7. COLLAGE
      case 'PHOTO_COLLAGE':
        return (
          <div className="h-full w-full p-4 bg-brand-offwhite flex flex-col">
            <div className="flex justify-between items-center mb-4 px-2 flex-shrink-0">
                {visibility.logo && <BrandLogo className="w-24 h-auto text-brand-dark" />}
                {visibility.tagline && <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{tagline}</span>}
            </div>

            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 min-h-0">
                <div className="row-span-2 relative rounded-xl overflow-hidden shadow-sm border border-slate-200 group bg-slate-100">
                    <RenderSpreadImage src={displayImage} className="!object-cover" />
                </div>
                <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
                    <img 
                      src={displaySecondary} 
                      crossOrigin="anonymous" 
                      alt="Secondary" 
                      className={`w-full h-full object-cover ${applyEffect ? 'img-bright' : ''}`} 
                    />
                </div>
                <div className="relative rounded-xl overflow-hidden bg-brand-primary flex flex-col items-center justify-center p-2 text-center text-white shadow-sm tech-grid-pattern">
                    <div className="relative z-10 w-full h-full overflow-hidden">
                        <AutoScaler alignment="center" className="w-full h-full">
                          {visibility.headline && <div className="text-sm font-bold uppercase leading-snug mb-1">{headline}</div>}
                          {visibility.subtext && <div className="text-[10px] opacity-80">{subtext}</div>}
                          {visibility.body && <div className="text-[8px] opacity-60 mt-1 whitespace-pre-wrap">{body}</div>}
                        </AutoScaler>
                    </div>
                </div>
            </div>
            
            {visibility.cta && (
                <div className="mt-4 text-center flex-shrink-0">
                    <span className="inline-block px-4 py-2 bg-white rounded-full text-[10px] font-bold text-brand-dark shadow-sm border border-slate-200 uppercase tracking-widest">{cta}</span>
                </div>
            )}
          </div>
        );

      // 8. DID YOU KNOW
      case 'KNOWLEDGE_SHARE':
        return (
           <div className="h-full w-full p-8 flex flex-col justify-center items-center text-center relative bg-brand-dark text-white overflow-hidden">
              {/* Giant Background Icon */}
              {visibility.icon && <i className={`${displayIcon} text-[180px] text-brand-primary opacity-5 absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 rotate-12`}></i>}
              
              <div className="relative z-10 w-full flex flex-col items-center h-full justify-center overflow-hidden">
                 <AutoScaler alignment="center" className="w-full h-full">
                   {/* Logo Overlay */}
                   <div className="mb-8 opacity-50">
                      {visibility.logo && <BrandLogo className="w-20 h-auto" white={true} />}
                   </div>

                   {visibility.tagline && <h3 className="text-xl font-bold text-brand-primary mb-6 uppercase tracking-widest border-b border-brand-primary/30 pb-2">{tagline}</h3>}
                   
                   {visibility.headline && (
                     <div className="text-2xl font-medium leading-relaxed mb-6">
                       {headline} <span className="block mt-2 text-brand-primary font-bold text-4xl">{subtext}</span>
                     </div>
                   )}

                   {visibility.body && body && (
                     <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md text-sm text-slate-300 font-light mb-8 leading-relaxed max-w-xs whitespace-pre-wrap mx-auto">
                        {body}
                     </div>
                   )}

                   {visibility.cta && (
                      <button className="bg-brand-primary text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-[#4d7c3a] transition-colors">
                         {cta}
                      </button>
                   )}
                 </AutoScaler>
              </div>
           </div>
        );

      // 9. TIMELINE
      case 'PROCESS_TIMELINE':
        return (
          <div className="h-full w-full flex flex-col bg-brand-offwhite">
             {/* Header Image */}
             <div className="h-[40%] relative group">
               <RenderSpreadImage src={displayImage} />
               {/* Simpul Branding Box */}
               <div className="absolute top-6 left-6 bg-white p-3 rounded-xl shadow-lg">
                   {visibility.logo && <BrandLogo className="w-20 h-auto text-brand-dark" />}
               </div>
             </div>
             
             <div className="flex-1 p-8 flex flex-col overflow-hidden">
                <AutoScaler alignment="top-left" className="w-full flex-1" contentClassName="items-start text-left pb-4">
                  {visibility.tagline && <div className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-3">{tagline}</div>}
                  {visibility.headline && <h2 className="text-3xl font-bold text-brand-dark mb-8 leading-tight">{headline}</h2>}
                  
                  <div className="w-full">
                     {visibility.body && body.split('\n').filter(l => l.trim()).map((step, i, arr) => (
                       <div key={i} className="flex gap-5 relative pb-8 last:pb-2">
                          {/* Vertical Line */}
                          {i < arr.length - 1 && <div className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-slate-200"></div>}
                          
                          <div className="flex-shrink-0 z-10">
                             <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-bold shadow-md ring-4 ring-brand-offwhite">{i+1}</div>
                          </div>
                          <div className="pt-0.5">
                             <p className="text-sm text-slate-600 font-medium leading-relaxed">{step.replace(/^\d+[\.\)]\s*/, '')}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                </AutoScaler>
                
                {visibility.cta && (
                    <div className="mt-4 pt-4 border-t border-slate-200 text-center w-full flex-shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-primary cursor-pointer transition-colors">{cta}</span>
                    </div>
                )}
             </div>
          </div>
        );
        
      // 10. COMPARISON (NEW)
      case 'COMPARISON':
        const isTall = format === 'PORTRAIT' || format === 'STORY';
        const isLandscape = format === 'LANDSCAPE';
        const isStory = format === 'STORY';
        
        // Dynamic styling based on format
        const headerClass = isLandscape ? 'h-10 px-4' : (isStory ? 'h-14 px-4' : 'h-16 px-6');
        const footerClass = isLandscape ? 'h-14' : (isStory ? 'h-16' : 'h-20');
        const contentPadding = isLandscape ? 'p-2' : (isStory ? 'p-3' : 'p-6');
        const iconSize = isLandscape ? 'w-8 h-8 text-sm mb-2' : (isStory ? 'w-10 h-10 text-base mb-3' : 'w-12 h-12 text-xl mb-4');
        const listTextSize = isLandscape || isStory ? 'text-[10px]' : 'text-xs';
        
        return (
            <div className="h-full w-full flex flex-col bg-white">
                {/* Header */}
                <div className={`${headerClass} flex items-center justify-between bg-white z-20 border-b border-slate-100 flex-shrink-0`}>
                     {visibility.logo && <BrandLogo className={`${isLandscape || isStory ? 'w-16' : 'w-20'} h-auto text-brand-dark`} />}
                     {visibility.tagline && <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest bg-slate-100 px-2 py-1 rounded">{tagline}</span>}
                </div>
                
                {/* Split View */}
                <div className={`flex-1 flex ${isTall ? 'flex-col' : 'flex-row'} min-h-0 relative`}>
                    
                    {/* Negative Side */}
                    <div className="flex-1 relative bg-slate-100 border-r border-slate-200 overflow-hidden group">
                        <RenderSpreadImage src={displayImage} className="!object-cover grayscale opacity-80" />
                        <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply"></div>
                        
                        <div className={`absolute inset-0 ${contentPadding} flex flex-col items-center justify-center text-center overflow-hidden`}>
                            <AutoScaler alignment="center" className="w-full h-full">
                              {visibility.icon && (
                                  <div className={`${iconSize} rounded-full bg-brand-red text-white flex items-center justify-center shadow-lg mx-auto`}>
                                      <i className="fa-solid fa-xmark"></i>
                                  </div>
                              )}
                              <div className="bg-black/30 backdrop-blur-sm p-3 rounded-xl border border-white/10 w-full max-w-[90%] mx-auto">
                                  {visibility.subtext && subtext.split('\n').filter(l => l.trim()).map((line, i) => (
                                      <div key={i} className={`text-white font-medium ${listTextSize} mb-1 last:mb-0 flex items-center justify-center gap-2`}>
                                          <span className="opacity-70">•</span> {line}
                                      </div>
                                  ))}
                              </div>
                            </AutoScaler>
                        </div>
                    </div>

                    {/* Positive Side */}
                    <div className="flex-1 relative bg-brand-offwhite overflow-hidden group">
                        <img src={displaySecondary} crossOrigin="anonymous" alt="Positive" className={`w-full h-full object-cover ${applyEffect ? 'img-bright' : ''}`} />
                         <div className="absolute inset-0 bg-brand-primary/10 mix-blend-multiply"></div>

                        <div className={`absolute inset-0 ${contentPadding} flex flex-col items-center justify-center text-center overflow-hidden`}>
                            <AutoScaler alignment="center" className="w-full h-full">
                              {visibility.icon && (
                                  <div className={`${iconSize} rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg mx-auto`}>
                                      <i className={displayIcon}></i>
                                  </div>
                              )}
                              <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-white/50 w-full max-w-[90%] shadow-lg mx-auto">
                                  {visibility.body && body.split('\n').filter(l => l.trim()).map((line, i) => (
                                      <div key={i} className={`text-brand-dark font-bold ${listTextSize} mb-1 last:mb-0 flex items-center justify-center gap-2`}>
                                          {visibility.icon && <i className={`${displayIcon} text-[8px] text-brand-primary`}></i>} {line}
                                      </div>
                                  ))}
                              </div>
                            </AutoScaler>
                        </div>
                    </div>

                    {/* VS Badge - Positioned relative to the split container */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                        <div className={`${isLandscape || isStory ? 'w-8 h-8 text-[8px]' : 'w-10 h-10 text-[10px]'} bg-white rounded-full flex items-center justify-center font-black text-brand-dark shadow-xl border-4 border-slate-100`}>
                            VS
                        </div>
                    </div>

                </div>
                
                {/* Footer Strip */}
                <div className={`${footerClass} bg-brand-dark text-white flex flex-col items-center justify-center relative z-20 flex-shrink-0`}>
                    {visibility.headline && <div className={`${isLandscape || isStory ? 'text-xs' : 'text-sm'} font-bold uppercase tracking-wider mb-1`}>{headline}</div>}
                    {visibility.cta && <div className="text-[10px] text-brand-primary font-bold uppercase tracking-widest border-b border-brand-primary pb-0.5">{cta}</div>}
                </div>
            </div>
        );

      default:
        return <div className="p-10 text-center">Select a layout</div>;
    }
  };

  return (
    <div ref={ref} className={containerClass}>
      {renderContent()}
    </div>
  );
});

export default Artboard;