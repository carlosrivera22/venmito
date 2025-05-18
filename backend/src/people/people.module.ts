import { Module } from "@nestjs/common";
import { PeopleController } from "./people.controller";

@Module({
    controllers: [PeopleController],
    providers: [],
    exports: [],
})
export class PeopleModule { }