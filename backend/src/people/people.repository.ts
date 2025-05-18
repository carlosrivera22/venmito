import { Injectable } from "@nestjs/common";

@Injectable()
export class PeopleRepository {
    async findPeople(): Promise<any> {
        // Implement the logic to fetch people data from a database or any other data source
        // For example, you can use a database query or an API call to retrieve people data
        return [
            { id: 1, name: "John Doe" },
            { id: 2, name: "Jane Smith" },
        ];
    }
}