let should = require('chai').should();
const Manager = artifacts.require('Manager');

const {
    expectRevert,
  } = require('@openzeppelin/test-helpers');

contract("Manager", ([admin, user1, user2, user3]) => {

    it('Should return the size of hierarchy', async () => {
        const size = 5;
        const manager = await Manager.new(size);
        (await manager.totalSize()).toNumber().should.be.equal(size);
    }) 

    it('Should create admin of hierarchy', async () => {
        const expectedCanAdd = true;
        const expectedCanRemove = true;
        const expectedParent = '0x0000000000000000000000000000000000000000';
        const size = 5;
        const manager = await Manager.new(size, { from: admin });
        const { parentUser, canAdd, canRemove, isUser } = await manager.users(admin);
        parentUser.should.be.equal(expectedParent);
        canAdd.should.be.equal(expectedCanAdd);
        canRemove.should.be.equal(expectedCanRemove);
        isUser.should.be.equal(true);
    }) 

    describe("Add new user first layer", () => {
        const totalSize = 5;
        const size = 2;
        let manager;
        beforeEach('Deploy contract', async () => {
            manager = await Manager.new(size, { from: admin });
        });

        it('should add new user with admin with all permission', async () => {
            const expectedCanAdd = true;
            const expectedCanRemove = true;
            await manager.addUser(user1, expectedCanAdd, expectedCanRemove, { from: admin });

            (await manager.size()).toNumber().should.be.equal(size);
            const { parentUser, canAdd, canRemove, isUser } = await manager.users(user1);
            parentUser.should.be.equal(admin);
            canAdd.should.be.equal(expectedCanAdd);
            canRemove.should.be.equal(expectedCanRemove);
            isUser.should.be.equal(true);
        });

        it('should add new user with admin with add permission', async () => {
            const expectedCanAdd = true;
            const expectedCanRemove = false;
            await manager.addUser(user1, expectedCanAdd, expectedCanRemove, { from: admin });

            (await manager.size()).toNumber().should.be.equal(size);
            const { parentUser, canAdd, canRemove, isUser } = await manager.users(user1);
            parentUser.should.be.equal(admin);
            canAdd.should.be.equal(expectedCanAdd);
            canRemove.should.be.equal(expectedCanRemove);
            isUser.should.be.equal(true);
        });

        it('should add new user with admin with remove permission', async () => {
            const expectedCanAdd = false;
            const expectedCanRemove = true;
            await manager.addUser(user1, expectedCanAdd, expectedCanRemove, { from: admin });

            (await manager.size()).toNumber().should.be.equal(size);
            const { parentUser, canAdd, canRemove, isUser } = await manager.users(user1);
            parentUser.should.be.equal(admin);
            canAdd.should.be.equal(expectedCanAdd);
            canRemove.should.be.equal(expectedCanRemove);
            isUser.should.be.equal(true);
        });

        it('should add new user with admin with no permission', async () => {
            const expectedCanAdd = false;
            const expectedCanRemove = false;
            await manager.addUser(user1, expectedCanAdd, expectedCanRemove, { from: admin });

            (await manager.size()).toNumber().should.be.equal(size);
            const { parentUser, canAdd, canRemove, isUser } = await manager.users(user1);
            parentUser.should.be.equal(admin);
            canAdd.should.be.equal(expectedCanAdd);
            canRemove.should.be.equal(expectedCanRemove);
            isUser.should.be.equal(true);
        });

        it('should deny add new user with user1 (outside hierarchy)', async () => {
            const expectedRevert = "You don't exist in hierarchy";
            await expectRevert(
                manager.addUser(user1, true, true, { from: user1 }),
                expectedRevert
            );
        })
    });

    describe("Add new user second layer", () => {
        const totalSize = 5;
        const size = 3;
        let manager;
        beforeEach('Deploy contract', async () => {
            manager = await Manager.new(totalSize, { from: admin });
        });

        it('should add new user with user1 with all permission', async () => {
            await manager.addUser(user1, true, true, { from: admin });

            const expectedCanAdd = true;
            const expectedCanRemove = true;
            await manager.addUser(user2, expectedCanAdd, expectedCanRemove, { from: user1 });

            (await manager.size()).toNumber().should.be.equal(size);
            const { parentUser, canAdd, canRemove, isUser } = await manager.users(user2);
            parentUser.should.be.equal(user1);
            canAdd.should.be.equal(expectedCanAdd);
            canRemove.should.be.equal(expectedCanRemove);
            isUser.should.be.equal(true);
        });

        it('should deny add new user with remove permission if user1 does not have it', async () => {
            await manager.addUser(user1, true, false, { from: admin });

            const expectedRevert = "You can't add users with permissions that you don't have";
            await expectRevert(
                manager.addUser(user2, true, true, { from: user1 }),
                expectedRevert
            );
        });

        it('should deny add new user with no user add permission', async () => {
            await manager.addUser(user1, false, false, { from: admin });

            const expectedRevert = "You don't have add permission";
            await expectRevert(
                manager.addUser(user2, false, false, { from: user1 }),
                expectedRevert
            );
        })

        it('should deny add same user twice', async () => {
            await manager.addUser(user1, true, true, { from: admin });

            const expectedRevert = "User exists";
            await expectRevert(
                manager.addUser(user1, true, true, { from: user1 }),
                expectedRevert
            );
        })
    });

    describe("Remove user", () => {
        describe("Remove user without children", () => {
            const totalSize = 5;
            const size = 1;
            let manager;
            beforeEach('Deploy contract', async () => {
                manager = await Manager.new(totalSize, { from: admin });
            });

            it('should remove user1 with admin', async () => {
                await manager.addUser(user1, true, true, { from: admin });

                const children = await manager.getUserChildren(admin);
                await manager.removeUser(user1, { from: admin });
    
                (await manager.size()).toNumber().should.be.equal(size);
                const { isUser } = await manager.users(user1);
                const children1 = await manager.getUserChildren(admin);
                isUser.should.be.equal(false);
            });

            it('should deny remove with user 2 (outside hierarchy)', async () => {
                await manager.addUser(user1, true, true, { from: admin });

                await expectRevert(
                    manager.removeUser(user1, { from: user2 }),
                    "You don't exist in hierarchy"
                );
            });

            it('should deny remove user 1 with user 2 (no remove permission)', async () => {
                await manager.addUser(user1, true, true, { from: admin });
                await manager.addUser(user2, true, false, { from: admin });

                await expectRevert(
                    manager.removeUser(user1, { from: user2 }),
                    "You don't have remove permission"
                );
            });
        });
    });

    describe("Check total size", () => {
        const totalSize = 3;
        let manager;
        beforeEach('Deploy contract', async () => {
            manager = await Manager.new(totalSize, { from: admin });
        });

        it('should deny add new user', async () => {
            await manager.addUser(user1, true, true, { from: admin });
            await manager.addUser(user2, true, true, { from: admin });
            
            await expectRevert(
                manager.addUser(user3, true, true, { from: admin }),
                "Hierarchy total size exceeded"
            );
        });
    });
})