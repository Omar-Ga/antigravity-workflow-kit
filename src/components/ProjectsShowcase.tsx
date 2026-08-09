"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { useLenis } from 'lenis/react';
import styles from "./ProjectsShowcase.module.css";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip);
}

const SERVICES = [
  {
    id: "s1",
    title: "Ultra-Premium Web Design & Apps",
    role: "Service Pillar 01 — Creative Technologist",
    description: "Bespoke digital flagships and interactive web applications crafted to give your brand an unmistakable competitive edge. Combining agency-level visual design with high-performance engineering.",
    items: [
      {
        title: "Ultra-Premium Web Design & Apps",
        role: "Service Pillar 01 — Creative Technologist",
        description: "Bespoke digital flagships and interactive web applications crafted to give your brand an unmistakable competitive edge. Combining agency-level visual design with high-performance engineering."
      },
      {
        title: "Fluid Motion & Agency Choreography",
        role: "Visual Impact — Dynamic Motion",
        description: "Static sites don't capture attention anymore. We craft fluid GSAP animation and scroll choreography that guide your visitors through your story and make your brand feel modern, dynamic, and alive."
      },
      {
        title: "High-Performance Engineering",
        role: "Web Architecture — Speed & Scale",
        description: "Beauty means nothing if your site is slow. Built on Next.js and modern WebGL frameworks to guarantee instant page loads, smooth 60fps interactions, and flawless mobile experiences."
      },
      {
        title: "Bespoke Design Systems",
        role: "Brand Identity — Scalable UI Design",
        description: "We design tailor-made visual languages with custom color palettes, luxury typography, and component libraries that ensure consistent elegance across every screen of your web application."
      },
      {
        title: "Conversion-Driven Experience",
        role: "UX Strategy — High Conversion",
        description: "Every pixel is engineered with purpose. We design intuitive user flows and frictionless interfaces that turn casual web visitors into loyal clients and high-value leads."
      }
    ],
    images: [
      "/images/o2mation/o2mation_1.webp",
      "/images/o2mation/o2mation_2.webp",
      "/images/o2mation/o2mation_3.webp",
      "/images/o2mation/o2mation_4.webp",
      "/images/o2mation/o2mation_5.webp"
    ]
  },
  {
    id: "s2",
    title: "Full Systems & Enterprise Programs",
    role: "Service Pillar 02 — Systems Architect",
    description: "Custom-engineered software platforms designed to run your entire enterprise operation. From custom offline-first desktop tools to centralized web suites, we build robust software tailored specifically to your business workflows.",
    items: [
      {
        title: "Full Systems & Enterprise Programs",
        role: "Service Pillar 02 — Systems Architect",
        description: "Custom-engineered software platforms designed to run your entire enterprise operation. From custom offline-first desktop tools to centralized web suites, we build robust software tailored specifically to your business workflows."
      },
      {
        title: "Universal Multi-Language Adaptability",
        role: "Global Readiness — Multi-Lingual Architecture",
        description: "Your software should serve your audience anywhere in the world. As an example, our systems can be built in any language—supporting seamless right-to-left and left-to-right localization across Arabic, English, Japanese, and beyond, so your team and clients feel right at home."
      },
      {
        title: "Interconnected Multi-Program Ecosystems",
        role: "System Automation — Unified Data Streams",
        description: "Stop forcing your staff to manually type data between separate applications. We architect interconnected system workflows where your sales, inventory, warehouse, and accounting programs talk to each other in real-time without friction."
      },
      {
        title: "Granular Security & Role Management",
        role: "Enterprise Governance — Access & Compliance",
        description: "Protect your business with enterprise-grade access controls. We design flexible role-based permission tiers so every employee—from store cashiers and managers to corporate auditors—sees exactly what they need, backed by encrypted action logs."
      },
      {
        title: "Direct Hardware & Peripheral Integration",
        role: "Physical World Sync — Device Telemetry",
        description: "Software shouldn’t stop at the screen. We integrate your custom applications directly with real-world hardware—whether that’s handheld barcode scanners, thermal receipt printers, payment terminals, or industrial floor sensors."
      }
    ],
    images: [
      "/images/services/systems/systems_1.webp",
      "/images/services/systems/systems_2.webp",
      "/images/services/systems/systems_3.webp",
      "/images/services/systems/systems_4.webp",
      "/images/services/systems/systems_5.webp"
    ]
  },
  {
    id: "s3",
    title: "AI Platforms & Custom Chatbots",
    role: "Service Pillar 03 — AI & Full-Stack Engineer",
    description: "Supercharge your business operations with custom artificial intelligence. From internal knowledge assistants to automated operational agents, we build AI solutions tailored to your organization.",
    items: [
      {
        title: "Real-Time Voice AI & Telephony Integration",
        role: "Service Pillar 03 — AI & Full-Stack Engineer",
        description: "Bring voice intelligence to any phone line or web app. We engineer ultra-low-latency voice assistants—supporting real-time WebRTC audio streaming for web apps and SIP trunking for automated 24/7 phone receptionists."
      },
      {
        title: "AI-Powered Workflows & Node Orchestration",
        role: "Process Automation — Intelligent Multi-Step Pipelines",
        description: "AI shouldn’t be isolated in a text prompt box. As an example, we build automated node-based process engines where AI evaluates incoming files, runs multi-step decision logic, requests approvals, and syncs databases automatically."
      },
      {
        title: "Dual Customer & Staff Knowledge Engine",
        role: "Data Intelligence — Public Help & Private Vault",
        description: "Empower both your clients and internal team with instant AI assistance. We build dual-portal knowledge engines—giving customers 24/7 self-service help from public manuals while keeping private SOPs and contracts secure for staff."
      },
      {
        title: "Automated Document Parser & Data Extraction",
        role: "Intelligent OCR — Unstructured PDF to DB Sync",
        description: "Eliminate manual data entry forever. As an example, our AI parsers scan vendor invoices, legal contracts, and complex PDF forms—extracting clean structured fields directly into your database in seconds."
      },
      {
        title: "Enterprise Conversational AI & Chatbots",
        role: "AI Operations — Custom Chat Assistants",
        description: "Supercharge your customer engagement and staff workflows with custom artificial intelligence. From private conversational chat assistants to automated support bots, we build AI tools tailored to your business."
      }
    ],
    images: [
      "/images/services/ai/ai_1.webp",
      "/images/services/ai/ai_2.webp",
      "/images/services/ai/ai_3.webp",
      "/images/services/ai/ai_4.webp",
      "/images/services/ai/ai_5.webp"
    ]
  }
];

