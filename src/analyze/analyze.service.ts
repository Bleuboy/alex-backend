import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

//import OpenAI from 'openai';
import PdfParse from 'pdf-parse';

@Injectable()
export class AnalyzeService {
  constructor(private readonly configService: ConfigService) {}

  async analyze(files: Express.Multer.File[]) {
    const file = files[0];

    const data = await PdfParse(file.buffer);

    /*const openAI = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    const result = await openAI.chat.completions.create({
      model: 'gpt-4-1106-preview',
      max_tokens: 4095,
      messages: [
        {
          role: 'system',
          content: this.configService.get<string>('OPENAI_API_PROMT'),
        },
        {
          role: 'user',
          content: data.text,
        },
      ],
    });

    return result.choices[0].message.content;*/
  }
}
