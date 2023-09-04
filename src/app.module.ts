import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthController } from './user/auth/auth.controller';
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './home/home.module';
import {APP_GUARD, APP_INTERCEPTOR} from "@nestjs/core";
import {UserInterceptor} from "./user/interceptors/user.interceptor";
import {AuthService} from "./user/auth/auth.service";
import {AuthGuard} from "./guards/auth.guard";

@Module({
  imports: [UserModule, PrismaModule, HomeModule],
  controllers: [AppController, AuthController],
  providers: [AppService , AuthService ,{
    provide: APP_INTERCEPTOR,
    useClass: UserInterceptor
  },
  ],
})
export class AppModule {}
