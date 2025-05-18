import {
    Controller,
    Get,
    Post,
    Body,
    UsePipes,
    ValidationPipe,
    HttpCode,
    HttpStatus
} from "@nestjs/common";
import { PeopleService } from "./people.service";

// Bulk upload DTO
export class BulkUploadDto {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
    telephone?: string;
    location?: {
        City?: string;
        Country?: string;
    };
    devices?: string[];
    dob?: string;
}

@Controller("people")
export class PeopleController {
    constructor(private readonly peopleService: PeopleService) { }

    @Get()
    getPeople() {
        return this.peopleService.findAll();
    }

    @Post("upload")
    async bulkUpload(@Body() peopleData: any[]) {
        return peopleData;
    }
}