// src/components/common/footer.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Mail, ShieldCheck, FileText } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

interface PhysicsBox {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  width: number;
  height: number;
  color: string;
  borderColor: string;
}

const TECH_TERMS = [
  // Full-Stack & Backend
  "React.js", "TypeScript", "Next.js", "Python", "Node.js", 
  "Full-Stack", "AI Engineer", "MongoDB", "Tailwind CSS", "PostgreSQL",
  "Scholarship", "DevsCircle", "Zustand", "FastAPI", "Docker",
  "JavaScript", "Git & GitHub", "REST API", "Responsive", "Capstone",
  "Express.js", "Redux", "Database", "Authentication", "JWT", "Prisma",
  
  // UI/UX & Graphic Design
  "UI/UX Design", "Figma", "Wireframing", "Typography", "Color Theory",
  "Brand Identity", "Adobe Photoshop", "Adobe Illustrator", "Prototyping",
  "User Research", "Logo Design", "Layout Grid", "Visual Hierarchy", "Vector Art",

  // Video Editing & Motion Graphics
  "Video Editing", "Adobe Premiere Pro", "CapCut Pro", "Color Grading",
  "Visual Storytelling", "Audio Mixing", "Keyframing", "Reels & Shorts",
  "Motion Graphics", "Timeline Cutting", "B-Roll", "Transitions", "Sound Design"
];

export function Footer() {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    ctx.font = "bold 12px monospace";

    // Initialize physics boxes with random positions, velocities, and measured widths
    const boxes: PhysicsBox[] = TECH_TERMS.map((term) => {
      const textWidth = ctx.measureText(term).width;
      return {
        x: Math.random() * (width - 120),
        y: Math.random() * -height - 50,
        vx: (Math.random() - 0.5) * 3, // lateral velocity
        vy: Math.random() * 2 + 1,    // fall speed
        text: term,
        width: textWidth + 24,        // padding box width
        height: 30,                   // box height
        color: "rgba(15, 23, 42, 0.85)", // dark slate glass background
        borderColor: Math.random() > 0.5 ? "#f97316" : "#ef4444", // orange or red glow
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < boxes.length; i++) {
        const b = boxes[i];

        // Apply physics motion
        b.x += b.vx;
        b.y += b.vy;

        // Gravity acceleration
        b.vy += 0.08;

        // Floor collision & bounce
        if (b.y > height - 40) {
          b.y = height - 40;
          b.vy *= -0.55; // elastic bounce
          b.vx += (Math.random() - 0.5) * 2;
        }

        // Wall collisions
        if (b.x < 10) {
          b.x = 10;
          b.vx *= -1;
        } else if (b.x + b.width > width - 10) {
          b.x = width - 10 - b.width;
          b.vx *= -1;
        }

        // Box-to-box collision detection and elastic response
        for (let j = i + 1; j < boxes.length; j++) {
          const b2 = boxes[j];

          // AABB Collision check
          if (
            b.x < b2.x + b2.width &&
            b.x + b.width > b2.x &&
            b.y < b2.y + b2.height &&
            b.y + b.height > b2.y
          ) {
            // Swap velocities and add random scatter deflection
            const tempVx = b.vx;
            const tempVy = b.vy;
            b.vx = b2.vx * 0.85 + (Math.random() - 0.5) * 2;
            b.vy = b2.vy * 0.85 + (Math.random() - 0.5) * 2;
            b2.vx = tempVx * 0.85 + (Math.random() - 0.5) * 2;
            b2.vy = tempVy * 0.85 + (Math.random() - 0.5) * 2;

            // Separate overlapping boxes to prevent sticking
            const overlapX = (b.width + b2.width) / 2 - Math.abs((b.x + b.width / 2) - (b2.x + b2.width / 2));
            const overlapY = (b.height + b2.height) / 2 - Math.abs((b.y + b.height / 2) - (b2.y + b2.height / 2));

            if (overlapX < overlapY) {
              if (b.x < b2.x) b.x -= overlapX / 2;
              else b.x += overlapX / 2;
            } else {
              if (b.y < b2.y) b.y -= overlapY / 2;
              else b.y += overlapY / 2;
            }
          }
        }

        // Recycle box back to top if it goes out of bounds
        if (b.y < -150 || b.y > height + 50 || b.x < -100 || b.x > width + 100) {
          b.x = Math.random() * (width - 120);
          b.y = -50 - Math.random() * 100;
          b.vy = Math.random() * 2 + 1;
          b.vx = (Math.random() - 0.5) * 3;
        }

        // Draw glowing glassmorphism physics box
        ctx.save();
        ctx.shadowColor = b.borderColor;
        ctx.shadowBlur = 12;

        ctx.fillStyle = b.color;
        ctx.strokeStyle = b.borderColor;
        ctx.lineWidth = 1.5;

        // Rounded rectangle path
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 8);
        ctx.fill();
        ctx.stroke();

        // Draw term text inside box
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.fillText(b.text, b.x + 12, b.y + 19);

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const enquiryMessage = encodeURIComponent(
    "Hello DevsCircle, I would like to make more enquiries about your programmes and scholarship offerings."
  );

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 relative overflow-hidden">
      {/* Interactive Physics Canvas Simulation Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full z-0 opacity-75"
      />

      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src={SITE_CONFIG.logoPath}
                alt={SITE_CONFIG.name}
                width={36}
                height={36}
                className="h-9 w-auto"
              />
              <span className="font-bold text-white text-lg tracking-tight">
                {SITE_CONFIG.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {SITE_CONFIG.description}
            </p>
            <p className="text-xs font-semibold text-orange-400">
              {SITE_CONFIG.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#about" className="hover:text-orange-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#programmes" className="hover:text-orange-400 transition-colors">
                  Programmes
                </Link>
              </li>
              <li>
                <Link href="/#scholarship" className="hover:text-orange-400 transition-colors">
                  Scholarship
                </Link>
              </li>
              <li>
                <Link href="/#assessment" className="hover:text-orange-400 transition-colors">
                  Assessment
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-orange-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification & Legal */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Verification & Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/verify" className="hover:text-orange-400 transition-colors inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verify Certificate
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-orange-400 transition-colors inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-orange-400" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-orange-400 transition-colors inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-orange-400" /> Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-slate-500">NDPA 2023 Compliant</span>
              </li>
            </ul>
          </div>

          {/* Interactive Contact & WhatsApp Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Contact Us</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="text-slate-500 font-medium">Call / WhatsApp:</li>
              {SITE_CONFIG.contacts.phones.map((phone: string) => {
                const cleanedPhone = phone.replace(/[^0-9]/g, "");
                const waUrl = `https://wa.me/${cleanedPhone}?text=${enquiryMessage}`;

                return (
                  <li key={phone}>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-slate-200 font-mono hover:text-emerald-400 transition-colors group"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span>{phone}</span>
                    </a>
                  </li>
                );
              })}

              <li className="text-slate-500 pt-2 font-medium">Email:</li>
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.contacts.email}?subject=Enquiry%20About%20DevsCircle`}
                  className="inline-flex items-center gap-1.5 text-slate-200 font-mono hover:text-orange-400 transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span>{SITE_CONFIG.contacts.email}</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar with Real Copyright Year */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 relative z-10">
          <p>© {currentYear} {SITE_CONFIG.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-400 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}