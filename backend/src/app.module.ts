import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PeopleModule } from './people/people.module';
import { PromotionsModule } from './promotions/promotions.module';

@Module({
  imports: [PeopleModule, PromotionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
