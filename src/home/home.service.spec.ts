import { Test, TestingModule } from '@nestjs/testing';
import { HomeService } from './home.service';
import {PrismaService} from "../prisma/prisma.service";
import {ProperType} from "@prisma/client";

const mockGetHomes = [
  {
    id: 8,
    address: "San",
    city: "NEW YORK34",
    price: 4500000,
    propertyType: ProperType.RESIDENTAIL,
    image: "img10",
    numberOfBedrooms: 5,
    numberOfBathrooms: 4,
    images:[
      {
        url: "src1",
      },
    ],
  }
]
describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeService ,{
        provide: PrismaService,
        useValue:{
          home:{
            findMany: jest.fn().mockReturnValue([mockGetHomes])
          }
        }
      }],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe("getHomes" , () =>{

    const filter =  {
      city: "Toronto",
      price:{
        get:1000000,
        lte:1500000,
      },

      propertyType: ProperType.RESIDENTAIL

    }
    it("should call prisma home.findMany with correct params", ()=>{
        const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);
        jest.spyOn(prismaService.home , "findMany").mockImplementation(mockPrismaFindManyHomes);

        service.getHomes(filter);

        expect(mockPrismaFindManyHomes).toBeCalledWith({
          select: {
            id: true,
            address: true,
            city: true,
            price: true,
            propertyType: true,
            number_of_bathrooms: true,
            number_of_bedrooms: true,
            images: {
              select: {
                url: true,
              },
              take: 1
            }
          },
          where: filter,
        })
    });
  });
});

