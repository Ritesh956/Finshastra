import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

// Function to remove markdown formatting (asterisks)
const cleanMarkdown = (text: string) => {
  return text.replace(/\*\*/g, '').replace(/\*/g, '')
}

const faqData = [
  {
    category: "Eligibility & Application",
    icon: "✅",
    questions: [
      {
        question: "What are the basic eligibility criteria for a personal loan?",
        answer:
          "To qualify for a personal loan, you typically need:\n\n• **Age**: 21-60 years\n• **Credit Score**: Minimum 650 (750+ for best rates)\n• **Income**: Steady monthly income of ₹15,000+\n• **Employment**: Salaried (6+ months) or self-employed (2+ years)\n• **Debt-to-Income Ratio**: Below 40%\n\nHigher credit scores and stable income improve approval chances and get you lower interest rates.",
      },
      {
        question: "How long does the loan approval process take?",
        answer:
          "Loan approval timelines vary by type:\n\n⚡ **Personal Loans**: 24-48 hours (instant for pre-approved customers)\n🏠 **Home Loans**: 7-21 working days\n🚗 **Car Loans**: 2-7 working days\n🎓 **Education Loans**: 7-15 working days\n💼 **Business Loans**: 5-14 working days\n\nFactors affecting speed: document completeness, credit score, property valuation (for secured loans), and lender's internal processes. Having all documents ready can significantly speed up approval.",
      },
      {
        question: "What documents are required for loan application?",
        answer:
          "**Common Documents for All Loans**:\n\n📄 **Identity Proof**: PAN Card, Aadhaar, Passport, or Voter ID\n📄 **Address Proof**: Aadhaar, Utility bills, Rental agreement\n📄 **Income Proof**:\n  • Salaried: Last 3-6 months salary slips, Form 16, bank statements\n  • Self-employed: ITR for 2-3 years, audited financials, GST returns\n📄 **Employment Proof**: Employment letter, appointment letter\n📄 **Bank Statements**: Last 6-12 months\n\n**Additional for Home Loans**: Property documents, sale agreement, NOC from society\n**For Business Loans**: Business registration, partnership deed, GST certificate",
      },
    ],
  },
  {
    category: "Interest Rates & Charges",
    icon: "💰",
    questions: [
      {
        question: "What's the difference between fixed and floating interest rates?",
        answer:
          "**Fixed Interest Rate**:\n✓ Remains constant throughout the loan tenure\n✓ EMI stays the same - easier budgeting\n✓ Usually 0.5-1% higher than floating rates\n✓ Best when rates are expected to rise\n✓ Example: Home loan at 9.5% for entire 20 years\n\n**Floating Interest Rate**:\n✓ Changes with market conditions (linked to repo rate)\n✓ EMI can increase or decrease\n✓ Usually lower starting rate\n✓ Can save money if rates fall\n✓ Example: Home loan starting at 8.5%, may change quarterly\n\n💡 **Recommendation**: Floating rates are generally better for long-term loans (15+ years) as they average out lower. Fixed rates provide peace of mind for short to medium-term loans.",
      },
      {
        question: "What are processing fees and other charges I should know about?",
        answer:
          "**Common Loan Charges**:\n\n💵 **Processing Fee**: 0.5-3% of loan amount (₹500-₹10,000+ depending on loan size)\n💵 **Prepayment Charges**: 2-5% if closed before tenure (often waived for floating rate loans)\n💵 **Late Payment Fee**: ₹500-₹1,500 per instance + penalty interest\n💵 **Bounce Charges**: ₹500-₹750 if EMI auto-debit fails\n💵 **Documentation Charges**: ₹1,000-₹5,000\n💵 **Stamp Duty**: Varies by state (for home loans)\n💵 **Legal Charges**: ₹5,000-₹15,000 (for property verification)\n💵 **Part-Payment Fee**: May apply for partial prepayment\n\n⚠️ **Tip**: Always ask for a complete fee structure in writing before signing. Some lenders offer zero processing fee promotions!",
      },
      {
        question: "How is my EMI calculated?",
        answer:
          "EMI (Equated Monthly Installment) is calculated using this formula:\n\n**EMI = [P × R × (1+R)^N] / [(1+R)^N-1]**\n\nWhere:\n• P = Principal loan amount\n• R = Monthly interest rate (Annual rate ÷ 12 ÷ 100)\n• N = Loan tenure in months\n\n**Example**:\nLoan Amount: ₹10,00,000\nInterest Rate: 10% per annum (0.833% per month)\nTenure: 5 years (60 months)\n\n**EMI = ₹21,247**\nTotal Interest = ₹2,74,820\nTotal Payment = ₹12,74,820\n\n💡 **Use our Repayment Simulator** to calculate your exact EMI and see how prepayments can save you money!",
      },
    ],
  },
  {
    category: "Repayment & Prepayment",
    icon: "💳",
    questions: [
      {
        question: "Can I pay off my loan early? Are there penalties?",
        answer:
          "**Prepayment Rules**:\n\n✅ **Floating Rate Loans**: Usually NO prepayment penalty (as per RBI guidelines)\n⚠️ **Fixed Rate Loans**: May have 2-5% prepayment charges\n⚠️ **Lock-in Period**: Some loans have 6-12 month lock-in before prepayment allowed\n\n**Benefits of Prepayment**:\n• Save significant interest (especially on long-term loans)\n• Become debt-free faster\n• Improve credit score\n• Reduce financial burden\n\n**Example**: Prepaying ₹1,00,000 on a ₹20,00,000 home loan can save ₹3-5 lakhs in interest!\n\n💡 **Strategy**: Make prepayments early in loan tenure for maximum benefit, as initial EMIs have more interest component.",
      },
      {
        question: "What happens if I miss an EMI payment?",
        answer:
          "**Consequences of Missing EMI**:\n\n**Immediate** (1-30 days):\n❌ Late payment fee (₹500-₹1,500)\n❌ Penalty interest (additional 2-3% on overdue amount)\n❌ Reminder calls/messages from lender\n\n**Short-term** (30-90 days):\n❌ Negative impact on credit score (drops by 50-100 points)\n❌ Reported to CIBIL as 'DPD' (Days Past Due)\n❌ Additional charges accumulate\n\n**Long-term** (90+ days):\n❌ Account marked as NPA (Non-Performing Asset)\n❌ Credit score severely damaged (580 or below)\n❌ Legal notice for loan recovery\n❌ For secured loans: Asset repossession/auction\n❌ Difficulty getting future loans\n\n**What to Do**:\n✓ Contact lender immediately\n✓ Request payment restructuring\n✓ Arrange for immediate payment\n✓ Set up auto-debit to avoid future misses",
      },
      {
        question: "Can I transfer my loan to another bank for better rates?",
        answer:
          "Yes! **Loan Balance Transfer** (or refinancing) is possible and can save money:\n\n**When to Consider**:\n• Current loan rate is 1.5-2% higher than market rates\n• You have good credit score (750+)\n• Significant loan tenure remaining (5+ years)\n• Transfer costs are lower than potential savings\n\n**Process**:\n1. Compare offers from other banks\n2. Apply for balance transfer with new lender\n3. New lender pays off old loan\n4. Continue EMI with new lender at lower rate\n\n**Costs Involved**:\n• Processing fee: 0.5-1% of outstanding amount\n• Prepayment charges: Check with current lender\n• Legal/admin fees: ₹5,000-₹15,000\n\n**Example Savings**: Transferring ₹15 lakh home loan with 10 years left from 10.5% to 8.5% = Save ₹2-3 lakhs in interest!\n\n💡 Some banks offer zero balance transfer charges during promotional periods!",
      },
    ],
  },
  {
    category: "Credit Score & Approval",
    icon: "📊",
    questions: [
      {
        question: "What credit score do I need to get a loan approved?",
        answer:
          "**Credit Score Ranges & Impact**:\n\n🌟 **Excellent (750-900)**:\n• Highest approval rate (90%+)\n• Best interest rates (lowest available)\n• Quick approval process\n• Higher loan amounts approved\n• Minimal documentation\n\n✅ **Good (650-749)**:\n• Good approval chances (70-80%)\n• Competitive interest rates\n• Standard processing\n• Moderate loan amounts\n\n⚠️ **Fair (550-649)**:\n• Lower approval rate (40-50%)\n• Higher interest rates (2-4% more)\n• Stricter documentation\n• May need guarantor/co-applicant\n• Lower loan amounts\n\n❌ **Poor (Below 550)**:\n• Very difficult to get approved\n• If approved, very high interest rates\n• Requires strong income proof\n• May need substantial collateral\n\n💡 **Check your score free** at CIBIL, Experian, Equifax, or CRIF High Mark",
      },
      {
        question: "How can I improve my credit score quickly?",
        answer:
          "**Fast-Track Credit Score Improvement**:\n\n**Immediate Actions** (1-3 months):\n✓ Pay all pending dues immediately\n✓ Clear credit card balances (keep utilization below 30%)\n✓ Set up auto-payments for all bills\n✓ Don't close old credit cards (length of history matters)\n✓ Request credit limit increase (improves utilization ratio)\n\n**Short-term** (3-6 months):\n✓ Maintain 100% on-time payments\n✓ Keep credit utilization below 30% consistently\n✓ Don't apply for multiple loans/cards\n✓ Pay more than minimum due on credit cards\n✓ Mix credit types (cards + loans)\n\n**Medium-term** (6-12 months):\n✓ Build long credit history\n✓ Settle any disputed amounts\n✓ Get errors corrected on credit report\n✓ Avoid hard inquiries\n\n**What NOT to Do**:\n❌ Apply for multiple loans simultaneously\n❌ Max out credit cards\n❌ Close old credit accounts\n❌ Ignore credit report errors\n❌ Default on any payments\n\n**Expected Improvement**: Following these strictly can improve score by 50-100 points in 6 months!",
      },
      {
        question: "Why was my loan application rejected?",
        answer:
          "**Common Rejection Reasons**:\n\n❌ **Low Credit Score** (Below 650)\n→ Solution: Improve score over 6-12 months\n\n❌ **Insufficient Income**\n→ Solution: Apply for lower amount or add co-applicant\n\n❌ **High Debt-to-Income Ratio** (Above 40%)\n→ Solution: Pay off existing debts before reapplying\n\n❌ **Unstable Employment**\n→ Solution: Wait for job stability (6+ months same employer)\n\n❌ **Incomplete/Incorrect Documentation**\n→ Solution: Submit all required docs properly\n\n❌ **Multiple Loan Inquiries**\n→ Solution: Wait 3-6 months before next application\n\n❌ **Negative Credit History**\n→ Solution: Clear all dues, wait for history to improve\n\n❌ **Age Factor** (Too young/old)\n→ Solution: Add co-applicant within age limit\n\n**What to Do After Rejection**:\n1. Ask lender for specific rejection reason\n2. Get free credit report and check for issues\n3. Address the root cause\n4. Wait 3-6 months before reapplying\n5. Try different lender with suitable products\n\n💡 Each application creates hard inquiry - multiple rejections hurt score further!",
      },
    ],
  },
  {
    category: "Loan Types & Selection",
    icon: "🏦",
    questions: [
      {
        question: "Which type of loan is best for my needs?",
        answer:
          "**Loan Type Selection Guide**:\n\n🏠 **Home Loan** - Best for:\n• Buying property\n• Lowest interest rates (8.5-11.5%)\n• Longest tenure (up to 30 years)\n• Tax benefits available (up to ₹3.5L)\n• Requires property as collateral\n\n🚗 **Car Loan** - Best for:\n• Vehicle purchase\n• Moderate rates (8.7-14%)\n• Tenure: 1-7 years\n• 80-90% financing available\n\n💼 **Personal Loan** - Best for:\n• Medical emergency, wedding, travel, debt consolidation\n• No collateral needed\n• Quick approval (24-48 hours)\n• Higher rates (10.5-24%)\n• Tenure: 1-5 years\n\n🎓 **Education Loan** - Best for:\n• Higher studies in India/abroad\n• Rates: 9-15%\n• Moratorium period available\n• Tax benefits on interest\n• Up to ₹1.5 crore for abroad studies\n\n💳 **Business Loan** - Best for:\n• Working capital, expansion\n• Rates: 11-20%\n• Requires business proof\n• Flexible tenure\n\n💡 **Use our Loan Comparison Tool** to find the best option for your specific situation!",
      },
      {
        question: "Should I choose a secured or unsecured loan?",
        answer:
          "**Secured Loans** (Collateral Required):\n\n✅ **Advantages**:\n• Lower interest rates (8-14%)\n• Higher loan amounts (up to ₹5 crore+)\n• Longer repayment tenure\n• Easier approval with average credit score\n• Better for large amounts\n\n❌ **Disadvantages**:\n• Risk of losing asset if you default\n• Lengthy approval process\n• Property valuation required\n• Legal documentation complex\n\n**Examples**: Home loan, car loan, loan against property, gold loan\n\n---\n\n**Unsecured Loans** (No Collateral):\n\n✅ **Advantages**:\n• Quick approval (24-48 hours)\n• Minimal documentation\n• No asset risk\n• Flexible end-use\n• Simple process\n\n❌ **Disadvantages**:\n• Higher interest rates (12-24%)\n• Lower loan amounts (up to ₹40 lakh)\n• Shorter tenure (1-5 years)\n• Strict eligibility criteria\n• Requires excellent credit score\n\n**Examples**: Personal loan, education loan, credit card\n\n---\n\n**Choose Based On**:\n• **For large amounts (₹10L+)**: Secured loan\n• **For emergencies**: Unsecured loan\n• **If you have assets**: Secured loan (better rates)\n• **For quick funding**: Unsecured loan\n• **If risk-averse**: Unsecured loan (no asset at stake)",
      },
    ],
  },
]

export function FAQ() {
  return (
    <div className="space-y-6">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Frequently Asked Questions</CardTitle>
              <CardDescription className="text-slate-400">
                Everything you need to know about loans, eligibility, and repayment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-950/30 rounded-lg border border-blue-900">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-300">
                <strong>Can't find your answer?</strong> Try our AI Chatbot for instant, personalized responses to your loan questions!
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-3">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl">{category.icon}</span>
                  <h3 className="text-xl font-bold dark:text-white">{category.category}</h3>
                  <Badge variant="secondary" className="dark:bg-slate-700">
                    {category.questions.length} Questions
                  </Badge>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, questionIndex) => (
                    <AccordionItem 
                      key={questionIndex} 
                      value={`item-${categoryIndex}-${questionIndex}`}
                      className="border-slate-200 dark:border-slate-700"
                    >
                      <AccordionTrigger className="text-left font-semibold text-base dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                        <div className="flex items-start space-x-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                          <span>{item.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-700 dark:text-slate-300 text-base leading-relaxed pl-8">
                        <div className="whitespace-pre-line">{cleanMarkdown(item.answer)}</div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

