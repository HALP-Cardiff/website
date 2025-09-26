// src/pages/HALP.tsx
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Github, Mail, ExternalLink, Images } from "lucide-react";
import HALPLogo from "../assets/halp-logo.svg";

// --- Brand palette aligned with the HALP logo look ---
const BRAND = {
  red: "#ff3a3a",
  ink: "#2c2c2c",
  sand: "#f5efe6",
};

// helpers
const sizeFor = (w: 1 | 2 | 3 | 4) =>
  ({ 1: "text-base md:text-lg", 2: "text-lg md:text-2xl", 3: "text-2xl md:text-4xl", 4: "text-3xl md:text-6xl" }[w]);
const weightFor = (w: 1 | 2 | 3 | 4) =>
  ({ 1: "font-normal", 2: "font-semibold", 3: "font-bold", 4: "font-extrabold" }[w]);

function collide(a: Rect, bs: Rect[]) {
  return bs.some((b) => !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y));
}

const HaloDivider: React.FC = () => (
  <div className="w-full flex items-center gap-2 my-6">
  </div>
);

// --- Content data ---
const WORDS: { text: string; weight: 1 | 2 | 3 | 4 }[] = [
  { text: "Cardiff University", weight: 4 },
  { text: "Atradius employees", weight: 3 },
  { text: "Computer Science students", weight: 3 },
  { text: "Innovator", weight: 2 },
  { text: "Geo guessr master", weight: 2 },
  { text: "Poet", weight: 2 },
  { text: "Worst Gamer", weight: 1 },
  { text: "Frisbeeer", weight: 2 },
];

const CLOUD_HEIGHT = 420; // tweak for density
type Pt = { left: number; top: number; rotate: number };
type Rect = { x: number; y: number; w: number; h: number };


type Project = { name: string; logo: string; desc: string; href: string };
const PROJECTS: Project[] = [
  {
    name: "Cambio Card Game",
    logo: "https://placehold.co/96x96/ff3a3a/ffffff?text=A1",
    desc: "Play Cambio online!!",
    href: "https://github.com/HALP-Cardiff/Cambio-card-game",
  },
  {
    name: "Legacy SQL Helper",
    logo: "https://placehold.co/96x96/ff3a3a/ffffff?text=SQL",
    desc: "AI-assisted query generator for gnarly legacy schemas.",
    href: "https://github.com/halp/example-2",
  },
  {
    name: "GeoGuessr Toolkit",
    logo: "https://placehold.co/96x96/ff3a3a/ffffff?text=GG",
    desc: "Map snippets, streak tracker, and challenge sharer.",
    href: "https://github.com/halp/example-3",
  },
  {
    name: "Poem Studio",
    logo: "https://placehold.co/96x96/ff3a3a/ffffff?text=%E8%A9%A9",
    desc: "Bilingual poetry editor with meter & imagery helpers.",
    href: "https://github.com/halp/example-4",
  },
];

const galleryModules = import.meta.glob("../assets/photos/*.{jpg,jpeg,png,webp}", {
  eager: true,
});

const GALLERY: string[] = Object.values(galleryModules).map(
  (m: any) => (m as { default: string }).default
);


// --- Sections ---
const Banner: React.FC = () => (
  <section
    id="home"
    className="min-h-[70vh] w-full flex flex-col items-center justify-center text-center px-6"
    style={{ background: BRAND.sand }}
  >
    <motion.img
      src={HALPLogo}
      alt="HALP logo"
      className="w-[500px] h-auto mb-6 drop-shadow"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    />

    <motion.p
    className="mt-3 text-5xl text-neutral-700"
    style={{ fontFamily: "var(--font-fredoka)" }}
    >
    welcome to our tech stack
    </motion.p>

    <HaloDivider />
    <div className="mt-2 flex text-2xl items-center gap-4 text-neutral-600">
      <span>2025</span>
      <span>•</span>
      <span>Side projects & experiments</span>
    </div>
  </section>
);

