import {Controller, Post, Body, Param, UnauthorizedException, ParseEnumPipe} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {GenerateProductKeyDto, SigninDto, SignupDto} from "../auth.dto";
import {UserType} from "@prisma/client";
import * as bcrypt from "bcryptjs";

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
        return this.authService.signup(body);
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
}
/*

 realtor have a email xyxy.com
 so after that we will genreate a email and usertype hashed
 */

