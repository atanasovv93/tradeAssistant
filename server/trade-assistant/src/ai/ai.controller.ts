import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  async ask(@Body() body: { messages: { content: string }[] }) {
    const answer = await this.aiService.ask(body.messages?.[0]?.content);

    return {
      success: true,
      answer,
    };
  }
}
