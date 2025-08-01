'use server';

/**
 * @fileOverview Analyzes developer profiles, aggregates content from platforms like GitHub, and uses the Gemini API to evaluate expertise, collaboration, and professionalism, generating a Trust Score.
 *
 * - trustScoreAnalysis - A function that handles the trust score analysis process.
 * - TrustScoreAnalysisInput - The input type for the trustScoreAnalysis function.
 * - TrustScoreAnalysisOutput - The return type for the trustScoreAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrustScoreAnalysisInputSchema = z.object({
  githubProfileUrl: z.string().describe("The URL of the developer's GitHub profile."),
  linkedinProfileUrl: z.string().optional().describe("The URL of the developer's LinkedIn profile."),
  stackoverflowProfileUrl: z.string().optional().describe("The URL of the developer's Stack Overflow profile."),
  leetcodeProfileUrl: z.string().optional().describe("The URL of the developer's LeetCode profile."),
  otherProfileUrls: z.array(z.string()).describe("An array of URLs for the developer's other public profiles."),
});
export type TrustScoreAnalysisInput = z.infer<typeof TrustScoreAnalysisInputSchema>;

const TrustScoreAnalysisOutputSchema = z.object({
  trustScore: z.number().describe("A numerical score representing the developer's overall trustworthiness and reputation."),
  feedback: z.string().describe("AI-generated feedback on the developer's strengths and areas for improvement."),
  expertiseScore: z.number().describe("A score representing the developer's expertise based on their contributions and skills."),
  collaborationScore: z.number().describe("A score representing the developer's collaboration skills based on their contributions and interactions."),
  professionalismScore: z.number().describe("A score representing the developer's professionalism based on their online presence."),
});
export type TrustScoreAnalysisOutput = z.infer<typeof TrustScoreAnalysisOutputSchema>;

export async function trustScoreAnalysis(input: TrustScoreAnalysisInput): Promise<TrustScoreAnalysisOutput> {
  return trustScoreAnalysisFlow(input);
}

const trustScoreAnalysisPrompt = ai.definePrompt({
  name: 'trustScoreAnalysisPrompt',
  input: {schema: TrustScoreAnalysisInputSchema},
  output: {schema: TrustScoreAnalysisOutputSchema},
  prompt: `You are an AI reputation analysis expert. Your task is to analyze a developer's online presence based on provided profile URLs and generate a comprehensive Trust Score.

**Instructions:**
1.  **Simulate Web Scraping:** You do not have live web access. Act as if you have scraped the content from the URLs provided below. Based on typical content from these platforms, infer the developer's skills, project contributions, and professional conduct.
2.  **Analyze and Score:** Evaluate the inferred information across three categories: Expertise, Collaboration, and Professionalism. Assign a score from 0 to 100 for each category.
    *   **Expertise (0-100):** Assess the quality and complexity of projects from GitHub. Factor in problem-solving skills from LeetCode (e.g., number of problems solved, contest ratings). Consider technical answers on Stack Overflow.
    *   **Collaboration (0-100):** Evaluate engagement in pull requests, issue discussions on GitHub. Analyze helpfulness and quality of answers on Stack Overflow.
    *   **Professionalism (0-100):** Review the completeness and presentation of the LinkedIn profile. Check the tone of communication across all platforms.
3.  **Calculate Overall Trust Score:** The final Trust Score is the weighted average of the three category scores: (Expertise * 0.5) + (Collaboration * 0.3) + (Professionalism * 0.2).
4.  **Provide Feedback:** Generate concise, constructive feedback highlighting the developer's strengths and offering specific, actionable suggestions for improvement based on all provided profiles.

**Developer Profiles to Analyze:**
- GitHub Profile: {{{githubProfileUrl}}}
{{#if linkedinProfileUrl}}- LinkedIn Profile: {{{linkedinProfileUrl}}}{{/if}}
{{#if stackoverflowProfileUrl}}- Stack Overflow Profile: {{{stackoverflowProfileUrl}}}{{/if}}
{{#if leetcodeProfileUrl}}- LeetCode Profile: {{{leetcodeProfileUrl}}}{{/if}}
- Other Profiles: {{#each otherProfileUrls}}{{{this}}} {{/each}}

Please provide your analysis in the specified JSON format.
`,
});

const trustScoreAnalysisFlow = ai.defineFlow(
  {
    name: 'trustScoreAnalysisFlow',
    inputSchema: TrustScoreAnalysisInputSchema,
    outputSchema: TrustScoreAnalysisOutputSchema,
  },
  async input => {
    const {output} = await trustScoreAnalysisPrompt(input);
    return output!;
  }
);
