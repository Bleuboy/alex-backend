import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { AnalyzeService } from './analyze.service';

@Controller('analyze')
export class AnalyzeController {
  constructor(private analyzeService: AnalyzeService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async analyze(@UploadedFiles() files: Express.Multer.File[]) {
    return this.analyzeService.analyze(files);
  }
}