const About: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [placed, setPlaced] = useState<Record<string, Pt>>({});

  const words = useMemo(() => {
    const copy = [...WORDS];
    copy.sort((a, b) => b.weight - a.weight);
    for (let i = 0; i < copy.length; i++) {
      const j = i + ((i * 7) % (copy.length - i));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = CLOUD_HEIGHT;
    const centerX = W / 2;
    const centerY = H / 2;

    const rects: Rect[] = [];
    const placedNext: Record<string, Pt> = {};

    // measure sizes
    const sizes = words.map((w) => {
      const node = measureRefs.current[w.text]!;
      const { width, height } = node.getBoundingClientRect();
      return { text: w.text, w: width + 8, h: height + 4, weight: w.weight };
    });

    // place largest → smallest on a spiral
    for (let i = 0; i < sizes.length; i++) {
      // FIX #1: don’t destructure `weight` since we don’t use it
      const { text, w, h } = sizes[i];

      const a = 8;
      const b = 6;
      let theta = 0;
      let placedHere: Pt | null = null;

      for (let tries = 0; tries < 3000; tries++) {
        const r = a + b * theta;
        const x = centerX + r * Math.cos(theta) - w / 2;
        const y = centerY + r * Math.sin(theta) - h / 2;
        const rotate = ((i * 13) % 2 ? -1 : 1) * Math.min(5, (i % 5) + 1);

        if (x < 8 || y < 8 || x + w > W - 8 || y + h > H - 8) {
          theta += 0.18;
          continue;
        }
        const candidate: Rect = { x, y, w, h };
        if (!collide(candidate, rects)) {
          rects.push(candidate);
          placedHere = { left: x, top: y, rotate };
          break;
        }
        theta += 0.18;
      }

      if (!placedHere) {
        const y = 10 + i * (h + 6);
        const x = Math.max(8, Math.min(centerX - w / 2, W - w - 8));
        rects.push({ x, y, w, h });
        placedHere = { left: x, top: y, rotate: 0 };
      }
      placedNext[text] = placedHere;
    }

    setPlaced(placedNext);
  }, [words]);

  return (
    <section id="about" className="px-6 md:px-10 py-16">
    <div className="mx-auto max-w-6xl border border-neutral-500 rounded-lg">
    <div className="max-w-6xl mt-6 mb-6 mx-5">
        <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: BRAND.ink }}>
          About us
        </h2>
        <p className="text-2xl text-neutral-600 mb-8">Get to know us from a few words:</p>

        {/* Mobile */}
        <div className="md:hidden leading-tight">
          {WORDS.map((w, i) => (
            <span
              key={`m-${w.text}`}
              className={`${sizeFor(w.weight)} ${weightFor(w.weight)} mr-3`}
              style={{
                color: i % 3 === 0 ? BRAND.red : BRAND.ink,
                opacity: i % 3 === 0 ? 1 : 0.78,
              }}
            >
              {w.text}
            </span>
          ))}
        </div>

        {/* Desktop cloud */}
        <div ref={containerRef} className="hidden md:block relative w-full" style={{ height: CLOUD_HEIGHT }}>
          {/* hidden measurers */}
          <div className="absolute -top-[10000px] left-0">
            {WORDS.map((w) => (
              <span
                key={`measure-${w.text}`}
                // FIX #2: return void in the ref callback
                ref={(n) => {
                  measureRefs.current[w.text] = n;
                }}
                className={`${sizeFor(w.weight)} ${weightFor(w.weight)}`}
                style={{ fontFamily: "inherit" }}
              >
                {w.text}
              </span>
            ))}
          </div>

          {/* placed words */}
          {WORDS.map((w, i) => {
            const pos = placed[w.text];
            if (!pos) return null;
            const isBrand = i % 3 === 0;
            return (
              <motion.span
                key={`word-${w.text}`}
                className={`absolute select-none ${sizeFor(w.weight)} ${weightFor(w.weight)}`}
                style={{
                  left: pos.left,
                  top: pos.top,
                  transform: `translate(0,0) rotate(${pos.rotate}deg)`,
                  color: isBrand ? BRAND.red : BRAND.ink,
                  opacity: isBrand ? 1 : 0.85,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 6 + (i % 4), repeat: Infinity, delay: (i % 7) * 0.25 }}
              >
                {w.text}
              </motion.span>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
};


const Gallery: React.FC = () => (
  <section id="photos" className="px-6 md:px-10 py-16 bg-white">
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl md:text-4xl font-bold" style={{ color: BRAND.ink }}>
          Photo booth
        </h2>
        <Images size={24} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {GALLERY.map((src, idx) => (
          <motion.div
            key={src}
            className="overflow-hidden rounded-2xl shadow-md"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <img
              src={src}
              alt={`Gallery ${idx + 1}`}
              className="h-64 w-full object-cover hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);


const Projects: React.FC = () => (
  <section id="projects" className="px-6 md:px-10 py-16" style={{ background: BRAND.sand }}>
    <div className="mx-auto max-w-6xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: BRAND.ink }}>
        GitHub project demonstration
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PROJECTS.map((p) => (
          <div
            key={p.name}
            className="rounded-2xl shadow-sm border border-neutral-200 bg-white p-5 flex flex-col items-center text-center gap-3"
          >
            <img src={p.logo} alt={p.name} className="w-16 h-16 rounded-xl" />
            <h3 className="text-lg font-semibold" style={{ color: BRAND.ink }}>
              {p.name}
            </h3>
            <p className="text-sm text-neutral-600 min-h-[48px]">{p.desc}</p>
            <a
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center mt-1 rounded-xl px-4 py-2 text-white"
              style={{ backgroundColor: BRAND.red }}
            >
              Know More <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Contact: React.FC = () => (
  <section id="contact" className="px-6 md:px-10 py-16">
    <div className="mx-auto max-w-5xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: BRAND.ink }}>
        Get in touch
      </h2>
    </div>
    <div className="mx-auto max-w-5xl">
      <p className="text-neutral-600 mb-6">
        Drop us a line for collabs, ideas, or to show your project.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href="mailto:hello@halp.dev"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm"
          style={{ borderColor: BRAND.red, color: BRAND.ink }}
        >
          <Mail className="h-4 w-4" /> hello@halp.dev
        </a>
        <a
          href="https://github.com/HALP-Cardiff/"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm text-neutral-800"
          style={{ borderColor: "#ddd" }}
        >
          <Github className="h-4 w-4" /> Our projects
        </a>
      </div>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer className="px-6 md:px-10 py-10 border-t bg-white" style={{ borderColor: "#eee" }}>
    <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <img src={HALPLogo} alt="HALP" className="h-8 w-auto" />
        <span className="text-sm text-neutral-600">
          © {new Date().getFullYear()} HALP. All rights reserved.
        </span>
      </div>
      <nav className="text-sm text-neutral-600 flex items-center gap-4">
        <a className="hover:underline" href="#about">
          About
        </a>
        <a className="hover:underline" href="#photos">
          Photos
        </a>
        <a className="hover:underline" href="#projects">
          Projects
        </a>
        <a className="hover:underline" href="#contact">
          Contact
        </a>
      </nav>
    </div>
  </footer>
);

// --- Default export: the whole page with a simple sticky header ---
const HALP: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ background: BRAND.sand, color: BRAND.ink }}>
      {/* Sticky top nav */}
      <header
        className="sticky top-0 z-50 backdrop-blur border-b"
        style={{ background: "rgba(245,239,230,0.75)", borderColor: "#eee" }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-10 h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3">
            <img src={HALPLogo} alt="HALP" className="h-16 w-auto" />
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700">
            <a className="hover:opacity-70" href="#about">
              About
            </a>
            <a className="hover:opacity-70" href="#photos">
              Photo booth
            </a>
            <a className="hover:opacity-70" href="#projects">
              Projects
            </a>
            <a className="hover:opacity-70" href="#contact">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main>
        <Banner />
        <About />
        <Gallery />
        <Projects />
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

export default HALP;
