export class Rental {
    id: number;
    userId: string;
    landId: string;
    startDate: string;
    endDate: string;
    rentPrice: string;
    totalPrice: string;
    isActive: boolean;
  
    constructor(
      id: number,
      userId: string,
      landId: string,
      startDate: string,
      endDate: string,
      rentPrice: string,
      totalPrice: string,
      isActive: boolean
    ) {
      this.id = id;
      this.userId = userId;
      this.landId = landId;
      this.startDate = startDate;
      this.endDate = endDate;
      this.rentPrice = rentPrice;
      this.totalPrice = totalPrice;
      this.isActive = isActive;
    }
  }