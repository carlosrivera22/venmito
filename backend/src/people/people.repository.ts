import { Injectable } from "@nestjs/common";
import db from "../database";
@Injectable()
export class PeopleRepository {
    private readonly tableName = "people";
    async findPeople(): Promise<any> {
        const people = await db(this.tableName).select("*");
        return people;
    }

    async bulkCreatePeople(data: any[]): Promise<any> {
        // Implement the logic to create multiple people in the database or any other data source
        // For example, you can use a database query or an API call to create multiple people
        return data.map((person) => {
            // Implement the logic to create a single person in the database or any other data source
            // For example, you can use a database query or an API call to create a single person
            return {
                id: person.id,
                name: person.name,
            };
        });
    }
}