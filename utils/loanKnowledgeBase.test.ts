import { describe, it, expect } from "vitest"
import { getKnowledgeBaseResponse } from "./loanKnowledgeBase"

describe("getKnowledgeBaseResponse", () => {
  it("answers EMI questions", () => {
    expect(getKnowledgeBaseResponse("How do I calculate my EMI?")).toContain("EMI")
    expect(getKnowledgeBaseResponse("How do I calculate my EMI?")).toContain("Formula")
  })

  it("answers eligibility questions", () => {
    expect(getKnowledgeBaseResponse("Am I eligible for a loan?")).toContain("Credit Score")
  })

  it("answers document questions", () => {
    expect(getKnowledgeBaseResponse("what documents do I need")).toContain("Identity Proof")
  })

  it("greets the user", () => {
    expect(getKnowledgeBaseResponse("hello")).toContain("Loan Assistant")
  })

  it("falls back to a helpful default for unknown input", () => {
    const reply = getKnowledgeBaseResponse("xyzzy quux")
    expect(reply).toContain("Try asking me about")
  })
})
