import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {HomeResponseDto} from "./dto/home.dto";
import {ProperType} from "@prisma/client";

interface GetHomesParam {
    city?: string;
    price?: {
        gte?:number;
        lte?:number;
    }
    propertyType?: ProperType,
}

@Injectable()


export class HomeService {
    constructor(private readonly  prismaService: PrismaService){

    }
    async getHomes(filter: GetHomesParam): Promise<HomeResponseDto[]>{
        const homes = await this.prismaService.home.findMany({
            select:{
                id : true,
                address : true,
                city:true,
                price:true,
                propertyType : true,
                number_of_bathrooms : true,
                number_of_bedrooms : true,
                images:{
                    select : {
                        url : true,
                    },
                    take: 1
                }
            },
            where: filter,
        });
        if (!homes.length){
            throw new NotFoundException
        }
        return homes.map(home => {
            const fetchHome = {...home , image : home.images[0].url}
            delete fetchHome.images
            return new HomeResponseDto(fetchHome);
            },
        );
    }
    async getHomeById(id: number): Promise<HomeResponseDto> {
       const home = await this.prismaService.home.findUnique({
           select:{
               id : true,
               address : true,
               city:true,
               price:true,
               propertyType : true,
               number_of_bathrooms : true,
               number_of_bedrooms : true,
               images:{
                   select : {
                       url : true,
                   },
                   take: 1
               },
               realtor:{
                 select:{
                     name: true,
                     phone: true,
                     email:true,
                 }
               }
           },
           where:{
               id,
           }
       });

       if (!home){
           throw new NotFoundException
       }
       return new HomeResponseDto(home);

    }
}