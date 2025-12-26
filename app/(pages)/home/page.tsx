"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Search,
  TrendingUp,
  Shield,
  Users,
  ArrowRight,
  MapPin,
  DollarSign,
  Star,
  CheckCircle,
} from "lucide-react";

interface FeaturedProperty {
  id: string;
  title: string;
  price: number;
  propertyType: string;
  listingType: string;
  city: string;
  state: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  isFeatured: boolean;
  images: { url: string; altText: string | null }[];
}

export default function HomePage() {
  const router = useRouter();
  const [featuredProperties, setFeaturedProperties] = useState<
    FeaturedProperty[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const response = await fetch("/api/properties");
      if (response.ok) {
        const data = await response.json();
        // Filter only featured properties and limit to 6
        const featured = data
          .filter((p: FeaturedProperty) => p.isFeatured)
          .slice(0, 6);
        setFeaturedProperties(featured);
      }
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/properties?city=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/properties");
    }
  };

  const blogPosts = [
    {
      id: 1,
      name: "beautiful-home-listing",
      title: "How to Create a Beautiful Home Listing",
      excerpt:
        "Learn the secrets to making your property stand out with stunning photos and compelling descriptions.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
      category: "Seller Tips",
      readTime: "5 min read",
    },
    {
      id: 2,
      name: "first-time-buyer-guide",
      title: "First-Time Home Buyer's Guide",
      excerpt:
        "Everything you need to know about purchasing your first property in Singapore.",
      image:
        "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400",
      category: "Buyer Guide",
      readTime: "8 min read",
    },
    {
      id: 3,
      name: "top-neighbourhoods-singapore",
      title: "Top 10 Neighborhoods in Singapore",
      excerpt:
        "Discover the best areas to live in Singapore based on your lifestyle and budget.",
      image:
        "https://images.unsplash.com/photo-1565402170291-8491f14678db?w=400",
      category: "Location Guide",
      readTime: "6 min read",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                #1 Property Platform in Singapore
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Dream Home
              <br />
              <span className="text-yellow-300">In Singapore</span>
            </h1>

            <p className="text-xl md:text-2xl mb-10 text-white text-opacity-90">
              Discover the perfect property from thousands of listings
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2"
            >
              <div className="flex-1 flex items-center px-4">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search by city, neighborhood, or property type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-4 text-gray-900 placeholder-gray-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-blue-700 transition-all flex items-center justify-center"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Properties
              </button>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <p className="text-3xl font-bold">10K+</p>
                <p className="text-sm text-white text-opacity-80">Properties</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">5K+</p>
                <p className="text-sm text-white text-opacity-80">
                  Happy Clients
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">98%</p>
                <p className="text-sm text-white text-opacity-80">
                  Satisfaction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Featured Properties
            </h2>
            <p className="text-gray-600">Handpicked properties just for you</p>
          </div>
          <button
            onClick={() => router.push("/properties")}
            className="hidden md:flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
          >
            View All
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl h-80 animate-pulse"
              ></div>
            ))}
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No featured properties available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                onClick={() => router.push(`/properties/${property.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group border border-gray-100"
              >
                <div className="relative h-56 bg-gray-200">
                  {property.images?.[0]?.url ? (
                    <img
                      src={property.images[0].url}
                      alt={property.images[0].altText || property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <span className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐ Featured
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-xl mb-2 text-gray-900 line-clamp-1">
                    {property.title}
                  </h3>

                  <p className="text-2xl font-bold text-emerald-600 mb-3">
                    ${property.price.toLocaleString()}
                    {property.listingType === "RENT" && (
                      <span className="text-sm text-gray-600 font-normal">
                        /month
                      </span>
                    )}
                  </p>

                  <p className="text-sm text-gray-600 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.city}, {property.state}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-700">
                    {property.bedrooms !== null && (
                      <span>{property.bedrooms} bed</span>
                    )}
                    {property.bathrooms !== null && (
                      <span>{property.bathrooms} bath</span>
                    )}
                    <span>{property.area} sqft</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8 md:hidden">
          <button
            onClick={() => router.push("/properties")}
            className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
          >
            View All Properties
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Why Choose SingaProperties?
            </h2>
            <p className="text-gray-600 text-lg">
              Your trusted partner in real estate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                <TrendingUp className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Best Prices
              </h3>
              <p className="text-gray-600">
                Get the best deals on properties with our competitive pricing
                and transparent process.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Secure & Safe
              </h3>
              <p className="text-gray-600">
                All transactions are secure and verified. Your safety is our top
                priority.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-5">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Expert Support
              </h3>
              <p className="text-gray-600">
                Our team of experts is here to guide you through every step of
                your journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Latest Insights
            </h2>
            <p className="text-gray-600">
              Tips and guides to help you make the right decision
            </p>
          </div>
          <button
            onClick={() => router.push("/blog")}
            className="hidden md:flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
          >
            View All
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => router.push(`/blog/${post.name}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group border border-gray-100"
            >
              <div className="relative h-48 bg-gray-200">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-white text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold">
                  {post.category}
                </span>
              </div>

              <div className="p-6">
                <p className="text-xs text-gray-500 mb-2">{post.readTime}</p>
                <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {post.excerpt}
                </p>
                <button className="mt-4 text-emerald-600 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <button
            onClick={() => router.push("/blog")}
            className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
          >
            View All Articles
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-xl mb-8 text-white text-opacity-90">
            Join thousands of happy homeowners who found their perfect property
            with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/properties")}
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg"
            >
              Browse Properties
            </button>
            <button
              onClick={() => router.push("/create-listing")}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-emerald-600 transition-all"
            >
              List Your Property
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
