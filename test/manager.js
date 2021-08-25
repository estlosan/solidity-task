let should = require('chai').should();
const Manager = artifacts.require('Manager');

const {
    expectRevert,
  } = require('@openzeppelin/test-helpers');
const { toWei } = require('web3-utils');

contract("Manager", ([admin, user1, user2, user3, user4, user5]) => {

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
            manager = await Manager.new(totalSize, { from: admin });
        });

        it('should add new user with admin with all permission', async () => {
            const expectedCanAdd = true;
            const expectedCanRemove = true;
            const expectedChildren = [user1];
            await manager.addUser(user1, expectedCanAdd, expectedCanRemove, { 
                from: admin, value: toWei('0.1', 'ether') 
            });

            (await manager.size()).toNumber().should.be.equal(size);
            const children = await manager.getUserChildren(admin);
            expect(children).to.have.all.members(expectedChildren);
            const { parentUser, canAdd, canRemove, isUser } = await manager.users(user1);
            parentUser.should.be.equal(admin);
            canAdd.should.be.equal(expectedCanAdd);
            canRemove.should.be.equal(expectedCanRemove);
            isUser.should.be.equal(true);
        });

        it('should add new user with admin with add permission', async () => {
            const expectedCanAdd = true;
            const expectedCanRemove = false;
            const expectedChildren = [user1];
            await manager.addUser(user1, expectedCanAdd, expectedCanRemove, { 
                from: admin, value: toWei('0.1', 'ether') 
            });

            (await manager.size()).toNumber().should.be.equal(size);
            const children = await manager.getUserChildren(admin);
            expect(children).to.have.all.members(expectedChildren);
            const { parentUser, canAdd, canRemove, isUser } = await manager.users(user1);
            parentUser.should.be.equal(admin);
            canAdd.should.be.equal(expectedCanAdd);
            canRemove.should.be.equal(expectedCanRemove);
            isUser.should.be.equal(true);
        });

        it('should add new user with admin with remove permission', async () => {
            const expectedCanAdd = false;
            const expectedCanRemove = true;
            const expectedChildren = [user1];
            await manager.addUser(user1, expectedCanAdd, expectedCanRemove, { 
                from: admin, value: toWei('0.1', 'ether') 
            });

            (await manager.size()).toNumber().should.be.equal(size);
            const children = await manager.getUserChildren(admin);
            expect(children).to.have.all.members(expectedChildren);
            const { parentUser, canAdd, canRemove, isUser } = await manager.users(user1);
            parentUser.should.be.equal(admin);
            canAdd.should.be.equal(expectedCanAdd);
            canRemove.should.be.equal(expectedCanRemove);
            isUser.should.be.equal(true);
        });

        it('should add new user with admin with no permission', async () => {
            const expectedCanAdd = false;
            const expectedCanRemove = false;
            const expectedChildren = [user1];
            await manager.addUser(user1, expectedCanAdd, expectedCanRemove, { 
                from: admin, value: toWei('0.1', 'ether') 
            });

            (await manager.size()).toNumber().should.be.equal(size);
            const children = await manager.getUserChildren(admin);
            expect(children).to.have.all.members(expectedChildren);
            const { parentUser, canAdd, canRemove, isUser } = await manager.users(user1);
            parentUser.should.be.equal(admin);
            canAdd.should.be.equal(expectedCanAdd);
            canRemove.should.be.equal(expectedCanRemove);
            isUser.should.be.equal(true);
        });

        it('should add two new users with admin', async () => {
            const expectedCanAdd = false;
            const expectedCanRemove = false;
            const expectedChildren = [user1, user2];
            const expectedSize = 3;
            await manager.addUser(user1, expectedCanAdd, expectedCanRemove, { 
                from: admin, value: toWei('0.1', 'ether') 
            });
            await manager.addUser(user2, expectedCanAdd, expectedCanRemove, { 
                from: admin, value: toWei('0.1', 'ether') 
            });

            (await manager.size()).toNumber().should.be.equal(expectedSize);
            const children = await manager.getUserChildren(admin);
            expect(children).to.have.all.members(expectedChildren);
        });

        it('should deny add new user with user1 (outside hierarchy)', async () => {
            const expectedRevert = "You don't exist in hierarchy";
            await expectRevert(
                manager.addUser(user1, true, true, { 
                    from: user1, value: toWei('0.1', 'ether') 
                }),
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
            await manager.addUser(user1, true, true, { 
                from: admin, value: toWei('0.1', 'ether') 
            });

            const expectedCanAdd = true;
            const expectedCanRemove = true;
            await manager.addUser(user2, expectedCanAdd, expectedCanRemove, { 
                from: user1, value: toWei('0.1', 'ether') 
            });

            (await manager.size()).toNumber().should.be.equal(size);
            const { parentUser, canAdd, canRemove, isUser } = await manager.users(user2);
            parentUser.should.be.equal(user1);
            canAdd.should.be.equal(expectedCanAdd);
            canRemove.should.be.equal(expectedCanRemove);
            isUser.should.be.equal(true);
        });

        it('should deny add new user with remove permission if user1 does not have it', async () => {
            await manager.addUser(user1, true, false, { 
                from: admin, value: toWei('0.1', 'ether') 
            });

            const expectedRevert = "You can't add users with permissions that you don't have";
            await expectRevert(
                manager.addUser(user2, true, true, { 
                    from: user1, value: toWei('0.1', 'ether') 
                }),
                expectedRevert
            );
        });

        it('should deny add new user with no user add permission', async () => {
            await manager.addUser(user1, false, false, { 
                from: admin, value: toWei('0.1', 'ether') 
            });

            const expectedRevert = "You don't have add permission";
            await expectRevert(
                manager.addUser(user2, false, false, { 
                    from: user1, value: toWei('0.1', 'ether') 
                }),
                expectedRevert
            );
        })

        it('should deny add same user twice', async () => {
            await manager.addUser(user1, true, true, { 
                from: admin, value: toWei('0.1', 'ether') 
            });

            const expectedRevert = "User exists";
            await expectRevert(
                manager.addUser(user1, true, true, { 
                    from: user1, value: toWei('0.1', 'ether') 
                }),
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
                const expectedChildren = [];
                await manager.addUser(user1, true, true, { 
                    from: admin, value: toWei('0.1', 'ether') 
                });

                await manager.removeUser(user1, { from: admin });
    
                (await manager.size()).toNumber().should.be.equal(size);
                const { isUser } = await manager.users(user1);
                const children = await manager.getUserChildren(admin);
                expect(children).to.have.all.members(expectedChildren);
                isUser.should.be.equal(false);
            });

            it('should deny remove with user 2 (outside hierarchy)', async () => {
                await manager.addUser(user1, true, true, { 
                    from: admin, value: toWei('0.1', 'ether') 
                });

                await expectRevert(
                    manager.removeUser(user1, { from: user2 }),
                    "You don't exist in hierarchy"
                );
            });

            it('should deny remove user 1 with user 2 (no remove permission)', async () => {
                await manager.addUser(user1, true, true, { 
                    from: admin, value: toWei('0.1', 'ether') 
                });
                await manager.addUser(user2, true, false, { 
                    from: admin, value: toWei('0.1', 'ether') 
                });

                await expectRevert(
                    manager.removeUser(user1, { from: user2 }),
                    "You don't have remove permission"
                );
            });

            it('should deny remove admin with user 1', async () => {
                await manager.addUser(user1, true, true, { 
                    from: admin, value: toWei('0.1', 'ether') 
                });

                await expectRevert(
                    manager.removeUser(admin, { from: user1}),
                    "You can't remove admin"
                );
            });
        });

        describe("Remove user with one children", () => {
            const totalSize = 5;
            const size = 1;
            let manager;
            beforeEach('Deploy contract', async () => {
                manager = await Manager.new(totalSize, { from: admin });
            });

            it('should remove user1 with admin', async () => {
                const expectedAdminChildren = [user2];
                await manager.addUser(user1, true, true, { 
                    from: admin, value: toWei('0.1', 'ether') 
                });
                await manager.addUser(user2, true, true, { 
                    from: user1, value: toWei('0.1', 'ether') 
                });

                await manager.removeUser(user1, { from: admin});


                const { parentUser } = await manager.users(user2);
                parentUser.should.be.equal(admin);

                const children = await manager.getUserChildren(admin);
                expect(children).to.have.all.members(expectedAdminChildren);

            });
        });

        describe("Remove user with two children", () => {
            const totalSize = 5;
            const size = 1;
            let manager;
            beforeEach('Deploy contract', async () => {
                manager = await Manager.new(totalSize, { from: admin });
            });

            it('should remove user1 with admin', async () => {
                const expectedAdminChildren = [user2];
                const expectedUser2Children = [user3];
                await manager.addUser(user1, true, true, { 
                    from: admin, value: toWei('0.1', 'ether') 
                });
                await manager.addUser(user2, true, true, { 
                    from: user1, value: toWei('0.1', 'ether') 
                });
                await manager.addUser(user3, true, true, { 
                    from: user1, value: toWei('0.1', 'ether') 
                });

                await manager.removeUser(user1, { from: admin});


                const { parentUser } = await manager.users(user2);
                parentUser.should.be.equal(admin);

                const { parentUser: user3Parent } = await manager.users(user3);
                user3Parent.should.be.equal(user2);

                const adminChildren = await manager.getUserChildren(admin);
                expect(adminChildren).to.have.all.members(expectedAdminChildren);
                const user2Children = await manager.getUserChildren(user2);
                expect(user2Children).to.have.all.members(expectedUser2Children);

            });
        });

        describe("Remove user with two children and the replace user has two children", () => {
            const totalSize = 8;
            const size = 1;
            let manager;
            beforeEach('Deploy contract', async () => {
                manager = await Manager.new(totalSize, { from: admin });
            });

            it('should remove user1 with admin', async () => {
                const expectedAdminChildren = [user2];
                const expectedUser2Children = [user4,user5,user3];
                await manager.addUser(user1, true, true, { 
                    from: admin, value: toWei('0.1', 'ether') 
                });
                await manager.addUser(user2, true, true, { 
                    from: user1, value: toWei('0.1', 'ether') 
                });
                await manager.addUser(user3, true, true, { 
                    from: user1, value: toWei('0.1', 'ether') 
                });
                await manager.addUser(user4, true, true, { 
                    from: user2, value: toWei('0.1', 'ether') 
                });
                await manager.addUser(user5, true, true, { 
                    from: user2, value: toWei('0.1', 'ether') 
                });

                await manager.removeUser(user1, { from: admin});


                const { parentUser: user2Parent } = await manager.users(user2);
                const { parentUser: user3Parent } = await manager.users(user3);
                user2Parent.should.be.equal(admin);
                user3Parent.should.be.equal(user2);

                const adminChildren = await manager.getUserChildren(admin);
                expect(adminChildren).to.have.all.members(expectedAdminChildren);
                const user2Children = await manager.getUserChildren(user2);
                expect(user2Children).to.have.all.members(expectedUser2Children);

            });
        });
    });

    describe("Check add price", () => {
        const emisionRate = 5562e6;
        let manager;
        it('should deny add new user', async () => {
            const totalSize = 5;
            const expectedPrice = totalSize * emisionRate;
            manager = await Manager.new(totalSize, { from: admin });
            await manager.addUser(user1, true, true, { 
                from: admin, value: toWei('0.1', 'ether') 
            });
            (await manager.calculatePrice()).toNumber().should.be.equal(expectedPrice);
            
        });

        it('should add new user at double price', async () => {
            const totalSize = 5;
            const expectedPrice = totalSize * emisionRate;
            manager = await Manager.new(totalSize, { from: admin });
            await manager.addUser(user1, true, true, { 
                from: admin, value: toWei('0.1', 'ether') 
            });
            (await manager.calculatePrice()).toNumber().should.be.equal(expectedPrice);

        });

        it('should deny add user when no ether sent', async () => {
            const totalSize = 5;
            manager = await Manager.new(totalSize, { from: admin });
            await manager.addUser(user1, true, true, { 
                from: admin, value: toWei('0.1', 'ether') 
            });
            
            await expectRevert(
                manager.addUser(user2, true, true, { 
                    from: admin 
                }),
                "Price must be greater then sended"
            );
        });
    });

    describe("Check total size", () => {
        const totalSize = 3;
        let manager;
        beforeEach('Deploy contract', async () => {
            manager = await Manager.new(totalSize, { from: admin });
        });

        it('should deny add new user', async () => {
            await manager.addUser(user1, true, true, { 
                from: admin, value: toWei('0.1', 'ether') 
            });
            await manager.addUser(user2, true, true, { 
                from: admin, value: toWei('0.1', 'ether') 
            });
            
            await expectRevert(
                manager.addUser(user3, true, true, { 
                    from: admin, value: toWei('0.1', 'ether') 
                }),
                "Hierarchy total size exceeded"
            );
        });
    });
})