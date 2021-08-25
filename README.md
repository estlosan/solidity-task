# Solidity Task

## Project comments
Below you can find a description about the decisions I have made:

- If a user gets removed, its first child will replace it.
- Add function is payable. If amount is exceeded will be returned to user.
- Maximum hierarchy size includes admin (creator).

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/estlosan/solidity-task
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Run Truffle tests
    ```sh
    truffle test
    ```