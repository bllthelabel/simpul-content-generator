import React, { useRef, useEffect, useState, ReactNode } from 'react';

interface FitContentProps {
  children: ReactNode;
  className?: string;
  transformOrigin?: string;
  verticalAlign?: 'top' | 'center' | 'bottom';
  horizontalAlign?: 'left' | 'center' | 'right';
}

export default function FitContent({ 
  children, 
  className = '', 
  transformOrigin = 'center center',
  verticalAlign = 'center',
  horizontalAlign = 'center'
}: FitContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const checkFit = () => {
      if (!containerRef.current || !contentRef.current) return;
      
      const containerHeight = containerRef.current.clientHeight;
      const containerWidth = containerRef.current.clientWidth;
      
      // Temporarily remove scale to get true dimensions
      contentRef.current.style.transform = 'none';
      
      const contentHeight = contentRef.current.scrollHeight;
      const contentWidth = contentRef.current.scrollWidth;
      
      let newScale = 1;
      
      if (contentHeight > containerHeight || contentWidth > containerWidth) {
        const heightScale = containerHeight > 0 ? containerHeight / contentHeight : 1;
        const widthScale = containerWidth > 0 ? containerWidth / contentWidth : 1;
        newScale = Math.min(heightScale, widthScale) * 0.98; // 2% buffer
      }
      
      setScale(newScale);
      contentRef.current.style.transform = `scale(${newScale})`;
    };

    // Initial check
    const timeoutId = setTimeout(checkFit, 10);

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(checkFit);
    });

    if (containerRef.current) observer.observe(containerRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [children]);

  const getAlignItems = () => {
    switch (horizontalAlign) {
      case 'left': return 'flex-start';
      case 'right': return 'flex-end';
      default: return 'center';
    }
  };

  const getJustifyContent = () => {
    switch (verticalAlign) {
      case 'top': return 'flex-start';
      case 'bottom': return 'flex-end';
      default: return 'center';
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full flex overflow-hidden ${className}`}
      style={{
        alignItems: getAlignItems(),
        justifyContent: getJustifyContent()
      }}
    >
      <div 
        ref={contentRef} 
        style={{ 
          transformOrigin,
          width: '100%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: getAlignItems(),
          justifyContent: getJustifyContent()
        }}
      >
        {children}
      </div>
    </div>
  );
}
