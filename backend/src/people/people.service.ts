import { Injectable } from "@nestjs/common";
import { PeopleRepository } from "./people.repository";

@Injectable()
export class PeopleService {
    constructor(
        private readonly peopleRepository: PeopleRepository
    ) { }
    findAll() {
        return this.peopleRepository.findPeople();
    }

    bulkCreate(people: any) {
        return this.peopleRepository.bulkCreatePeople(people);
    }
}