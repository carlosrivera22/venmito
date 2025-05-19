import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PeopleModule } from './people/people.module';
import { PromotionsModule } from './promotions/promotions.module';
import { TransfersModule } from './transfers/transfers.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [PeopleModule, PromotionsModule, TransfersModule, TransactionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
