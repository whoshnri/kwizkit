"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SocialProof = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const numbers = containerRef.current?.querySelectorAll("[data-count]");

    numbers?.forEach((num) => {
      const target = parseInt(num.getAttribute("data-count") || "0");
      const obj = { value: 0 };

      gsap.to(obj, {
        value: target,
        duration: 2.5,
        ease: "power1.out",
        scrollTrigger: {
          trigger: num,
          start: "top 85%",
          toggleActions: "play none none none",
        },
        onUpdate: () => {
          num.textContent = Math.floor(obj.value).toLocaleString() + "+";
        },
      });
    });
  }, []);

  return (
    <section className="py-16 sm:py-20 border-dashed border-2 theme-border-color rounded-md px-6 sm:px-12 lg:px-20">
      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
      >
        {/* Each number gets a data-count attribute */}
        <div className="p-4">
          <p
            className="text-4xl sm:text-5xl font-bold theme-text-accent"
            data-count="10000"
          >
            0+
          </p>
          <p className="text-base text-muted-foreground mt-2">Tests Created</p>
        </div>
        <div className="p-4">
          <p
            className="text-4xl sm:text-5xl font-bold theme-text-accent"
            data-count="500"
          >
            0+
          </p>
          <p className="text-base text-muted-foreground mt-2">
            Educators Involved
          </p>
        </div>
        <div className="p-4">
          <p
            className="text-4xl sm:text-5xl font-bold theme-text-accent"
            data-count="25000"
          >
            0+
          </p>
          <p className="text-base text-muted-foreground mt-2">
            Students Assessed
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
