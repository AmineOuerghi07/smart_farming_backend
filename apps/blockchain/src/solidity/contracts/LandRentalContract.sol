// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;
contract LandRentalContract {
    uint32 public rentalCount = 0;

    struct Rental {
        uint32 id;
        string ownerId;
        string rentingUserId;
        string userName;
        string landId;
        string landName;
        string landLocation;
        string startDate;
        string endDate;
        string totalPrice;
        string monthlyPrice;
        
        bool isActive;
    }

    Rental[] public rentals;

    event RentalCreated(
        uint32 id,
        string userId,
        string startDate,
        string endDate
    );

    event RentalTerminated(uint32 id);

    function createRental(string memory userId, string memory rentingUserId, string memory userName, string memory landId, string memory landName, string memory landLocation,string memory startDate, string memory endDate, string memory price, string memory totalPrice) public {
        require(bytes(userId).length > 0, "User ID is required");
        require(bytes(startDate).length > 0, "Start date is required");
        require(bytes(endDate).length > 0, "End date is required");
        rentals.push(Rental(
            rentalCount,
            userId,
            rentingUserId,
            userName,
            landId,
            landName,
            landLocation,
            startDate,
            endDate,
            totalPrice,
            price,
            true
        ));
        rentalCount++;

        emit RentalCreated(rentalCount, userId, startDate, endDate);
    }

    function terminateRental(uint32 id) public {
        require(rentals[id].id != 0, "Rental does not exist");
        require(rentals[id].isActive, "Rental is already terminated");

        rentals[id].isActive = false;
        emit RentalTerminated(id);
    }

    function getRental(uint32 id) public view returns (Rental memory) {
        require(id > 0, "invalid index");
        return rentals[id - 1];
    }

    function getRentals() public view returns (Rental[] memory) {
        return rentals;
    }
}
