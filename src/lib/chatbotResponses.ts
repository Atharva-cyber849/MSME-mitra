interface IntentResponse {
  intent: string;
  confidence: number;
  response: string;
}

const intentPatterns: { pattern: RegExp; intent: string; responses: string[] }[] = [
  {
    pattern: /mudra|loan|credit|finance|bank|subsidy|interest/i,
    intent: "Loans & Subsidies",
    responses: [
      "The Pradhan Mantri MUDRA Yojana provides loans up to ₹10 lakhs to micro enterprises. There are three categories:\n\n• Shishu: Up to ₹50,000\n• Kishore: ₹50,000 to ₹5 lakhs\n• Tarun: ₹5 lakhs to ₹10 lakhs\n\nYou can apply through any bank, NBFC, or MFI. Would you like to know more about eligibility criteria?",
      "For MSME loans, you can explore:\n\n• MUDRA Loans (up to ₹10L)\n• CGTMSE scheme (collateral-free loans)\n• Stand-Up India (₹10L - ₹1Cr)\n• PMEGP for new enterprises\n\nInterest rates typically range from 8-12% depending on the scheme and your profile.",
    ],
  },
  {
    pattern: /gst|tax|filing|return|invoice|compliance/i,
    intent: "GST & Compliance",
    responses: [
      "For GST Registration, you need:\n\n• PAN card of business/owner\n• Aadhaar card\n• Business address proof\n• Bank account details\n• Photographs\n\nRegistration is mandatory if turnover exceeds ₹40 lakhs (₹20 lakhs for services). Would you like guidance on filing returns?",
      "GST Return Filing Schedule:\n\n• GSTR-1: Outward supplies (11th of next month)\n• GSTR-3B: Monthly summary (20th)\n• GSTR-9: Annual return\n\nComposition scheme is available for businesses with turnover up to ₹1.5 Cr with simplified 1% tax rate.",
    ],
  },
  {
    pattern: /udyam|registration|msme|certificate|classify/i,
    intent: "Udyam Registration",
    responses: [
      "Udyam Registration is FREE and fully online!\n\nSteps:\n1. Visit udyamregistration.gov.in\n2. Enter Aadhaar number\n3. Verify with OTP\n4. Fill business details\n5. Submit and get certificate\n\nClassification:\n• Micro: Investment ≤₹1Cr, Turnover ≤₹5Cr\n• Small: Investment ≤₹10Cr, Turnover ≤₹50Cr\n• Medium: Investment ≤₹50Cr, Turnover ≤₹250Cr",
    ],
  },
  {
    pattern: /scheme|vishwakarma|startup|support|government|pm/i,
    intent: "Government Schemes",
    responses: [
      "Popular MSME Schemes:\n\n🔶 PM Vishwakarma: For traditional artisans, ₹3L loan at 5%\n🔶 MUDRA Yojana: Loans up to ₹10L\n🔶 Stand-Up India: ₹10L-1Cr for SC/ST/Women\n🔶 PMEGP: Up to ₹50L for new enterprises\n🔶 CGTMSE: Collateral-free loans up to ₹5Cr\n\nWhich scheme would you like to know more about?",
      "State-specific schemes are also available! Tell me your state, and I can provide information about local MSME support programs, subsidies, and incentives available for your business.",
    ],
  },
  {
    pattern: /license|permit|fssai|trade|shop|legal/i,
    intent: "Licensing & Permits",
    responses: [
      "Common Licenses for MSMEs:\n\n📋 Trade License: From local municipality\n📋 FSSAI: For food businesses\n📋 Shop & Establishment: State labor dept\n📋 Fire Safety: For certain businesses\n📋 Pollution Control: For manufacturing\n\nRequirements vary by state and business type. What kind of business are you planning?",
    ],
  },
  {
    pattern: /hi|hello|hey|namaste|help|start/i,
    intent: "Greeting",
    responses: [
      "Namaste! 🙏 Welcome to the MSME Business Support Chatbot.\n\nI can help you with:\n• Government schemes & subsidies\n• Loan information\n• GST & compliance\n• Udyam registration\n• Licensing & permits\n\nWhat would you like to know about?",
    ],
  },
];

const fallbackResponses = [
  "I'm not fully confident about this query. For accurate information, please contact the official MSME helpline at 1800-XXX-XXXX or visit msme.gov.in",
  "I couldn't find specific information about your query. Would you like to:\n\n• Rephrase your question?\n• Connect with human support?\n• Browse our FAQs?",
];

export const getIntentResponse = (message: string): IntentResponse => {
  for (const { pattern, intent, responses } of intentPatterns) {
    if (pattern.test(message)) {
      const confidence = 0.75 + Math.random() * 0.2; // 75-95% confidence
      return {
        intent,
        confidence,
        response: responses[Math.floor(Math.random() * responses.length)],
      };
    }
  }

  // Fallback for unrecognized queries
  return {
    intent: "Unknown",
    confidence: 0.3 + Math.random() * 0.15, // 30-45% confidence
    response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
  };
};
