export class Rental {
    id: number;
    ownerId: string;
    rentingUserId: string;
    userName: string;
    landId: string;
    landName: string;
    landLocation: string;
    startDate: string;
    endDate: string;
    rentPrice: string;
    totalPrice: string;
    isActive: boolean;
  
    constructor(
      id: number,
      ownerId: string,
      rentingUserId: string,
      userName: string,
      landId: string,
      landName: string,
      landLocation: string,
      startDate: string,
      endDate: string,
      rentPrice: string,
      totalPrice: string,
      isActive: boolean
    ) {
      this.id = id;
      this.ownerId = ownerId;
      this.rentingUserId = rentingUserId;
      this.userName = userName;
      this.landId = landId;
      this.landName = landName;
      this.landLocation = landLocation;
      this.startDate = startDate;
      this.endDate = endDate;
      this.rentPrice = rentPrice;
      this.totalPrice = totalPrice;
      this.isActive = isActive;
    }
  }