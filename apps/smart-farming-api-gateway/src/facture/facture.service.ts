import { FACTURE_PATTERNS } from '@app/contracts/facture/facture.patterns';
import { FACTURE_NAME } from '@app/contracts/facture/facture.rmq';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class FactureService {
 constructor(@Inject(FACTURE_NAME) private client: ClientProxy) { }
 
     async findAll() {
         return this.client.send(FACTURE_PATTERNS.FIND_ALL, {})
     }
 
     async create({orderId ,issueDate ,totalAmount}) {
         return this.client.send(FACTURE_PATTERNS.CREATE, { orderId ,issueDate ,totalAmount })
     }
 
     async findOne(id) {
         return this.client.send(FACTURE_PATTERNS.FIND_ONE, id)
     }
 
     async update({ id, orderId ,issueDate ,totalAmount }) {
         return this.client.send(FACTURE_PATTERNS.UPDATE, { id, orderId ,issueDate ,totalAmount})
     }
 
     async remove(id) {
         return this.client.send(FACTURE_PATTERNS.REMOVE, id)
     }
}
