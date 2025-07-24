import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { User } from 'src/models/user.entity';
import { SurveyResponse } from 'src/models/surveyResponse.entity';
import { ResponseSchema } from 'src/models/responseSchema.entity';

@Injectable()
export class InternalService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
    @InjectRepository(SurveyResponse)
    private readonly surveyResponseRepository: MongoRepository<SurveyResponse>,
    @InjectRepository(ResponseSchema)
    private readonly responseSchemaRepository: MongoRepository<ResponseSchema>,
  ) {}

  async getUserById(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { _id: userId },
      });

      if (!user) {
        return {
          success: false,
          message: '用户不存在',
          data: null,
        };
      }

      return {
        success: true,
        message: '查询成功',
        data: {
          _id: user._id,
          username: user.username,
          createDate: user.createdAt,
          updateDate: user.updatedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `查询失败: ${error.message}`,
        data: null,
      };
    }
  }

  async getUserSubmissions(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    try {
      const skip = (page - 1) * limit;

      const [submissions, total] = await Promise.all([
        this.surveyResponseRepository.find({
          where: { userId },
          skip,
          take: limit,
          order: { createdAt: 'DESC' },
        }),
        this.surveyResponseRepository.count({
          where: { userId },
        }),
      ]);

      return {
        success: true,
        message: '查询成功',
        data: {
          list: submissions.map((item) => ({
            _id: item._id,
            surveyPath: item.surveyPath,
            pageId: item.pageId,
            data: item.data,
            clientTime: item.clientTime,
            diffTime: item.diffTime,
            createDate: item.createdAt,
            channelId: item.channelId,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `查询失败: ${error.message}`,
        data: null,
      };
    }
  }

  async getSurveyContent(surveyId: string) {
    try {
      const survey = await this.responseSchemaRepository.findOne({
        where: { pageId: surveyId },
      });

      if (!survey) {
        return {
          success: false,
          message: '问卷不存在',
          data: null,
        };
      }

      return {
        success: true,
        message: '查询成功',
        data: {
          _id: survey._id,
          pageId: survey.pageId,
          surveyPath: survey.surveyPath,
          title: survey.title,
          code: survey.code,
          createDate: survey.createdAt,
          updateDate: survey.updatedAt,
          isDeleted: survey.isDeleted,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `查询失败: ${error.message}`,
        data: null,
      };
    }
  }
}
