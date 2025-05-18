import { Inject, Injectable } from "@nestjs/common";
import { TransfersRepository } from "./transfers.repository";

@Injectable()
export class TransfersService {
    constructor(private readonly transferRepository: TransfersRepository) { }
    getTransfers() {
        return this.transferRepository.findTransfers();
    }
}