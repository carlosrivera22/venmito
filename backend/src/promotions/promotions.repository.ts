import { Injectable } from "@nestjs/common";
import db from "../database";

@Injectable()
export class PromotionsRepository {
    private readonly tableName = "promotions";

    async findPromotions(): Promise<any[]> {
        // Get all promotions with person info
        const promotions = await db(this.tableName)
            .select(
                'promotions.*',
                'people.firstName',
                'people.lastName',
                'people.email',
                'people.telephone'
            )
            .leftJoin('people', 'promotions.peopleId', 'people.id');

        return promotions;
    }

    async bulkCreatePromotions(data: any[]): Promise<any[]> {
        // Use a transaction to ensure data integrity
        return db.transaction(async (trx) => {
            const insertedPromotions: any = [];

            for (const promotionData of data) {
                try {
                    // Skip entries without email
                    if (!promotionData.client_email && !promotionData.telephone) {
                        console.log(`Skipping promotion with no email: ${promotionData.promotion}`);
                        continue;
                    }

                    // Find the person with the matching email
                    let person;
                    try {
                        person = await trx('people')
                            .where({ email: promotionData.client_email })
                            .orWhere({ telephone: promotionData.telephone })
                            .first();

                        console.log("Person found:", person);

                        if (!person) {
                            console.log(`No matching person found for email: ${promotionData.client_email}`);
                            continue;
                        }
                    } catch (personQueryError) {
                        console.error(`Error finding person with email ${promotionData.client_email}:`, personQueryError);
                        continue;
                    }

                    // Prepare promotion data for insertion
                    const respondedBoolean = promotionData.responded.toLowerCase() === 'yes';
                    const promotionToInsert = {
                        peopleId: person.id,
                        promotion: promotionData.promotion,
                        responded: respondedBoolean,
                        promotionDate: promotionData.promotion_date
                    };
                    console.log("Promotion to insert: ", promotionToInsert);

                    let promotionId;
                    try {
                        // Check if promotion already exists
                        const existingPromotion = await trx(this.tableName)
                            .where({
                                peopleId: person.id,
                                promotion: promotionData.promotion,
                                promotionDate: promotionData.promotion_date
                            })
                            .first();

                        if (existingPromotion) {
                            // Update existing promotion
                            const [updatedPromotion] = await trx(this.tableName)
                                .where({ id: existingPromotion.id })
                                .update({
                                    ...promotionToInsert,
                                    updatedAt: new Date()
                                })
                                .returning('*');

                            promotionId = updatedPromotion.id;
                        } else {
                            // Insert new promotion
                            const [newPromotion] = await trx(this.tableName)
                                .insert(promotionToInsert)
                                .returning('*');

                            promotionId = newPromotion.id;
                        }
                    } catch (promotionQueryError) {
                        console.error(`Error inserting/updating promotion for ${promotionData.client_email}:`, promotionQueryError);
                        continue;
                    }

                    insertedPromotions.push({
                        peopleId: person.id,
                        promotion: promotionData.promotion,
                        responded: respondedBoolean,
                        promotionDate: promotionData.promotion_date
                    });
                } catch (error) {
                    console.error(`Unexpected error processing promotion for ${promotionData.client_email}:`, error);
                    continue;
                }
            }

            return insertedPromotions;
        });
    }
}