## Description

This project is a sample backend API built using Node.js and NestJS, designed to work with Dynamic.xyz. It provides endpoints for web3 wallet management and Ethereum Virtual Machine (EVM)-compatible blockchain interactions.

## Installation

```bash
$ npm install
```

## Configuration

Before running the application, you need to configure the parameters listed in the following sections within your environment file (e.g., `./.env`).

### Database Configuration:

This project uses TypeORM for database interaction, and was tested using postgresql. To configure the database connection:

- Create the database schema using the provided schema in `./schema.sql`
- Optionally configure your database type (default: 'postgres'), schema (default: 'public'), and other settings in `src/config/typeorm.config.ts`

- `DB_HOST`: The hostname or IP address of the database server.
- `DB_PORT`: The port number on which the database server is accessible.
- `DB_USERNAME`: The username required to authenticate with the database.
- `DB_PASSWORD`: The password required to authenticate with the database.
- `DB_DATABASE`: The name of the database to be accessed.

### Dynamic Integration

This application integrates with Dynamic.xyz, where the following values are fetched from your Dynamic tenant configuration in the [Developer Section](https://app.dynamic.xyz/dashboard/developer/api):

- `DYNAMIC_ENVIRONMENT_ID`: Environment ID of your Dynamic tenant.
- `DYNAMIC_PUBLIC_KEY`: The public key used to validate end user JWTs.

### Ethereum Configuration

The Ethereum-related configurations are as follows:

- `RPC_URL`: The endpoint URL for the Ethereum RPC service used to interact with the blockchain.
- `ENCRYPTION_KEY`: The key used to encrypt wallet private keys prior to storage.
- `FUNDER_PRIVATE_KEY`: The private key for an Ethereum wallet, used to fund transactions as necessary.
- `FUNDING_AMOUNT_ETH`: Optionally specify the amount of ETH to fund new wallets, specified in ether. Default: `0.01`.
- `GAS_PRICE_GWEI`: Optionally specify gas price for transactions, specified in Gwei. Default: 50.
- `GAS_LIMIT`: Optionally specify the gas limit for transactions. Default: 21000.

### Other

- `ALLOWED_ORIGINS`: Specifies the origins that are permitted to access the backend services, which is crucial for CORS configuration. This should be a comma-separated list that includes both the protocol and the port, for example, `https://localhost:3000`.

## Usage

**Note**: All APIs are protected by validating the JWT token sent in the header. For any API that depends on the userId, it will be extracted from the 'sub' claim in the JWT token.

### 1. Create Wallet

Endpoint: `POST /wallets`

Creates a new wallet for a user, providing custody of the private key which is encrypted and stored in the configured database. If the user doesn't exist, it will be created.

### 2. Get Wallet Balance

Endpoint: `GET /wallets/{address}/balance`

Retrieves the balance of the user's wallet. The user initiating this request must own the specified wallet.

Path Parameters:

- `address`: Wallet address

### 3. Sign Message

Endpoint: `POST /wallets/{address}/sign`

Signs a message with the private key of a wallet. The user initiating this request must own the specified wallet.

Path Parameters:

- `address`: Wallet address

Request Body:

```json
{
  "message": "<message-to-sign>"
}
```

### 4. Admin APIs

For additional administrative functionalities, please consult the users and wallets controllers.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing the app

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
