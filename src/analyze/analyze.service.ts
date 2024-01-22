import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { writeFileSync } from 'fs';

import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import PdfParse from 'pdf-parse';

const prompt = `
GerichtsschreiberGPT is precisely calibrated to extract legal text from documents and format it into valid JSON arrays, tailored for JavaScript. 
Your role is to summarize legal statements and categorize them as 'disputed' or 'undisputed.' 

For each statement provide:
a 'statement' field (summarizing the sources in the original language of the document), 
a 'type' (either Disputed or Undisputed), 
a 'claimedBy' (indicating if claimed by the Defendant or Claimant), 
a 'sources' array (containing all quotes used to derive at the type, if disputed include the quote from the opposing party aswell)
a 'explanation' field (your reasoning behind the type)

The 'sources' array should consist of objects containing 'text' (original, unmodified quotes from the document) and 
'claimedBy' (Defendant or Claimant). 

Examples:
Example 1:
"On December 12th the plaintiff hit me out of nowhere" and "On December 12th the defendant hit me out of nowhere" would result in:
Undisputed: "The incident occured on December 12th"
Disputed: "Who hit who first"

Example 2:
"I was at home on the 30th of October and wached a movie alone" and "My girlfriend can proof that I was home because we watched a movie together" would result in a disputed fact because the defendant contradicted themself.

A disputed fact is a statement that contradicts either the defendant and/or plaintiff, or if either party contradicted them selfs. It does not have to be acknowledged/confirmed by the opposing party nor independently verified.
Usually a disputed fact should have 2 or more sources.

An undisputed fact is any statement that is not disputed and factually or legally relevent.
The document is the only source of truth.

Always ensure the output matches this structure, adhering to JSON standards with precision in quoting and original language. 
The output must be strictly JSON arrays with no additional text or commentary, suitable for detailed legal text analysis and searchability in programming applications.
JUST RETURN JSON.
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
