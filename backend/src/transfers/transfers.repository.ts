import { Injectable } from "@nestjs/common";

@Injectable()
export class TransfersRepository {
    private readonly tableName = 'transfers';
    async findTransfers() {
        return [{
            id: 1,
            amount: 100,
            sender: 'sender',
            receiver: 'receiver',
            status: 'pending'
        }]
    }
}