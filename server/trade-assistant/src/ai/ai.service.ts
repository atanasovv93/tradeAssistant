/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private client: OpenAI;

  constructor(private configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('NVIDIA_API_KEY'),
      baseURL: this.configService.get<string>('BASE_AI_URL'),
    });
  }

  async ask(prompt: string) {
  try {
    const completion = await this.client.chat.completions.create({
      model: 'z-ai/glm-5.1',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return completion.choices[0].message.content;
  } catch (err: any) {
    console.error(err);
    console.error(err.status);
    console.error(err.message);
    console.error(err.error);

    throw err;
  }
}
}
