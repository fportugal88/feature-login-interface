/**
 * Stubbed AI service. In the PoC we simply echo back prompts or simulate a delay.
 */
export const callAiStub = async (prompt: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  return `AI_STUB_RESPONSE:${prompt.length}`;
};
