import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {HomeResponseDto} from "./dto/home.dto";
import {ProperType} from "@prisma/client";
import {IsArray, IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";

interface GetHomesParam {
    city?: string;
    price?: {
        gte?:number;
        lte?:number;
    }
    propertyType?: ProperType,
}

interface CreateHomeParams {

    address: string;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    city: string;
    price: number;
    landSize: number;
    propertyType: ProperType;
    images: {url : string}[];
}


interface UpdateHomeParams {

    address?: string;
    numberOfBedrooms?: number;
    numberOfBathrooms?: number;
    city?: string;
    price?: number;
    landSize?: number;
    propertyType?: ProperType;

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
    // TODO AUTHORIZATION IN VALIDATE TO MAKE ONLY REALTOR AND ADMIN HAVE THE PERMISSIONS
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

    // TODO NOT A REALTOR
    async createHome(
        {
            address ,
            numberOfBedrooms ,
            numberOfBathrooms ,
            city ,
            images ,
            price ,
            propertyType ,
            landSize
        }:CreateHomeParams , userId : number){
        const home = await this.prismaService.home.create({
            data:{
                address,
                number_of_bedrooms : numberOfBedrooms,
                number_of_bathrooms : numberOfBathrooms,
                city,
                land_size: landSize,
                propertyType,
                price,
                realtor_id: userId,
            }
        });
        const homeImages = images.map(image => {
            return {...image, home_id: home.id}
        });

        await this.prismaService.image.createMany({data: homeImages});

        return new HomeResponseDto(home);
    }

    async updateHomeByID(id: number ,data: UpdateHomeParams){
        const home = await this.prismaService.home.findUnique({
            where:{
                id,
            }
        })


        if (!home){
            throw new NotFoundException();
        }

        const updatedHome = await this.prismaService.home.update({
            where: {
                id
            },
            data
        });

        return new HomeResponseDto(updatedHome);
    }
    // undelete case
    async deleteHome(id: number){
        await this.prismaService.image.deleteMany({
            where: {
                home_id : id,
            }
        });

        await this.prismaService.home.delete({
            where:{
                id,
            }
        })
    }
    async getRealtorByHome(id : number){
        const home = await this.prismaService.home.findUnique({
            where:{
                id,

            },
            select:{
                realtor:{
                    select:{
                        name:true,
                        id:true,
                        email:true,
                        phone:true,

                    }
                }
            }
        });
        if (!home){
            throw new NotFoundException();
        }

        return home.realtor;
    }
}
