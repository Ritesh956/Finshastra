const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const bankOffers = [
  {
    bankName: "ABC Bank",
    loanType: "Personal Loan",
    interestRate: 8.5,
    maxAmount: 500000,
    maxTenure: 60,
    processingFee: 1,
    features: JSON.stringify(["No collateral required", "Flexible repayment options", "Quick approval"]),
  },
  {
    bankName: "XYZ Bank",
    loanType: "Home Loan",
    interestRate: 6.75,
    maxAmount: 5000000,
    maxTenure: 360,
    processingFee: 0.5,
    features: JSON.stringify(["Low interest rates", "Long repayment tenure", "Property insurance included"]),
  },
  {
    bankName: "123 Financial",
    loanType: "Business Loan",
    interestRate: 10,
    maxAmount: 1000000,
    maxTenure: 84,
    processingFee: 2,
    features: JSON.stringify([
      "No security required up to 30 lakhs",
      "Customized repayment options",
      "Dedicated relationship manager",
    ]),
  },
  {
    bankName: "HDFC Bank",
    loanType: "Auto Loan",
    interestRate: 7.25,
    maxAmount: 2000000,
    maxTenure: 84,
    processingFee: 1.5,
    features: JSON.stringify(["Flexible repayment terms", "Quick approval", "Up to 100% on-road funding"]),
  },
  {
    bankName: "SBI",
    loanType: "Education Loan",
    interestRate: 8.15,
    maxAmount: 1500000,
    maxTenure: 180,
    processingFee: 0,
    features: JSON.stringify(["No processing fee", "Moratorium during study period", "Tax benefits under 80E"]),
  },
]

async function main() {
  const count = await prisma.bankOffer.count()
  if (count === 0) {
    await prisma.bankOffer.createMany({ data: bankOffers })
    console.log(`Seeded ${bankOffers.length} bank offers`)
  } else {
    console.log("Bank offers already seeded, skipping")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
