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
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import {HomeService} from "./home.service";
import {CreateHomeDto, HomeResponseDto, InquireDto, UpdateHomeDto} from "./dto/home.dto";
import {ProperType, UserType} from "@prisma/client";
import {User, UserInfo} from "../user/decorators/user.decorator";
import {AuthGuard} from "../guards/auth.guard";
import {Roles} from "../decorators/roles.decorator";


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
    @Roles(UserType.REALTOR, UserType.ADMIN)
    @UseGuards(AuthGuard)
    @Post()
    createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
        return this.homeService.createHome(body, user.id);

    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @UseGuards(AuthGuard)
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

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @UseGuards(AuthGuard)
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


    @Post('/:id/inquire')
    inquire(
        @Param('id', ParseIntPipe) homeId: number,
        @User() user: UserInfo,
        @Body() {message}: InquireDto
    ) {
        return this.homeService.inquire(user, homeId, message);
    }


    @Get('/:id/messages')
    async getMessagesByHome(
        @Param('id', ParseIntPipe) id: number,
        @User() user: UserInfo,
    ) {
        const realtor = await this.homeService.getRealtorByHome(id);
        if (realtor.id !== user.id) {
            throw new UnauthorizedException();
        }

        return this.homeService.getMessagesByHome(id);
    }
}

// 1) Buyer sends message to Realtor
// 2) Realtor get all messages from Buyer
