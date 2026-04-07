"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

interface FlipbookProps {
  children: React.ReactNode[];
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Flipbook({
  children,
  currentPage,
  onPageChange,
  className = "",
}: FlipbookProps) {
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const totalPages = children.length;

  const goToPage = useCallback(
    (page: number) => {
      if (page < 0 || page >= totalPages) return;
      setDirection(page > currentPage ? 1 : -1);
      onPageChange(page);
    },
    [currentPage, totalPages, onPageChange]
  );

  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);

  // GSAP page entrance animation
  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current,
        {
          rotateY: direction > 0 ? -15 : 15,
          scale: 0.95,
          opacity: 0.5,
        },
        {
          rotateY: 0,
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
        }
      );
    }
  }, [currentPage, direction]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextPage();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prevPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPage, prevPage]);

  const pageVariants = {
    enter: (dir: number) => ({
      rotateY: dir > 0 ? 90 : -90,
      opacity: 0,
      scale: 0.9,
      x: dir > 0 ? 100 : -100,
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      x: 0,
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -90 : 90,
      opacity: 0,
      scale: 0.9,
      x: dir > 0 ? -100 : 100,
    }),
  };

  return (
    <div
      ref={containerRef}
      className={`flipbook-container relative w-full max-w-4xl mx-auto ${className}`}
      style={{ perspective: "2000px" }}
    >
      {/* Page counter */}
      <div className="absolute top-4 right-4 z-20 text-xs text-stone-400 font-light tracking-widest uppercase">
        {currentPage + 1} / {totalPages}
      </div>

      {/* Page content with flip animation */}
      <div className="relative min-h-[600px] md:min-h-[700px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            ref={pageRef}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 30,
              mass: 0.8,
            }}
            className="flipbook-page absolute inset-0 bg-white rounded-sm shadow-2xl shadow-stone-200/50 overflow-hidden"
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            {/* Page edge effect */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-r from-stone-200 to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-stone-100" />

            {/* Page content */}
            <div className="relative h-full overflow-y-auto p-8 md:p-12">
              {children[currentPage]}
            </div>

            {/* Page fold shadow */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/[0.02] to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 px-2">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Previous
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i === currentPage
                  ? "bg-stone-900 w-6"
                  : i < currentPage
                  ? "bg-stone-400"
                  : "bg-stone-200"
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
        >
          Next
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
