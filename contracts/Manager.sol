pragma solidity ^0.6.0;

/**
 * @dev Contract which allows manage user permission
 */
contract Manager {
    
    struct User {
        address parentUser;
        address[] childrenUsers;
        bool canAdd;
        bool canRemove;
        bool isUser; // Check if user exists
    }
    
    mapping (address => User) public users;
    
    // Manage admin of hierarchy
    address private admin;

    // Total size of hierarchy
    uint public totalSize;
    // Actual size of hierarchy
    uint public size;
    
    constructor(uint _size) public{
        admin = msg.sender;
        totalSize = _size;
        _addUser(msg.sender, address(0), true, true);
    }
    
    /**
     * @dev Throws if called by any account without add permission.
     */
    modifier onlyAdd() {
        require(
            users[msg.sender].canAdd == true,
            "You don't have add permission"
        );
        _;
    }
    
    /**
     * @dev Throws if called by any account without remove permission.
     */
    modifier onlyRemove() {
        require(
            users[msg.sender].canRemove == true,
            "You don't have remove permission"
        );
        _;
    }

    /**
     * @dev Throws if called by any account outside hierarchy.
     */
    modifier onlyExists() {
         require(
            users[msg.sender].isUser == true,
            "You don't exist in hierarchy"
        );
        _;
    }

    function getUserChildren(address userAddr) public view returns (address[] memory) {
        return users[userAddr].childrenUsers;
    }
    
    /**
     * @dev Add new user to hierarchy
     * @param userToAdd address new user
     * @param _canAdd add new user permission
     * @param _canRemove remove user permission
     */
    function addUser(address userToAdd, bool _canAdd, bool _canRemove) external onlyExists() onlyAdd() {
        require(!users[userToAdd].isUser, 'User exists');
        require(size < totalSize, 'Hierarchy total size exceeded');
        if(_canRemove) {
            require(
                users[msg.sender].canRemove, 
                "You can't add users with permissions that you don't have"
            );
        }
        users[msg.sender].childrenUsers.push(userToAdd);
        _addUser(userToAdd, msg.sender, _canAdd, _canRemove);
    }
    
    /**
     * @dev Remove user and replace removed by one of his children
     * @param userAddr address user to remove
     */
    function removeUser(address userAddr) external onlyExists() onlyRemove() {
        require(userAddr != admin, "You can't remove admin");
        address[] storage parentChilds = users[users[userAddr].parentUser].childrenUsers;
        delete users[userAddr];
        if(parentChilds.length > 1) {
            for(uint i = 0; i < parentChilds.length; i++) {
                if(parentChilds[i] == userAddr){
                    address auxAddr = parentChilds[parentChilds.length - 1];
                    parentChilds[parentChilds.length -1] = userAddr;
                    parentChilds[i] = auxAddr;
                    break;
                }
            }
        }
        parentChilds.pop();
        size--;
        //event
    }
    

    /**
     * @dev Add user
     * @param userToAdd address new user
     * @param _parentUser address parent of new user
     * @param _canAdd add new user permission
     * @param _canRemove remove user permission
     */
    function _addUser(address userToAdd, address _parentUser, bool _canAdd, bool _canRemove) internal {
        User memory user;
        user.parentUser = _parentUser;
        user.canAdd = _canAdd;
        user.canRemove = _canRemove;
        user.isUser = true;
        users[userToAdd] = user;
        size ++;
        //event
    }
}