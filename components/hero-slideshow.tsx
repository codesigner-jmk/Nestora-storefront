"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1500&q=90",
    alt: "Warm, sunlit living room with a sculptural sofa and natural materials",
    caption: "A place to settle in",
    room: "01 — Living",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1500&q=90",
    alt: "Quiet contemporary living space with natural textures and warm light",
    caption: "Room for the everyday",
    room: "02 — Gather",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1500&q=90",
    alt: "Thoughtfully furnished home with soft neutral tones and natural light",
    caption: "Made to feel like home",
    room: "03 — Unwind",
  },
];

export function HeroSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActiveIndex((index) => (index + 1) % slides.length);
      }
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);

  const previousSlide = () => setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
  const nextSlide = () => setActiveIndex((index) => (index + 1) % slides.length);

  return <>
    <div className="hero-image">
      <div className="hero-slides" role="group" aria-label="Featured interiors">
        {slides.map((slide, index) => <Image
          key={slide.src}
          src={slide.src}
          alt={index === activeIndex ? slide.alt : ""}
          aria-hidden={index !== activeIndex}
          className={`hero-slide-image${index === activeIndex ? " is-active" : ""}`}
          fill
          priority={index === 0}
          sizes="(max-width: 760px) 100vw, 56vw"
        />)}
      </div>
      <div className="hero-slide-controls" role="group" aria-label="Slideshow controls">
        <button type="button" onClick={previousSlide} aria-label="Previous image" title="Previous image">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
        </button>
        <span className="hero-slide-count" aria-label={`Image ${activeIndex + 1} of ${slides.length}`}>{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
        <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play slideshow" : "Pause slideshow"} title={paused ? "Play slideshow" : "Pause slideshow"} aria-pressed={paused}>
          {paused
            ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z" /></svg>
            : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>}
        </button>
        <button type="button" onClick={nextSlide} aria-label="Next image" title="Next image">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
        </button>
      </div>
    </div>
    <div className="hero-image-caption" aria-live="polite">
      <span>{activeSlide.caption}</span><span>{activeSlide.room}</span>
    </div>
  </>;
}
