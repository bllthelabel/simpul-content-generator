import React, { useRef, useEffect, useState } from 'react';

interface AutoScalerProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  alignment?: 'top' | 'top-left' | 'center' | 'bottom' | 'left' | 'bottom-left';
}

export const AutoScaler: React.FC<AutoScalerProps> = ({ children, className = '', contentClassName = '', alignment = 'center' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const checkFit = () => {
      if (!containerRef.current || !contentRef.current) return;
      
      const containerHeight = containerRef.current.clientHeight;
      const containerWidth = containerRef.current.clientWidth;
      
      // Temporarily remove scale to get true scrollHeight/scrollWidth
      const currentTransform = contentRef.current.style.transform;
      contentRef.current.style.transform = 'none';
      
      const contentHeight = contentRef.current.scrollHeight;
      const contentWidth = contentRef.current.scrollWidth;
      
      contentRef.current.style.transform = currentTransform;
      
      let newScale = 1;
      
      if (contentHeight > containerHeight && containerHeight > 0) {
        newScale = containerHeight / contentHeight;
      }
      
      if (contentWidth > containerWidth && containerWidth > 0) {
        const widthScale = containerWidth / contentWidth;
        newScale = Math.min(newScale, widthScale);
      }
      
      // Add a tiny bit of padding to the scale to prevent exact edge touching
      if (newScale < 1) {
        newScale = newScale * 0.98;
      }
      
      setScale(newScale);
    };

    checkFit();
    
    const resizeObserver = new ResizeObserver(checkFit);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (contentRef.current) resizeObserver.observe(contentRef.current);
    
    return () => resizeObserver.disconnect();
  }, [children]);

  let origin = 'origin-center';
  let justify = 'justify-center';
  let items = 'items-center';

  if (alignment === 'top') {
    origin = 'origin-top';
    justify = 'justify-start';
  } else if (alignment === 'top-left') {
    origin = 'origin-top-left';
    justify = 'justify-start';
    items = 'items-start';
  } else if (alignment === 'bottom') {
    origin = 'origin-bottom';
    justify = 'justify-end';
  } else if (alignment === 'left') {
    origin = 'origin-left';
    justify = 'justify-center';
    items = 'items-start';
  } else if (alignment === 'bottom-left') {
    origin = 'origin-bottom-left';
    justify = 'justify-end';
    items = 'items-start';
  }

  return (
    <div ref={containerRef} className={`w-full h-full overflow-hidden flex flex-col ${justify} ${items} ${className}`}>
      <div 
        ref={contentRef} 
        className={`w-full flex flex-col ${items} transform ${origin} transition-transform duration-200 ${contentClassName}`}
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
};
