import {Controller, Post, Body, Param, UnauthorizedException, ParseEnumPipe, Get} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {GenerateProductKeyDto, SigninDto, SignupDto} from "../auth.dto";
import {UserType} from "@prisma/client";
import * as bcrypt from "bcryptjs";
import {User, UserInfo} from "../decorators/user.decorator";
import {Roles} from "../../decorators/roles.decorator";

@Controller('/auth')

export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('/signup/:userType')
    async signup(@Body() body: SignupDto , @Param('userType' , new ParseEnumPipe(UserType)) userType: UserType) {
        if (userType !== UserType.BUYER){
            if(!body.productKey){
                throw new UnauthorizedException();
            }

            const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_SECRET}`;
            const isValidProductKey =  await bcrypt.compare(validProductKey , body.productKey);

            if (!isValidProductKey){
                throw new UnauthorizedException();
            }
        }
        if (userType === 'BUYER' || userType === 'ADMIN'){
            if (body.productKey){
                throw new UnauthorizedException();
            }
        }
        return this.authService.signup(body , userType);
    }

    @Post('/signin')
    login(@Body() body: SigninDto){
        return this.authService.login(body);
    }
    @Post('/key')
    generateProductKey(
        @Body() {userType , email}:GenerateProductKeyDto
    ){
        return this.authService.generateProductKey(email , userType)
    }

    @Get("/me")
    me(@User() user : UserInfo){
        return user;
    }
}
/*

 realtor have a email xyxy.com
 so after that we will genreate a email and usertype hashed
 */

