import {ConflictException, Injectable , HttpException} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from "bcryptjs"
import {UserType} from "@prisma/client";
import * as jwt from "jsonwebtoken";
import * as process from "process";

interface SignupParams {
    email: string;
    password: string;
    name: string;
    phone: string;
}
interface SigninParams {
    email: string;
    password: string;
}



@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService) {}



    private async generateJWT(name : string , id : number){
        return jwt.sign({
            name,
            id,
        }, process.env.JWT_SECRET , {
            expiresIn: 3600000
        })
    }
    async signup({ email , password , name , phone}: SignupParams) {
      const userExist = await this.prismaService.user.findUnique({
          where:{
              email,
          }
      });
      if (userExist){
          throw new ConflictException()
      }
      const hashedPassword = await bcrypt.hash(password , 10);

      const user = await this.prismaService.user.create({
          data:{
              email,
              name,
              phone,
              password: hashedPassword,
              user_type: UserType.BUYER,
          }
      });

     return await this.generateJWT(name, user.id);

    }
    async signin({email , password}: SigninParams){
       const user = await this.prismaService.user.findUnique({
           where:{
               email
           }
       })

        if (!user){
            throw new HttpException("Invalid credentials", 400);
        }
        const hashedPassword = user.password;
        const isValidPassword = await  bcrypt.compare(password , hashedPassword);

        if (!isValidPassword){
            throw new HttpException("Invalid credentials",400);
        }

        return await this.generateJWT(user.name, user.id);
    }
}

