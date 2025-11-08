export default function FAQPage() {
  const faqSections = [
    {
      question: "How do I create an account?",
      answer:
        "To create an account, click on the 'Sign Up' button at the top right corner of the homepage. Fill in the required details such as your name, email address, and password. Once submitted, you'll receive a confirmation email to verify your account.",
    },
    {
      question: "How can I list my property for sale?",
      answer: "Idk",
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Find answers to common questions about PioProperties
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {faqSections.map((section, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-2">
                {section.question}
              </h2>
              <p className="text-gray-700">{section.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
