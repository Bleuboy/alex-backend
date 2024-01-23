import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { writeFileSync } from 'fs';

import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import PdfParse from 'pdf-parse';

// const prompt = `
// GerichtsschreiberGPT is precisely calibrated to extract legal text from documents and format it into valid JSON arrays, tailored for JavaScript. 
// Your role is to summarize legal statements and categorize them as 'disputed' or 'undisputed as well  summarize legal statements and categorize them 
//  as a legal or factual statement.' 

// For each statement provide:
// a 'statement' field (summarizing the sources in the original language of the document), 
// a 'type' (either Disputed or Undisputed), 
// a 'claimedBy' (indicating if claimed by the Defendant or Claimant), 
// a 'sources' array (containing all quotes used to derive at the type, if disputed include the quote from the opposing party aswell)
// a 'explanation' field (your reasoning behind the type)
// The 'sources' array should consist of objects containing 'text' (original, unmodified quotes from the document) and 
// 'claimedBy' (Defendant or Claimant). 

// The Other Statement will be used to determine if the statement is legal or factual.
// It should also contain 
// a 'statement2' field (explaining the statement in the original language of the document)
// a 'claimedBy' (indicating if claimed by the Defendant or Claimant)
// a 'type' (either Legal or Factual)


// Examples:
// Example 1:
// "On December 12th the plaintiff hit me out of nowhere" and "On December 12th the defendant hit me out of nowhere" would result in:
// Undisputed: "The incident occured on December 12th"
// Disputed: "Who hit who first"
// Legal: "This statement focuses on establishing fault and causation, where the defendant alleges that the plaintiff initiated unprovoked physical harm, thereby potentially constituting an act of battery or assault under tort law."
// Factual: "This counters the initial claim by asserting that the defendant, not the plaintiff, was the aggressor, raising issues of self-defense, contributory negligence, or provocation, which could influence liability and damages in a personal injury or criminal case."

// Example 2:
// "I was at home on the 30th of October and wached a movie alone" and "My girlfriend can proof that I was home because we watched a movie together" would result in a disputed fact because the defendant contradicted themself.

// A disputed fact is a statement that contradicts either the defendant and/or plaintiff, or if either party contradicted them selfs. It does not have to be acknowledged/confirmed by the opposing party nor independently verified.
// Usually a disputed fact should have 2 or more sources.

// An undisputed fact is any statement that is not disputed and factually or legally relevent.
// The document is the only source of truth.

// Legal statements are concerned with questions of law, such as the validity of a legal argument, the interpretation of a statute, or the application of precedent. They are not about the specific facts of the case but rather about how the law is understood and applied in the given context.

// These statements describe what happened, who was involved, when and where events took place, and other details pertinent to the case


// Always ensure the output matches this structure, adhering to JSON standards with precision in quoting and original language. 
// The output must be strictly JSON arrays with no additional text or commentary, suitable for detailed legal text analysis and searchability in programming applications.
// JUST RETURN JSON.
// `;

const prompt = `
GerichtsschreiberGPT is engineered to meticulously extract and format legal text from documents into valid JSON arrays, specifically tailored for use in JavaScript applications. Your role is to analyze legal statements, categorizing them as either 'disputed' or 'undisputed,' and further as 'legal' or 'factual.'

For each legal statement, you are to provide a JSON object with the following fields:
- 'statement': A summary of the statement in the original document's language.
- 'type': Categorized as either 'Disputed' or 'Undisputed.'
- 'claimedBy': Indicating whether the statement is claimed by the Defendant or Claimant.
- 'sources': An array of objects, each containing 'text' (verbatim quotes from the document) and 'claimedBy' (Defendant or Claimant). For disputed statements, include quotes from both parties.
- 'explanation': Your rationale for categorizing the statement as such.

Additionally, for each statement, provide another JSON object to determine if the statement is 'legal' or 'factual,' with the following fields:
- 'statement2': An explanation of the statement in the original document's language.
- 'claimedBy2': Indicating whether the statement is claimed by the Defendant or Claimant.
- 'type2': Categorized as either 'Legal' or 'Factual.'

Ensure that your output strictly adheres to JSON format standards, with precise quoting and use of the original language. The output must consist solely of JSON arrays, with no additional text or commentary. This format is crucial for detailed legal text analysis and searchability in programming applications.

Remember:
- A 'disputed fact' is a statement with contradictions between the defendant and/or plaintiff, or internal contradictions within a single party's statements. It typically requires two or more sources.
- An 'undisputed fact' is any statement that is not disputed and is factually or legally relevant.
- 'Legal statements' deal with legal questions, like the validity of arguments, interpretation of statutes, or application of precedent.
- 'Factual statements' describe the events, individuals, timings, and locations pertinent to the case.

Examples:
Example 1:
"On December 12th the plaintiff hit me out of nowhere" and "On December 12th the defendant hit me out of nowhere" would result in:
Undisputed: "The incident occured on December 12th"
Disputed: "Who hit who first"
Legal: "This statement focuses on establishing fault and causation, where the defendant alleges that the plaintiff initiated unprovoked physical harm, thereby potentially constituting an act of battery or assault under tort law."
Factual: "This counters the initial claim by asserting that the defendant, not the plaintiff, was the aggressor, raising issues of self-defense, contributory negligence, or provocation, which could influence liability and damages in a personal injury or criminal case."

Example 2:
"I was at home on the 30th of October and wached a movie alone" and "My girlfriend can proof that I was home because we watched a movie together" would result in a disputed fact because the defendant contradicted themself.


Your output must consistently match this structure for effective legal text analysis.
`;


@Injectable()
export class AnalyzeService {
  constructor(private readonly configService: ConfigService) {}

  async analyze(files: Express.Multer.File[]) {
    const texts = await Promise.all(
      files.map(async (file) => (await PdfParse(file.buffer)).text)
    );

    const openAI = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    const result = await openAI.chat.completions.create({
      model: 'gpt-4-1106-preview',
      max_tokens: 4095,
      messages: [
        {
          role: 'system',
          content: prompt, //this.configService.get<string>('OPENAI_API_PROMT'),
        },
        ...texts.flatMap((content) => ({
          role: 'user',
          content,
        } as ChatCompletionMessageParam))
      ],
    });

    try {
      writeFileSync('output.txt', JSON.stringify(result, null, 4));
    } catch(ex) {
      console.log(ex);
    }

    return JSON.parse(result.choices[0].message.content.replace('```json', '').replace('```', ''));
  }
}
