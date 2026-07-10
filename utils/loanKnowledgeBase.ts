// Rule-based loan Q&A used as the fallback when no ANTHROPIC_API_KEY is configured.
export function getKnowledgeBaseResponse(input: string): string {
  const lowercaseInput = input.toLowerCase()

  if (lowercaseInput.includes("eligib") || lowercaseInput.includes("qualify")) {
    return "To qualify for a loan, lenders typically look at:\n\n• Credit Score: Generally 650+ for personal loans, 620+ for mortgages\n• Income: Stable employment with sufficient income to cover EMIs\n• Debt-to-Income Ratio: Usually below 40%\n• Employment History: At least 2 years of stable employment\n• Age: Between 21-60 years\n\nWould you like to know about specific loan eligibility criteria?"
  }

  if (lowercaseInput.includes("interest") || lowercaseInput.includes("rate")) {
    return "Interest rates vary by loan type and your credit profile:\n\n• Personal Loans: 10.5% - 24% per annum\n• Home Loans: 8.5% - 11.5% per annum\n• Car Loans: 8.7% - 14% per annum\n• Education Loans: 9% - 15% per annum\n\nYour credit score significantly impacts the rate you'll receive. Higher scores (750+) get the best rates. Use our comparison tool to find the lowest rates!"
  }

  if (lowercaseInput.includes("emi") || lowercaseInput.includes("payment") || lowercaseInput.includes("installment")) {
    return "EMI (Equated Monthly Installment) is calculated using:\n\nFormula: EMI = [P × R × (1+R)^N] / [(1+R)^N-1]\n\nWhere:\n• P = Principal loan amount\n• R = Monthly interest rate\n• N = Loan tenure in months\n\n💡 Tip: Use our Repayment Plan Simulator to calculate your exact EMI and see how prepayments can reduce your total interest!"
  }

  if (lowercaseInput.includes("credit score") || lowercaseInput.includes("cibil")) {
    return "Credit Score Ranges & What They Mean:\n\n• 750-900: Excellent - Best rates & quick approval\n• 650-749: Good - Competitive rates available\n• 550-649: Fair - Limited options, higher rates\n• Below 550: Poor - Difficult to get approved\n\nImprove Your Score:\n✓ Pay all bills on time\n✓ Keep credit utilization below 30%\n✓ Avoid multiple loan applications\n✓ Check credit report for errors"
  }

  if (lowercaseInput.includes("document") || lowercaseInput.includes("paper") || lowercaseInput.includes("proof")) {
    return "Common Documents Required for Loan Applications:\n\n📄 Identity Proof: PAN card, Aadhaar, Passport, Voter ID\n📄 Address Proof: Utility bills, rental agreement, Aadhaar\n📄 Income Proof: Salary slips (3-6 months), bank statements, ITR\n📄 Employment Proof: Employment certificate, offer letter\n📄 Additional: Form 16, bank statements (6-12 months)\n\nFor self-employed: Business proof, GST registration, audited financials required."
  }

  if (lowercaseInput.includes("type") && lowercaseInput.includes("loan")) {
    return "Popular Loan Types We Can Help You With:\n\n🏠 Home Loan: 8.5%-11.5% | Up to 30 years\n🚗 Car Loan: 8.7%-14% | Up to 7 years\n💼 Personal Loan: 10.5%-24% | Up to 5 years\n🎓 Education Loan: 9%-15% | Up to 15 years\n💳 Business Loan: 11%-20% | Up to 10 years\n🏗️ Property Loan: 9%-13% | Up to 20 years\n\nWhich loan type interests you?"
  }

  if (lowercaseInput.includes("prepay") || lowercaseInput.includes("foreclos") || lowercaseInput.includes("early")) {
    return "Prepayment & Foreclosure Information:\n\n✅ Benefits:\n• Reduce total interest paid\n• Become debt-free faster\n• Improve credit score\n\n⚠️ Things to Consider:\n• Prepayment charges: 2-5% for some loans\n• Tax benefits on home loans may reduce\n• Lock-in periods may apply\n\n💡 Use our Repayment Simulator to see how prepayments impact your loan!"
  }

  if (lowercaseInput.includes("compar") || lowercaseInput.includes("best") || lowercaseInput.includes("which")) {
    return "🔍 Comparing Loans? Consider These Factors:\n\n1. Interest Rate: Lower is better, but check for hidden charges\n2. Processing Fee: 0.5%-3% of loan amount\n3. Tenure Flexibility: Longer tenure = lower EMI but higher interest\n4. Prepayment Options: Zero prepayment charges preferred\n5. Approval Time: Some lenders offer instant approval\n\n👉 Try our Loan Comparison Tool to compare multiple offers instantly!"
  }

  if (lowercaseInput.includes("how long") || lowercaseInput.includes("process") || lowercaseInput.includes("time")) {
    return "Typical Loan Processing Times:\n\n⚡ Personal Loan: 24-48 hours (instant for pre-approved)\n🏠 Home Loan: 7-21 days\n🚗 Car Loan: 2-7 days\n🎓 Education Loan: 7-15 days\n\nFactors Affecting Speed:\n• Document completeness\n• Credit score\n• Loan amount\n• Verification requirements\n\n💡 Have all documents ready for faster approval!"
  }

  if (lowercaseInput.includes("reject") || lowercaseInput.includes("denied") || lowercaseInput.includes("refuse")) {
    return "Common Reasons for Loan Rejection:\n\n❌ Low credit score (below 650)\n❌ Insufficient income\n❌ High existing debt\n❌ Incomplete documentation\n❌ Employment instability\n❌ Errors in application\n\nWhat to Do Next:\n✓ Ask for rejection reason\n✓ Improve credit score\n✓ Reduce existing debts\n✓ Consider a co-applicant\n✓ Try for a lower amount\n✓ Wait 3-6 months before reapplying"
  }

  if (lowercaseInput.includes("secured") || lowercaseInput.includes("collateral") || lowercaseInput.includes("unsecured")) {
    return "Secured vs Unsecured Loans:\n\n🔒 Secured Loans (with collateral):\n• Lower interest rates (8-12%)\n• Higher loan amounts\n• Longer tenure\n• Risk: Can lose asset\n• Examples: Home, car, gold loans\n\n🔓 Unsecured Loans (no collateral):\n• Higher interest rates (12-24%)\n• Lower loan amounts\n• Shorter tenure\n• No asset risk\n• Examples: Personal, education loans\n\nWhich type suits your needs?"
  }

  if (lowercaseInput.includes("hello") || lowercaseInput.includes("hi") || lowercaseInput.includes("hey") || lowercaseInput.includes("help")) {
    return "👋 Hello! I'm your AI Loan Assistant. I can help you with:\n\n• Loan eligibility & requirements\n• Interest rates & EMI calculations\n• Document requirements\n• Loan comparison & recommendations\n• Credit score guidance\n• Application process & timelines\n\nWhat would you like to know about loans today?"
  }

  return "I understand you're asking about loans. Here's what I can help you with:\n\n💡 Try asking me about:\n• \"What documents do I need?\"\n• \"How to calculate EMI?\"\n• \"What's a good credit score?\"\n• \"Compare loan types\"\n• \"Prepayment benefits\"\n\nOr use our tools:\n🔧 Loan Comparison Tool - Compare multiple lenders\n📊 Repayment Simulator - Calculate EMI & savings\n\nWhat specific aspect of loans would you like to explore?"
}
