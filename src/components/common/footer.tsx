import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Mail } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  const enquiryMessage = encodeURIComponent(
    "Hello DevsCircle, I would like to make more enquiries about your programmes and scholarship offerings."
  );

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900">
      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6">
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
                <Link href="/verify" className="hover:text-orange-400 transition-colors">
                  Verify Certificate
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

        {/* Footer Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-600">
          © {SITE_CONFIG.edition} {SITE_CONFIG.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}