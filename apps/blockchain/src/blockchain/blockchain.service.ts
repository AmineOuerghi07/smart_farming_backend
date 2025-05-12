import { Injectable, OnModuleInit } from '@nestjs/common';
import Web3 from 'web3';
import { BlockchainDto } from '@app/contracts/blockchain/dto/blockchain.dto';
import { Rental } from './entities/rental.entity';
import contractJSON from './artifacts/LandRentalContract.json'; // Adjust the path to your contract JSON file

@Injectable()
export class BlockchainService implements OnModuleInit {

  private web3: Web3;
  private contract: any;
  private contractAddress: string = ""; 

  async onModuleInit() {
    this.web3 = new Web3('http://192.168.43.130:8545');

    const networkId = Object.keys(contractJSON.networks)[0];
    this.contract = new this.web3.eth.Contract(
      contractJSON.abi,
      contractJSON.networks[networkId].address
    );
    this.contractAddress = contractJSON.networks[networkId].address;
    const accounts = await this.web3.eth.getAccounts();
    this.web3.eth.defaultAccount = accounts[0];
  }

  async createRental(createBlockchainDto: BlockchainDto) {
    try {
      const accounts = await this.web3.eth.getAccounts();
      const estimateGas = await this.contract.methods
        .createRental(createBlockchainDto.requestingUser, createBlockchainDto.landId ,createBlockchainDto.fromDate, createBlockchainDto.toDate, createBlockchainDto.rentPrice, createBlockchainDto.totalPrice)
        .estimateGas({ from: accounts[0] });
        console.log('Estimated gas:', estimateGas); // Log the estimated gas
      const encode = await this.contract.methods.createRental(createBlockchainDto.requestingUser, createBlockchainDto.landId ,createBlockchainDto.fromDate, createBlockchainDto.toDate, createBlockchainDto.rentPrice, createBlockchainDto.totalPrice).encodeABI();
      console.log('Encoded ABI:', encode); // Log the encoded ABI
      const tx = await this.web3.eth.sendTransaction({
        to: this.contractAddress,
        data: encode,
        gas: estimateGas,
        from: accounts[0],
      });
      console.log('Transaction:', tx); // Log the transaction details
      console.log('Rental created successfully:', tx.transactionHash); // Log the transaction hash
      console.log(typeof tx)
      /*const accounts = await this.web3.eth.getAccounts();
      const estimateGas = await this.contract.methods
        .createRental(userId, startDate, endDate)
        .send({ from: accounts[0] });

      console.log('Estimated gas:', estimateGas);*/ // Log the estimated gas
      
    } catch (error) {
      console.error('Error creating rental:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  async getRental(id: number) {
    try {
      const accounts = await this.web3.eth.getAccounts();
      let rental : Rental
      const object = await this.contract.methods.getRental(id).call({ from: accounts[0] });
      console.log('Rental details:', object); // Log the rental details
      rental.id = Number(object[0]);
      rental.userId = object[1];
      rental.landId = object[2];
      rental.startDate = object[3];
      rental.endDate = object[4];
      rental.rentPrice = object[5];
      rental.totalPrice = object[6];
      rental.isActive = object[7];
      console.log('Rental details:', rental); // Log the rental details
      //return rental; // Return the rental details
     //await this.contract.methods.getRental(id).call({ from: this.web3.defaultAccount}).then(console.log);

     return rental;
    }
    catch (error) {
      console.log('Error getting rental:', error.message);
      console.error('Error fetching rental:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

  async getAllRentals() {
   
    try {
      const accounts = await this.web3.eth.getAccounts();
      let rentals : Rental[] = [];
      const object = await this.contract.methods.getRentals().call({ from: accounts[0] });
      console.log('Rental details:', object); // Log the rental details
      for(let i = 0; i < object.length; i++){
        let rental : Rental = new Rental(0, "", "", "", "", "", "", false);
        rental.id = Number(object[i][0]);
        rental.userId = object[i][1];
        rental.landId = object[i][2];
        rental.startDate = object[i][3];
        rental.endDate = object[i][4];
        rental.rentPrice = object[i][5];
        rental.totalPrice = object[i][6];
        rental.isActive = object[i][7];
        rentals.push(rental);
        console.log('Rental details:', rental); // Log the rental details
      }
      //return rental; // Return the rental details
     //await this.contract.methods.getRental(id).call({ from: this.web3.defaultAccount}).then(console.log);

     return rentals;
    }
    catch (error) {
      console.log('Error getting rental:', error.message);
      console.error('Error fetching rental:', error);
      throw error; // Rethrow the error to be handled by the caller
    }


  }

  findAll() {
    return `This action returns all blockchain`;
  }

  findOne(id: number) {
    return `This action returns a #${id} blockchain`;
  }

  remove(id: number) {
    return `This action removes a #${id} blockchain`;
  }
}
