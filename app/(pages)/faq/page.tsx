"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FAQPage() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqSections = [
    {
      question:
        "As a First-time Home Buyer, How Do I Decide Between a BTO Flat or Resale HDB Flat?",
      answer:
        "The choice between a BTO vs resale flat comes down to a few factors: Eligibility: Check if you meet the eligibility criteria for a BTO flat or resale flat; you will also know this when you submit your HDB Flat Eligibility (HFE) letter. Price: BTO flats are generally cheaper than resale units in the same area. CPF Housing Grants: Whether you're buying a new or resale HDB flat, you could be eligible for grants. For BTO flats, you may qualify for up to $80,000 in grant monies; for resale HDB flats, you may be eligible for up to $160,000. Waiting time: BTO flats can take up to five years to be completed, while resale units can be moved into almost immediately. Size: For the same unit type, older resale units are generally bigger. Location: Resale flat buyers have more unit choices in the open market, while the location of BTO developments is usually limited to where the BTO launches are released. Renovation costs: BTO flats generally come as a 'blank canvas' which you can customise to your liking, whereas you may move into a suitable resale unit with minimal or no renovation or have to pay more to fix wear-and-tear if the unit is very old.",
    },
    {
      question: "What Are the Different Types of Homes or Properties in Singapore?",
      answer:
        "Below is an overview of the types of residential properties available in Singapore: Public Housing (HDB flats) - 2-room Flexi flat: a one-bedroom unit of about 36 to 45 sq m. 3-room flat: a two-bedroom unit of about 60 sq m. 4-room flat: a three-bedroom unit of about 90 sq m. 5-room flat: a three-bedroom unit of about 110 sq m. 3Gen flat: a four-bedroom unit of about 115 sq m, for multi-generational families. Executive flat: a three-bedroom unit of about 130 sq m. DBSS: public housing built by private developers, the scheme has been suspended indefinitely. Public-private Hybrid (Executive Condominiums): Units constructed and sold by private developers, with amenities similar to private condominiums, but are more affordable. Non-landed Private Properties: Private condominiums are similar to ECs but are privately owned from the start. Apartments are typically part of a smaller residential project with fewer amenities but are usually cheaper. Landed Housing: Semi-detached Houses, Terraced Homes, Cluster Houses, Townhouses, Shophouses, Bungalows, and Good Class Bungalows (GCB).",
    },
    {
      question:
        "What's the Difference Between Freehold Vs Leasehold Property in Singapore?",
      answer:
        "The common understanding is that freehold properties can be held indefinitely by the buyer, while 99-year leasehold properties will revert back to the state after the tenure ends. Freehold units generally carry a higher value and have theoretical advantages, while leasehold units have been shown to offer better rental yields. As the remaining lease period gets shorter, bank loans may also be harder to get approved, and CPF money cannot be used to buy a home with less than 30 years of lease remaining. What it boils down to is the intention of the buyer. Choose freehold if you plan to live in the property for the long term; while leasehold makes more sense for rental income.",
    },
    {
      question: "What Are Singapore's Property Ownership Rules for HDB Flats?",
      answer:
        "An HDB flat owner(s) must be at least a Singapore Citizen or two Singapore Permanent Residents. You may not have more than one HDB flat under your name. If you just purchased a resale HDB flat, you need to dispose of the other HDB unit within six months. If you own private property, either locally or overseas, you will need to dispose of the private property within six months of the resale flat purchase. HDB owners may purchase a private property once they've met the Minimum Occupation Period (MOP) for the HDB flat. Singapore PRs cannot own both an HDB and private property (either locally or overseas).",
    },
    {
      question: "When Is a Good Time to Buy Property in Singapore?",
      answer:
        "The best time to buy a property is when you are ready. There are some home purchase preparation steps to take even before you start looking for your new home: Ensure you have a stable pay cheque, have a good credit score, prepare a sustainable budget plan, save more to afford the downpayment, understand your wants versus needs, decide on your type of home based on what you can afford now, research the URA Master Plan and future development for locations you are interested in, clear as much of your outstanding debt as you can, and get pre-approved for a mortgage if you're taking a bank loan.",
    },
    {
      question:
        "When Financing My Property Purchase, What Should I Look out For?",
      answer:
        "Consider housing loans, car loans and credit card bills. Be aware of Additional Buyer's Stamp Duty (ABSD) rates and if you have to pay them on top of the existing Buyer's Stamp Duty (BSD). Understand Seller's Stamp Duty (SSD) for properties sold within the first three years of purchase. Know the Loan-to-Value (LTV) limits; assuming you're buying your first property, the maximum LTV is 75% for bank loans and 80% for an HDB-granted loan. Understand the minimum cash downpayment amount which is the smallest amount that must be paid by the buyer in cash. Your Total Debt Servicing Ratio (TDSR) is capped at 55%. Mortgage Servicing Ratio (MSR) for HDBs and ECs, which caps monthly loan repayments to banks at 30%.",
    },
    {
      question:
        "I'm Looking for an HDB Resale Flat. How Do I Know If I Am Eligible?",
      answer:
        "When applying for your HFE letter, you will be informed of your HDB flat purchase eligibility. To find out more about your HDB flat eligibility, you can apply for your HDB Flat Eligibility (HFE) letter.",
    },
    {
      question: "How Do I Know What Property Can I Afford?",
      answer:
        "Use our Affordability Calculator to break down the maximum property value, loan amount, deposit value, as well as the fees and duties for your next home purchase. This will help you understand your budget and what you can realistically afford.",
    },
    {
      question: "How Can I Buy a House in Singapore If I'm Single?",
      answer:
        "Because of Singapore's property laws, a Singapore Citizen who is single has the following options: apply for a 2-room Flexi flat via HDB's BTO scheme if you are 35 years old and above, purchase a resale HDB flat from the open market if you are 35 years old and above, or purchase a private property from the open market as long you are 21 years old and above. Remember you can utilise your CPF grants for HDB flat purchases, provided you qualify for them.",
    },
    {
      question: "What Grants Are Available for First-time Home Buyers?",
      answer:
        "First-time home buyers can choose to buy a flat directly from HDB at a subsidised rate, or a resale flat from the open market with the help of housing grants. For those buying as a family, the cost of your new HDB BTO flat can be reduced by up to $80,000. If you're buying a resale flat, you can offset its price by as much as $160,000 after factoring in HDB resale grants. When you submit your HFE letter application, you will be informed of which CPF housing grants you will be eligible for and how much grant you can get.",
    },
    {
      question: "What Are the Property Taxes I Will Need to Pay If I Buy a Home?",
      answer:
        "Buyer's Stamp Duty (BSD): A tax paid upon signing of the Option to Purchase/Sale & Purchase agreements, based on the actual price or market value, with progressively tiered rates. Additional Buyer's Stamp Duty (ABSD): An additional tax which applies depending on the buyer's residency status and the number of properties owned. Annual property tax payable: Property owners who are staying in the said property pay lower rates, the tax is based on the Annual Value of the property. Regardless of whether you buy public or private housing, you will have to pay property taxes. Use our online stamp duty calculator if you want to know how much you have to pay.",
    },
    {
      question: "How Do I Calculate My Home Downpayment?",
      answer:
        "Use our Affordability Calculator to break down the maximum property value, loan amount, and deposit value, as well as the fees and duties for your next home purchase. This tool will help you understand the exact amount you need to save for your downpayment.",
    },
    {
      question: "Do I Need a Real Estate Agent to Buy a Home in Singapore?",
      answer:
        "You do not necessarily need an agent to buy a home in Singapore. However, a good agent can advise on potential problems, take care of the tedious paperwork, knows how to navigate the many property rules, can liaise with the seller's agent on your behalf, and has an industry network that helps with your buying process. If you are familiar enough with the process, are meticulous enough to handle all the details, and are willing to work closely with the seller's agent and your lawyer, you can buy a home without a property agent in Singapore.",
    },
    {
      question: "What Should I Know about Property Refinancing?",
      answer:
        "Refinancing your home loan means to replace your current home loan package with a new one from another bank, usually with improved terms to lower your mortgage payments. However, refinancing comes with some caveats. You will incur legal fees, usually $2,000 to $3,000. To avoid a pre-payment penalty, you will want to ensure you're not refinancing your home loan within your lock-in period. The penalty is usually 1.5% of the outstanding loan.",
    },
    {
      question:
        "I'm Buying a Property for Investment. What Is the Most Important Thing to Know?",
      answer:
        "Three important considerations before buying a property for investment are: Funding: The LTV limit that you can borrow from banks will vary depending on your existing properties and mortgages. Your TDSR cannot exceed 55%. Location: This greatly determines the future prospect of the property you are buying. Ask several property agents and research the price statistics of different areas on the HDB and URA websites. Property taxes: Know how much you have to pay for non-owner occupied residential properties tax rates.",
    },
    {
      question:
        "How Long Should I Hold an Investment Property in Singapore?",
      answer:
        "In Singapore, sellers of residential properties need to be aware of Seller's Stamp Duty (SSD), which is a tax on properties sold within the first three years of purchase. This starts at 12% if sold in the first year of purchase, 8% in the second year, and 4% in the third year. You can avoid this penalty if you wait to sell your property in the fourth year, while renting out the space in the meantime. When to sell also depends on whether the price is right (i.e. has the initial price investment \"matured\"). Sometimes, it may be more prudent to hold a property as development of the estate or area is still ongoing.",
    },
    {
      question: "What is En Bloc?",
      answer:
        "An \"en bloc\" sale is a term for the collective sale of two or more property units to a single purchaser. In Singapore, en bloc is commonly used to refer to full-development sales to a property developer or the government. In essence, it means the property owners agree to collectively sell their units in exchange for payment. This payment is usually higher than the current market price of each individual unit as it removes the hassle and risk of the buyer having to negotiate with each individual owner. For an en bloc deal to go through, at least 80% of the residents (based on property value and strata area) must agree to the sale if the development is more than 10 years old. 90% must agree if the development is 10 years old or below.",
    },
    {
      question: "Can Foreigners Buy Property in Singapore?",
      answer:
        "Foreigners who are not PRs can buy private condos, privatised ECs, landed properties in Sentosa Cove, and landed properties (with special permission from SLA). There are specific eligibility criteria to follow for foreigners buying property in Singapore. It's recommended to consult with a property agent or lawyer to understand the full requirements and restrictions.",
    },
    {
      question: "Can Singapore PRs Buy HDB Flats in Singapore?",
      answer:
        "If you're talking about an HDB flat directly purchased from HDB (i.e. a BTO flat or SBF flat), a single PR is not permitted to purchase such property. The only way for a PR to legally buy a new HDB flat is by marrying a Singapore Citizen. If you already tied the knot with a Singapore Citizen, both of you can acquire a BTO flat via the HDB Public Scheme or the Fiancé/Fiancée Scheme. If you're just two Singapore PRs forming a household together, you cannot buy new, subsidised HDB flats sold by the government. But you can buy a resale flat with another Singapore PR if both of you have attained the PR status for at least three years. To find out more about your HDB flat eligibility, apply for your HDB Flat Eligibility (HFE) letter.",
    },
    {
      question:
        "What Are the Rules for Buying a Second Property in Singapore?",
      answer:
        "Singapore Citizens who own an HDB flat, DBSS flat or new EC must fulfil the five-year Minimum Occupation Period (MOP) before they are eligible to buy a private property. Singapore Permanent Residents cannot own both an HDB flat and private residential property at the same time. They will need to dispose of a unit within six months of making the new purchase. Only Singapore Citizens are allowed to own an HDB flat and private property at the same time. Your LTV limit for your second home loan will be lower than that of your first home loan, meaning you'll need to have sufficient cash on hand. The minimum cash downpayment for your second property can go up to 25%. You'll have to pay Additional Buyer's Stamp Duty (ABSD) on top of the regular BSD. For Singapore citizens buying their second property, the ABSD amount is 20%; for PRs buying their second property, the ABSD amount is 30%.",
    },
  ];

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 text-white overflow-hidden pt-20 pb-24">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -ml-36 mb-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Quick Support</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Frequently Asked
              <br />
              <span className="text-yellow-300">Questions</span>
            </h1>
            <p className="text-xl md:text-2xl text-white text-opacity-90">
              Find answers to common questions about property buying in Singapore
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-4">
          {faqSections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <button
                onClick={() => toggleExpanded(index)}
                className="w-full px-8 py-6 flex items-start justify-between text-left hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-all duration-300"
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {section.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-emerald-600 flex-shrink-0 transition-transform duration-300 ${
                    expandedIndex === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {expandedIndex === index && (
                <div className="px-8 pb-6 border-t border-gray-100">
                  <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
                    {section.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Additional Help Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto mb-16 border border-gray-100">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Didn't find your answer?
          </h3>
          <p className="text-gray-600 mb-6">
            If you have any other questions, our support team is here to help.
          </p>
          <button
            onClick={() => router.push("/contact")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Contact Support
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
