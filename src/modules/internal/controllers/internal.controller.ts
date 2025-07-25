import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InternalService } from '../services/internal.service';
import {
  GetUserDto,
  GetUserSubmissionsDto,
  GetSurveyContentDto,
} from '../dto/internal.dto';
import { InternalWhitelistGuard } from 'src/guards/internal-whitelist.guard';

@ApiTags('internal')
@Controller('/api/internal')
@UseGuards(InternalWhitelistGuard)
export class InternalController {
  constructor(private readonly internalService: InternalService) {}

  @Post('/user')
  @HttpCode(200)
  @ApiOperation({ summary: '查询用户信息' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getUser(@Body() body: GetUserDto) {
    return await this.internalService.getUserById(body.userId);
  }

  @Post('/user/submissions')
  @HttpCode(200)
  @ApiOperation({ summary: '查询用户提交记录' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getUserSubmissions(@Body() body: GetUserSubmissionsDto) {
    return await this.internalService.getUserSubmissions(
      body.userId,
      body.page,
      body.limit,
    );
  }

  @Post('/survey/content')
  @HttpCode(200)
  @ApiOperation({ summary: '按问卷ID查询问卷内容' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getSurveyContent(@Body() body: GetSurveyContentDto) {
    return await this.internalService.getSurveyContent(body.surveyId);
  }
}
