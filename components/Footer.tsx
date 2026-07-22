"use client";

import Link from "next/link";
import { ArrowUp, Building2, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: [
      { label: "About Us", href: "/about-us" },
      { label: "Contact Us", href: "/contact" },
    ],
    Properties: [
      { label: "Browse Properties", href: "/properties" },
      { label: "Create Listing", href: "/create-listing" },
      { label: "My Properties", href: "/my-properties" },
    ],
    Resources: [
      { label: "Guides", href: "/blog" },
      { label: "FAQ", href: "/faq" },
    ],
  };

  return (
    <footer className="border-t border-brand-line bg-brand-navy-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-red">
                <Building2 className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-bold tracking-tight">SingaHomes</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-300">
              A Singapore-focused real estate marketplace built for transparent
              buyer-seller property transactions.
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-brand-red" />
                Singapore
              </div>
              <a
                href="tel:+6512345678"
                className="flex items-center gap-3 hover:text-white"
              >
                <Phone className="h-4 w-4 text-brand-red" />
                +65 1234 5678
              </a>
              <a
                href="mailto:hello@singahomes.com"
                className="flex items-center gap-3 hover:text-white"
              >
                <Mail className="h-4 w-4 text-brand-red" />
                hello@singahomes.com
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-5 text-sm font-bold uppercase tracking-wide text-white">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-300 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} SingaHomes. All rights reserved.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 font-semibold text-slate-300 hover:text-white"
          >
            Back to Top
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
