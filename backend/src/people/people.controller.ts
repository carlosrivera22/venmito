import { Controller, Get } from "@nestjs/common";

@Controller("people")
export class PeopleController {
    // Add your controller logic here
    @Get()
    getPeople() {
        return JSON.stringify({
            message: "Hello from the people controller",
        });
    }
}