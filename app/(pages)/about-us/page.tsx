// app/about/page.tsx
import AboutUsCard from "@/components/AboutUsCard";

export default function AboutPage() {
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
      title: "Why Choose PioProperties?",
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About PioProperties
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Real estate transactions made transparent, seamless and affordable
            </p>
          </div>
        </div>
      </div>

      {/* About Cards Section */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {aboutSections.map((section, index) => (
            <AboutUsCard
              key={index}
              title={section.title}
              description={section.description}
              className="transition-all duration-300"
            />
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already discovered the benefits of
            direct real estate transactions
          </p>
          <div className="space-x-4">
            <a href="../create-listing">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
                List Your Property
              </button>
            </a>
            <a href="../properties">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-8 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
                Browse Properties
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
