import { Injectable } from "@nestjs/common";
import db from "../database";

@Injectable()
export class PeopleRepository {
    private readonly tableName = "people";

    async findPeople(): Promise<any> {
        // Step 1: Get all people
        const people = await db(this.tableName).select('*');

        // Step 2: For each person, get their devices
        const peopleWithDevices = await Promise.all(
            people.map(async (person) => {
                // Get device associations
                const deviceAssociations = await db('people_devices')
                    .where('peopleId', person.id)
                    .join('devices', 'people_devices.deviceId', 'devices.id')
                    .select('devices.deviceName');

                // Extract device names from the associations
                const devices = deviceAssociations.map(assoc => assoc.deviceName);

                // Format the response to match the expected structure
                return {
                    id: person.id,
                    identifier: person.identifier,
                    first_name: person.firstName,
                    last_name: person.lastName,
                    telephone: person.telephone,
                    email: person.email,
                    devices: devices,
                    location: {
                        City: person.city,
                        Country: person.country
                    },
                    dob: person.dob ? new Date(person.dob).toISOString().split('T')[0] : null
                };
            })
        );

        return peopleWithDevices;
    }

    async bulkCreatePeople(data: any[]): Promise<any[]> {
        // Use a transaction to ensure data integrity
        return db.transaction(async (trx) => {
            const insertedPeople: any = [];

            for (const personData of data) {
                try {
                    // Prepare person data for insertion
                    const personToInsert = {
                        identifier: personData.id,
                        firstName: personData.first_name,
                        lastName: personData.last_name,
                        telephone: personData.telephone,
                        email: personData.email,
                        city: personData.location?.City,
                        country: personData.location?.Country,
                        dob: personData.dob ? new Date(personData.dob) : null
                    };

                    let personId;
                    try {
                        // Check if person already exists (with explicit limit)
                        const existingPerson = await trx('people')
                            .where({ email: personData.email })
                            .first();

                        if (existingPerson) {
                            // Update existing person
                            const [updatedPerson] = await trx('people')
                                .where({ id: existingPerson.id })
                                .update(personToInsert)
                                .returning('*');
                            personId = updatedPerson.id;
                        } else {
                            // Insert new person
                            const [newPerson] = await trx('people')
                                .insert(personToInsert)
                                .returning('*');
                            personId = newPerson.id;
                        }
                    } catch (personQueryError) {
                        console.error(`Error querying/inserting person ${personData.email}:`, personQueryError);
                        // Log the error but continue with the next person
                        continue;
                    }

                    // Handle devices
                    if (personData.devices && personData.devices.length > 0) {
                        try {
                            // Remove existing device associations
                            await trx('people_devices')
                                .where({ peopleId: personId })
                                .del();

                            // Insert or get devices and create associations
                            for (const deviceName of personData.devices) {
                                // Find or create device
                                const [device] = await trx('devices')
                                    .insert({ deviceName })
                                    .returning('*');

                                // Create people_devices association
                                await trx('people_devices')
                                    .insert({
                                        peopleId: personId,
                                        deviceId: device.id,
                                        assignedDate: new Date()
                                    })
                                    .onConflict(['peopleId', 'deviceId'])
                                    .ignore();
                            }
                        } catch (deviceError) {
                            console.error(`Error processing devices for ${personData.email}:`, deviceError);
                            // Log the error but continue with the next person
                            continue;
                        }
                    }

                    insertedPeople.push({
                        id: personId,
                        firstName: personData.first_name,
                        lastName: personData.last_name,
                        email: personData.email
                    });
                } catch (error) {
                    console.error(`Unexpected error processing person ${personData.email}:`, error);
                    // Log the error but continue with the next person
                    continue;
                }
            }

            return insertedPeople;
        });
    }
}