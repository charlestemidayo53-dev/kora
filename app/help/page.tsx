import Link from "next/link";

export const metadata = {
  title: "Help Center | Kora Marketplace",
  description: "Answers to common questions about buying and selling on Kora Marketplace.",
};

export default function HelpPage() {
  const pageWrapperClasses = "min-h-screen bg-[#f0faf4]";
  const headerClasses = "bg-[#1a4731] text-white py-12 px-6";
  const headerInnerClasses = "max-w-4xl mx-auto";
  const headerTitleClasses = "text-3xl md:text-4xl font-bold mb-2";
  const headerSubtitleClasses = "text-[#d4ecdd] text-sm";
  const contentWrapperClasses = "max-w-4xl mx-auto px-6 py-10";
  const cardClasses = "bg-white border border-[#d4ecdd] rounded-lg shadow-sm p-6 md:p-10";
  const categoryClasses = "mb-8";
  const categoryTitleClasses = "text-xl font-semibold text-[#1a4731] mb-3";
  const faqItemClasses = "mb-4 last:mb-0";
  const faqQuestionClasses = "font-semibold text-[#1a4731] mb-1";
  const faqAnswerClasses = "text-gray-700 leading-relaxed";
  const contactBoxClasses = "bg-[#f0faf4] border border-[#d4ecdd] rounded-lg p-6 mt-2";
  const paragraphClasses = "text-gray-700 leading-relaxed mb-2";
  const backLinkClasses = "inline-block mt-6 text-[#2e8b5a] hover:text-[#1a4731] hover:underline text-sm";

  const faqCategories = [
    {
      title: "Getting Started",
      items: [
        {
          question: "How do I create an account?",
          answer: "Click Register on the homepage, provide your business details, and verify your email or phone number to activate your account.",
        },
        {
          question: "Can I use Kora as both a buyer and a seller?",
          answer: "Yes. A single account can browse and purchase products, and can also list products for sale once seller details are added to your profile.",
        },
      ],
    },
    {
      title: "Buying on Kora",
      items: [
        {
          question: "How do I place an order?",
          answer: "Add products to your cart from the marketplace or product detail page, then proceed to checkout to confirm quantities and delivery details with the seller.",
        },
        {
          question: "How do I request a quote for a large order?",
          answer: "Use the Request for Quotation (RFQ) option on the homepage or a product page to send your requirements directly to suppliers.",
        },
      ],
    },
    {
      title: "Selling on Kora",
      items: [
        {
          question: "How do I list a product?",
          answer: "Go to your seller dashboard and select Add Product, then fill in the category, price, minimum order quantity, location, and images.",
        },
        {
          question: "How do I manage incoming orders?",
          answer: "Your seller dashboard shows all orders and inquiries, where you can confirm, message the buyer, or update order status.",
        },
      ],
    },
    {
      title: "Payments and Disputes",
      items: [
        {
          question: "What payment protection is available?",
          answer: "Eligible orders can use Kora's escrow option, which holds buyer payment until delivery is confirmed. See our Refund and Dispute Policy for details.",
        },
        {
          question: "What do I do if there is a problem with an order?",
          answer: "Raise the issue through the order or messaging tools within seven days of delivery. Our team will review the details and help reach a resolution.",
        },
      ],
    },
    {
      title: "Account and Security",
      items: [
        {
          question: "How do I update my profile or avatar?",
          answer: "Go to Profile Settings to update your business details, contact information, and profile photo.",
        },
        {
          question: "I suspect unauthorized access to my account. What should I do?",
          answer: "Change your password immediately and contact our support team using the details below.",
        },
      ],
    },
  ];

  return (
    <div className={pageWrapperClasses}>
      <header className={headerClasses}>
        <div className={headerInnerClasses}>
          <h1 className={headerTitleClasses}>Help Center</h1>
          <p className={headerSubtitleClasses}>Kora Marketplace</p>
        </div>
      </header>

      <div className={contentWrapperClasses}>
        <div className={cardClasses}>
          <p className={paragraphClasses}>
            Find answers to common questions about buying, selling, and using
            Kora Marketplace. If you can&apos;t find what you&apos;re looking for,
            contact our support team below.
          </p>

          {faqCategories.map(function renderCategory(category) {
            return (
              <div key={category.title} className={categoryClasses}>
                <h2 className={categoryTitleClasses}>{category.title}</h2>
                {category.items.map(function renderFaqItem(item) {
                  return (
                    <div key={item.question} className={faqItemClasses}>
                      <p className={faqQuestionClasses}>{item.question}</p>
                      <p className={faqAnswerClasses}>{item.answer}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}

          <div className={contactBoxClasses}>
            <p className={paragraphClasses + " mb-1"}>Still need help?</p>
            <p className={paragraphClasses + " mb-1"}>Email: korasupport1@gmail.com</p>
            <p className={paragraphClasses + " mb-0"}>Our team typically responds within 24 to 48 hours.</p>
          </div>

          <Link href="/" className={backLinkClasses}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}