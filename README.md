## Description

This project is a sample backend API built using Node.js and NestJS, designed to work with Dynamic.xyz. It provides endpoints for web3 wallet management and Ethereum Virtual Machine (EVM)-compatible blockchain interactions.

## Installation

```bash
$ npm install
```

## Configuration

Before running the application, you need to set up the following configuration:

### Database Configuration:

- Configure your database connection in the ormconfig.json file. This project uses TypeORM for database interaction.
- Initialize the database using the provided schema (./schema.sql)

### Dynamic Integration

This application integrates with Dynamic.xyz, where the following values are fetched from your Dynamic tenant configuration in the [Developer Section](https://app.dynamic.xyz/dashboard/developer/api):

- `apiToken`: API token used to access Dynamic services.
- `publicKey`: The public key used to validate end user JWTs.
- `environmentId`: Environment ID of your Dynamic tenant.

These values are used for authentication and environment-specific configurations within the application.

### Ethereum Configuration

Additionally, the Ethereum-related configurations are as follows:

- `rpcUrl`: RPC URL for Ethereum node interaction.

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

## Usage

**Note**: All APIs are protected by validating the JWT token sent in the header. For any API that depends on the userId, it will be extracted from the 'sub' claim in the JWT token.

### 1. Create Wallet

Endpoint: `POST /wallets`

Creates a new wallet for a user, providing custody of the private key which is encrypted and stored in the database. If the user doesn't exist, it will be created.

### 2. Get Wallet Balance

Endpoint: `GET /wallets/{address}/balance`

Retrieves the balance of the user's wallet. The user initiating this request must own the specified wallet.

Path Parameters:

- `address`: Wallet address

### 3. Sign Message

Endpoint: `POST /wallets/{address}/sign`

Signs a message with the private key of a wallet. The user initiating this request must own the specified wallet.

Request Body:

```json
{
  "address": "<wallet-address>",
  "message": "<message-to-sign>"
}
```

### 4. Admin APIs

For additional administrative functionalities, please consult the users and wallets controllers.
