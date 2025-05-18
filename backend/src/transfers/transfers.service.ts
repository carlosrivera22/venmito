import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class TransfersService {
    getTransfers() {
        return [
            { id: 1, amount: 100, description: 'Transfer to John' },
            { id: 2, amount: 200, description: 'Transfer to Jane' },
            { id: 3, amount: 300, description: 'Transfer to Mark' },
        ];
    }
}