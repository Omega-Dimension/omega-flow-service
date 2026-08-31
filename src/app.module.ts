import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './database/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ClientModule } from './client/client.module';
import { ProjectModule } from './project/project.module';
import { InvoiceModule } from './invoice/invoice.module';
import { TimelogModule } from './timelog/timelog.module';
import { AuthModule } from './auth/auth.module';
import { ClientProfileModule } from './client-profile/client-profile.module';
import { ContractModule } from './contract/contract.module';
import { FreelancerProfileModule } from './freelancer-profile/freelancer-profile.module';
import { MeetingModule } from './meeting/meeting.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { ReviewModule } from './review/review.module';
import { FirebaseModule } from './firebase/firebase.module';
import { CountryModule } from './common/country/country.module';
import { SocketModule } from './socket/socket.module';
import { NotificationModule } from './notification/notification.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(databaseConfig),
    SocketModule,
    UserModule,
    ClientModule,
    ProjectModule,
    InvoiceModule,
    TimelogModule,
    AuthModule,
    ClientProfileModule,
    ContractModule,
    FreelancerProfileModule,
    MeetingModule,
    PortfolioModule,
    ReviewModule,
    FirebaseModule,
    CountryModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
