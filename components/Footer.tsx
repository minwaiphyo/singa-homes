"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

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
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/faq" },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Pio<span className="text-yellow-300">Properties</span>
            </h2>
            <p className="text-white text-opacity-90 mb-6 leading-relaxed text-sm">
              Your trusted platform for buying, selling, and renting properties
              in Singapore.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                <span className="text-white text-opacity-90 text-sm">
                  Singapore
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                <a
                  href="tel:+6512345678"
                  className="text-white text-opacity-90 hover:text-yellow-300 transition-colors text-sm"
                >
                  +65 1234 5678
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                <a
                  href="mailto:hello@singaprop.com"
                  className="text-white text-opacity-90 hover:text-yellow-300 transition-colors text-sm"
                >
                  hello@singaprop.com
                </a>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-bold mb-6 text-lg">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white text-opacity-80 hover:text-yellow-300 transition-colors duration-300 flex items-center gap-2 group text-sm"
                    >
                      <span className="w-1 h-1 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white border-opacity-20 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-center md:text-left text-white text-opacity-80 text-sm">
              <p>&copy; {currentYear} SingaProp. All rights reserved.</p>
            </div>

            {/* Back to Top Button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-white text-opacity-80 hover:text-yellow-300 transition-colors text-sm font-medium flex items-center gap-2"
            >
              Back to Top
              <ArrowRight className="w-4 h-4 rotate-270" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
