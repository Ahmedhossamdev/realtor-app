import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import * as jwt from "jsonwebtoken"
import {PrismaService} from "../prisma/prisma.service";


interface JWTPayload{
    name:string,
    id:number,
    iat:number,
    exp:number,
}
@Injectable()

export class AuthGuard implements CanActivate{
    // 1) Determine the UserTypes than can execute the called endpoint
    // 2) Grab the jwt from the request header and verified
    // 3) Database request to get user by id
    // 4) Determine if the user has permissions
    constructor(private readonly reflector: Reflector , private readonly prismaServices: PrismaService) {}

    async canActivate(context: ExecutionContext) {
        const roles = this.reflector.getAllAndOverride('roles', [
            context.getHandler(),
            context.getClass()
        ]);

        //console.log(roles);
        if (roles?.length){
            const request = context.switchToHttp().getRequest()
            const token   = request.headers?.authorization?.split('Bearer ')[1];
            try{
                const payload = jwt.verify(token , process.env.JWT_SECRET) as JWTPayload;
                const user = await this.prismaServices.user.findUnique({
                    where:{
                        id: payload.id,
                    }
                });
                //console.log(user);
                if (!user){
                    return false;
                }
                if (roles.includes(user.user_type)){
                    return true;
                }
            }
            catch(error){
                return false;
            }
        }
        return false;
    }
}