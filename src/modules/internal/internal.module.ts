import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/models/user.entity';
import { SurveyResponse } from 'src/models/surveyResponse.entity';
import { ResponseSchema } from 'src/models/responseSchema.entity';
import { InternalController } from './controllers/internal.controller';
import { InternalService } from './services/internal.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, SurveyResponse, ResponseSchema])],
  controllers: [InternalController],
  providers: [InternalService],
  exports: [InternalService],
})
export class InternalModule {}
