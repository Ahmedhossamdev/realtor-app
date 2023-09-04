import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UnauthorizedException
} from '@nestjs/common';
import {HomeService} from "./home.service";
import {CreateHomeDto, HomeResponseDto, UpdateHomeDto} from "./dto/home.dto";
import {ProperType, UserType} from "@prisma/client";
import {User, UserInfo} from "../user/decorators/user.decorator";


@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) {
    }

    @Get()
    getHomes(
        @Query('city') city?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('propertyType') propertyType?: ProperType,
    ): Promise<HomeResponseDto[]> {

        const price = minPrice || maxPrice ? {
            ...(minPrice && {gte: parseFloat(minPrice)}),
            ...(maxPrice && {lte: parseFloat(maxPrice)}),
        } : undefined

        const filters = {
            ...(city && {city}),
            ...(price && {price}),
            ...(propertyType && {propertyType}),
        }

        return this.homeService.getHomes(filters);
    }

    @Get(':id')
    getHome(@Param('id', ParseIntPipe) id: number) {
        return this.homeService.getHomeById(id);
    }

    // TODO CUSTOM DECORATOR
    @Post()
    createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
        if (user.user_type !== 'REALTOR') {
            throw new UnauthorizedException();
        }
        return this.homeService.createHome(body, user.id);
    }

    @Put(":id")
    async updateHome(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: UpdateHomeDto,
        @User() user: UserInfo,
    ) {
        const realtor = await this.homeService.getRealtorByHome(id);
        if (realtor.id !== user.id) {
            throw new UnauthorizedException();
        }
        return this.homeService.updateHomeByID(id, body);
    }

    @Delete(":id")
    async deleteHome(
        @Param("id", ParseIntPipe) id: number,
        @User() user: UserInfo
    ) {
        const realtor = await this.homeService.getRealtorByHome(id);
        if (realtor.id !== user.id) {
            throw new UnauthorizedException();
        }
        return this.homeService.deleteHome(id);
    }
}
