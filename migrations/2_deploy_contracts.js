const SocialNetwork = artifacts.require('SocialNetwork');

module.exports = function (deployer, network, accounts) {
  deployer.deploy(SocialNetwork, {
    gas: 6000000,
    from: accounts[0],
    to: '0x0000000000000000000000000000000000000000',
  });
};
