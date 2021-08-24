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
            "You don't have add permission"
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
    
    /**
     * @dev Add new user to hierarchy
     * @param userToAdd address new user
     * @param _canAdd add new user permission
     * @param _canRemove remove user permission
     */
    function addUser(address userToAdd, bool _canAdd, bool _canRemove) external onlyExists() onlyAdd() {
        users[msg.sender].childrenUsers.push(userToAdd);
        _addUser(userToAdd, msg.sender, _canAdd, _canRemove);
    }
    
    /**
     * @dev Remove user and replace removed by one of his children
     * @param userToAdd address new user
     * @param _parentUser address parent of new user
     * @param _canAdd add new user permission
     * @param _canRemove remove user permission
     */
    function removeUser() external onlyExists() onlyRemove() {
        //TODO 
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
        require(size <= totalSize, "Total hierarchy overcome");
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