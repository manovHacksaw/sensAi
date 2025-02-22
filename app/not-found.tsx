"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

export default function MainNotFoundPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      containerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1 }
    )
      .fromTo(
        headingRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.6"
      )
      .fromTo(
        paragraphRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.4"
      )
      .fromTo(
        buttonRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.3"
      );

    // Floating effect
    gsap.to(containerRef.current, {
      y: 10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-200 font-sans"
      ref={containerRef}
    >
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-lg w-full transform transition-all duration-500 hover:shadow-2xl">
        <h1
          className="text-5xl font-extrabold text-gray-800 mb-6 drop-shadow-md"
          ref={headingRef}
        >
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 text-lg mb-8" ref={paragraphRef}>
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            ref={buttonRef}
          >
            Go Back Home
          </button>
        </Link>
      </div>
    </div>
  );
}
