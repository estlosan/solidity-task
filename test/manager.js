let should = require('chai').should();
const Manager = artifacts.require('Manager');

contract("Manager", ([admin, user1, user2, user3]) => {

    it('Should return the size of hierarchy', async () => {
        let size = 5;
        let manager = await Manager.new(size);
        (await manager.totalSize()).toNumber().should.be.equal(size);
    }) 

    describe("Add new user", () => {

    });

    describe("Remove user", () => {

    });
})