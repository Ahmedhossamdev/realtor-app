import {ClassSerializerInterceptor, Module} from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import {PrismaModule} from "../prisma/prisma.module";
import {APP_GUARD, APP_INTERCEPTOR} from "@nestjs/core";
import {AuthGuard} from "../guards/auth.guard";

@Module({
  imports: [PrismaModule],
  controllers: [HomeController],
  providers: [HomeService , {
     provide: APP_INTERCEPTOR,
     useClass: ClassSerializerInterceptor,
  },
  ],
})
export class HomeModule {}
