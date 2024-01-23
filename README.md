![ALex](./assets/alex-name.png)

## Description

ALex is an AI Assistant designed to assist judges in factual discovery and enhance brief analysis. Built with [NestJS](https://nestjs.com/), ALex uses advanced encryption standards to ensure data security and integrity. It's designed to be available when you need it, using reliable cloud-based solutions to ensure data accessibility without compromising on security. ALex does not store any data and does not use data provided to train its own models or improve its service offering. The cloud-based solution hosts the model on a server located in Germany, ensuring that data remains within the country and is not shared with any third parties.

## Installation

```bash
$ yarn
```

## Configuration

This application uses environment variables for configuration. The configuration options are defined in a `.env` file. 

To set up your own `.env` file, follow these steps:

1. Locate the `.env.example` file in the root directory of the project.
2. Make a copy of the `.env.example` file and rename it to `.env`.
3. Open the `.env` file and replace the placeholder values with your actual values.

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
