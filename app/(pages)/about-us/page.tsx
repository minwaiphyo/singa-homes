"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function AboutPage() {
  const router = useRouter();

  const aboutSections = [
    {
      title: "Company Mission",
      description:
        "Our mission is to revolutionize the real estate market by directly connecting buyers and sellers, eliminating unnecessary intermediaries and reducing costs. We believe everyone should have access to transparent, efficient, and affordable property transactions. By leveraging modern technology, we empower individuals to take control of their real estate journey while providing all the tools and support they need to make informed decisions.",
    },
    {
      title: "Our Vision",
      description:
        "We envision a future where buying and selling real estate is as simple as any other online transaction. Our platform aims to democratize real estate by making it accessible to everyone, regardless of their experience level. We're building a community where trust, transparency, and direct communication form the foundation of every property transaction.",
    },
    {
      title: "Why Choose SingaProp?",
      description:
        "Unlike traditional real estate platforms, we put you in direct control. No agent commissions, no hidden fees, no unnecessary delays. Our comprehensive platform includes advanced search filters, secure messaging, integrated scheduling for property visits, and detailed listing management tools. We provide the technology and support you need while letting you maintain full control over your transactions.",
    },
    {
      title: "Platform Features",
      description:
        "Our platform offers property listings with detailed descriptions and images, buyer-seller direct messaging, favorites system for buyers, integrated calendar scheduling for home visits, secure document sharing, advanced search and filtering, mobile-responsive design, and real-time notifications. Everything you need for a complete real estate transaction experience.",
    },
    {
      title: "Getting Started",
      description:
        "Joining PIO Real Estate is simple and free. Sellers can create detailed listings with photos and descriptions, set their own prices, and manage their own schedules. Buyers can browse properties, save favorites, and directly contact sellers they're interested in. Our intuitive interface makes it easy for both first-time users and experienced property traders.",
    },
    {
      title: "Security & Trust",
      description:
        "We take security seriously with encrypted communications, secure user authentication, verified user profiles, and comprehensive privacy controls. While we facilitate direct connections, we provide the infrastructure and security measures to ensure safe and trustworthy transactions between all parties.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 text-white overflow-hidden pt-20 pb-24">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -ml-36 mb-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              About SingaProp
            </h1>
            <p className="text-xl md:text-2xl text-white text-opacity-90">
              Real estate transactions made transparent, seamless, and
              affordable
            </p>
          </div>
        </div>
      </div>

      {/* About Cards Section */}
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="space-y-6">
          {aboutSections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {section.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Section - Seamlessly integrated with Footer gradient */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 text-white overflow-hidden py-20">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -ml-36 mb-0"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white text-opacity-90 mb-10 max-w-2xl mx-auto">
            Join thousands of users who have already discovered the benefits of
            direct real estate transactions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/create-listing")}
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-600 font-semibold py-4 px-10 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              List Your Property
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/properties")}
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-semibold py-4 px-10 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Browse Properties
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
