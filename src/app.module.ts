import Joi from 'joi';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AnalyzeModule } from './analyze/analyze.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        OPENAI_API_KEY: Joi.string().required(),
        OPENAI_API_PROMT: Joi.string().required(),
      }),
    }),
    AnalyzeModule,
  ],
})
export class AppModule {}
