const LandRentalContract = artifacts.require("LandRentalContract");

module.exports = function (deployer) {
  deployer.deploy(LandRentalContract);
};
