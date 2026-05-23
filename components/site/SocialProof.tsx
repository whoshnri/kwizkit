"use client";

import React, { useEffect, useRef, useState } from "react";

const INSTITUTIONS = [
  { name: "Global Academy",        type: "University",  abbr: "GA", bg: "#E6F1FB", color: "#0C447C" },
  { name: "North Star University", type: "University",  abbr: "NS", bg: "#EAF3DE", color: "#27500A" },
  { name: "Elite Training Org",    type: "Training",    abbr: "ET", bg: "#FAEEDA", color: "#633806" },
  { name: "Pacific Institute",     type: "Institute",   abbr: "PI", bg: "#FBEAF0", color: "#72243E" },
  { name: "Metro High",            type: "K-12 School", abbr: "MH", bg: "#EEEDFE", color: "#3C3489" },
  { name: "Bridge Ed",             type: "College",     abbr: "BE", bg: "#E1F5EE", color: "#085041" },
  { name: "Horizon Scholars",      type: "Academy",     abbr: "HS", bg: "#FAECE7", color: "#712B13" },
  { name: "Apex Learning",         type: "Vocational",  abbr: "AL", bg: "#F1EFE8", color: "#444441" },
];

interface Institution {
  name: string;
  type: string;
  abbr: string;
  bg: string;
  color: string;
}

function InstitutionChip({ name, type, abbr, bg, color }: Institution) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 text-8xl text-gray-400 whitespace-nowrap shrink-0">
      
        {abbr}
    </div>
  );
}

export default function SocialProof() {
  const tripledItems = [...INSTITUTIONS, ...INSTITUTIONS, ...INSTITUTIONS];

  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const [institutionCount] = useState(30);

  const animate = () => {
    if (!isPausedRef.current && scrollerRef.current) {
      const track = scrollerRef.current;
      const singleSetWidth = track.scrollWidth / 3;
      scrollPosRef.current += 0.8;
      if (scrollPosRef.current >= singleSetWidth) {
        scrollPosRef.current = 0;
      }
      track.style.transform = `translateX(-${scrollPosRef.current}px)`;
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <section className="rubric-shell py-8 lg:py-16">
      <div
        className="rubric-card overflow-hidden rounded-3xl flex flex-col md:flex-row"
        // style={{ background: "var(--surface-strong)" }}
      >
        {/* Left Panel: Text Content */}
        <div className="flex-1 px-6 py-8 md:px-10 md:py-10 flex flex-col justify-center order-2 md:order-1">
          <h2 className="rubric-section-title text-2xl" style={{ color: "var(--rubric-black)" }}>
            Trusted by schools, universities, and training organizations.
          </h2>
          <p className="mt-4 text-base leading-relaxed max-w-md rubric-body">
            We provide the infrastructure helping educators deliver better outcomes and streamlined assessments across the globe.
          </p>
          <div className="mt-8 pt-8 rubric-divider">
            <p
              className="text-sm font-semibold tracking-widest uppercase"
              style={{ color: "var(--rubric-muted)" }}
            >
              {institutionCount}+ institutions · and growing
            </p>
          </div>
        </div>

        

        {/* Right Panel: Infinite Scroller */}
        <div
          className="relative flex-none md:w-[340px] xl:w-[400px] h-[200px] md:h-auto overflow-hidden order-1 md:order-2"
          style={{ background: "var(--surface-muted)" }}
          onMouseEnter={() => (isPausedRef.current = true)}
          onMouseLeave={() => (isPausedRef.current = false)}
        >
          {/* Left fade — blends into card surface */}
          <div
            className="absolute left-0 top-0 bottom-0 w-12 md:w-16 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to right, var(--surface-strong), transparent)",
            }}
          />
          {/* Right fade — blends into muted scroller bg */}
          <div
            className="absolute right-0 top-0 bottom-0 w-12 md:w-16 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(to left, var(--surface-muted), transparent)",
            }}
          />

          {/* Scrolling track */}
          <div className="flex items-center h-full w-max py-4">
            <div
              ref={scrollerRef}
              className="flex gap-3 md:gap-4 px-4 items-center will-change-transform"
            >
              {tripledItems.map((inst, index) => (
                <InstitutionChip key={`${inst.name}-${index}`} {...inst} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}