const ServicePanel = React.memo(({ service }: { service: typeof SERVICES[0] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  const handleSwap = (idx: number) => {
    if (idx === activeIndex) return;
    
    // 1. Record the state of all images in this specific service
    flipStateRef.current = Flip.getState(`.img-target-${service.id}`);
    
    // Trigger re-render which will swap the CSS classes
    setActiveIndex(idx);
  };

  useGSAP(() => {
    // 1. Image FLIP animation
    if (flipStateRef.current) {
      Flip.from(flipStateRef.current, {
        duration: 0.7,
        ease: "power3.inOut",
        absolute: true,
        nested: true
      });
      flipStateRef.current = null;
    }

    // 2. GSAP Text Transition Animation
    if (textRef.current) {
      gsap.fromTo(
        textRef.current.children,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out"
        }
      );
    }
  }, { scope: containerRef, dependencies: [activeIndex] });

  const getPosClass = (idx: number) => {
    if (idx === activeIndex) return styles.posMain;
    let rel = idx;
    if (idx > activeIndex) rel -= 1;
    return styles[`pos${rel}` as keyof typeof styles];
  };

  const displayImages = service.images && service.images.length > 0 
    ? service.images 
    : ["", "", "", "", ""];

  const currentText = service.items && service.items[activeIndex] 
    ? service.items[activeIndex] 
    : { title: service.title, role: service.role, description: service.description };

  return (
    <div className={styles.projectPanel} ref={containerRef}>
      <div className={styles.imageLayout}>
        {displayImages.map((url, i) => (
          <div 
            key={i}
            className={`${styles.imageSlot} img-target-${service.id} ${getPosClass(i)}`}
            onClick={() => handleSwap(i)}
            data-flip-id={`img-${service.id}-${i}`}
          >
            {url ? (
              <picture style={{ width: '100%', height: '100%', display: 'block' }}>
                <source media="(max-width: 768px)" srcSet={url.replace(/\.webp$/, "_mobile.webp")} />
                <img 
                  src={url}
                  className={styles.projectImage}
                  alt={`Service feature screenshot ${i}`}
                  decoding="async"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </picture>
            ) : (
              <div className={styles.placeholderCard}>
                <span className={styles.placeholderLabel}>Frame {i + 1}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={styles.textSection} ref={textRef}>
         <h2 className={styles.projectTitle}>{currentText.title}</h2>
         <p className={styles.projectRole}>{currentText.role}</p>
         <p className={styles.projectDescription}>{currentText.description}</p>
      </div>
    </div>
  );
});

ServicePanel.displayName = "ServicePanel";

export default function ProjectsShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const leftHalfRef = useRef<HTMLDivElement>(null);
  const rightHalfRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(() => {
    const track = trackRef.current;
    if (!track || !leftHalfRef.current || !rightHalfRef.current) return;

    const mm = gsap.matchMedia();

    // Desktop: Horizontal Pinning & Track Scroll
    mm.add("(min-width: 769px)", () => {
      const getInitialHoldDist = () => window.innerHeight * 0.20;
      const getHorizontalDist = () => track.scrollWidth - window.innerWidth;
      const getVerticalDist = () => window.innerHeight * 1.5;
      const getHoldDist = () => window.innerHeight * 0.4;

      gsap.set(leftHalfRef.current, { xPercent: -100, yPercent: 0 });
      gsap.set(rightHalfRef.current, { xPercent: 100, yPercent: 0 });
      
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "showcase-st",
          trigger: sectionRef.current,
          pin: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
          refreshPriority: 10,
          end: () => "+=" + (getInitialHoldDist() + getHorizontalDist() + getVerticalDist() + getHoldDist())
        }
      });

      tl.to({}, { duration: () => getInitialHoldDist() });

      tl.to(track, {
        x: () => -getHorizontalDist(),
        ease: "none",
        duration: () => getHorizontalDist()
      });

      tl.addLabel("aboutPanel");

      tl.to(leftHalfRef.current, { 
        xPercent: 0, 
        ease: "none", 
        duration: () => getVerticalDist() 
      }, "aboutPanel")
      .to(rightHalfRef.current, { 
        xPercent: 0, 
        ease: "none", 
        duration: () => getVerticalDist() 
      }, "aboutPanel");

      tl.to({}, { duration: () => getHoldDist() });
    });

    // Mobile: Vertical Scroll with Pinned Window Reveal on About Teaser (Top & Bottom Doors)
    mm.add("(max-width: 768px)", () => {
      gsap.set(leftHalfRef.current, { xPercent: 0, yPercent: -100, force3D: true });
      gsap.set(rightHalfRef.current, { xPercent: 0, yPercent: 100, force3D: true });

      const teaserEl = sectionRef.current?.querySelector(`.${styles.aboutTeaserPanel}`);
      if (teaserEl) {
        const mobileTl = gsap.timeline({
          scrollTrigger: {
            id: "showcase-st",
            trigger: teaserEl,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            start: "top top",
            end: "+=150%",
            scrub: 1,
            invalidateOnRefresh: true,
            refreshPriority: 10
          }
        });

        mobileTl.addLabel("aboutPanel");

        mobileTl.to(leftHalfRef.current, { yPercent: 0, ease: "none", duration: 1 }, "aboutPanel")
                .to(rightHalfRef.current, { yPercent: 0, ease: "none", duration: 1 }, "aboutPanel")
                .to({}, { duration: 0.4 });
      }
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section className={styles.showcaseWrapper} ref={sectionRef} id="services">
      <div className={styles.horizontalTrack} ref={trackRef}>
        {SERVICES.map(s => (
          <ServicePanel key={s.id} service={s} />
        ))}
        {/* The Horizontal Finale */}
        <div className={styles.aboutTeaserPanel}>
          <h2 className={styles.teaserTitle}>THE MIND<br/>BEHIND THE<br/>WORK.</h2>
          <p className={styles.teaserSubtitle}>SOLO FULL STACK ARCHITECT</p>
          
          {/* The Window Split Animation (Overlay) */}
          <div className={styles.windowContainer}>
            {/* Left Pillar */}
            <div className={`${styles.windowHalf} ${styles.leftHalf}`} ref={leftHalfRef}>
              <picture style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                <source media="(max-width: 768px)" srcSet="/images/split/tech_direction_mobile.webp" />
                <img 
                  src="/images/split/tech_direction.webp" 
                  alt="Technical Direction" 
                  className={styles.founderImage} 
                />
              </picture>
              <div className={styles.overlay}></div>
              <div className={styles.founderInfo}>
                <p className={styles.founderRole}>The Systems</p>
                <h3 className={styles.founderName} style={{ fontSize: "clamp(2rem, 3.5vw, 4rem)" }}>FULL STACK<br/>ARCHITECTURE</h3>
              </div>
            </div>

            {/* Right Pillar */}
            <div className={`${styles.windowHalf} ${styles.rightHalf}`} ref={rightHalfRef}>
              <picture style={{ width: '100%', height: '100%', display: 'block', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                <source media="(max-width: 768px)" srcSet="/images/split/client_strategy_mobile.webp" />
                <img 
                  src="/images/split/client_strategy.webp" 
                  alt="Strategy & Operations" 
                  className={styles.founderImage} 
                />
              </picture>
              <div className={styles.overlay}></div>
              <div className={styles.founderInfo}>
                <p className={styles.founderRole}>The Craft</p>
                <h3 className={styles.founderName} style={{ fontSize: "clamp(2rem, 3.5vw, 4rem)" }}>CREATIVE<br/>DIRECTION</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
