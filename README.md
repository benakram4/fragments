# Fragments

This GitHub repository serves as the foundation of the cloud computing microservice project. It includes the initial setup of the development environment, GitHub repositories, an API server using Node.js and Express, structured logging, HTTP testing tools, npm scripts, and VSCode debugging configurations.
The front end for this project can be found at [here](https://github.com/benakram4/fragments-ui-nextjs).

## Table of Contents
- [Prerequisites/Dependencies](#prerequisitesdependencies)
- [Installation](#installation)
- [Development Tools](#development-tools)
- [Server Setup](#server-setup)
- [Testing](#testing)
- [Continuous Delivery](#continuous-delivery)
- [Additional Information](#additional-information)
- [Acknowledgments](#acknowledgments)

## Prerequisites/Dependencies

Notice, this was made using Windows 11 and PowerShell, code snippets might be different on Linux/Mac.

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [VSCode](https://code.visualstudio.com/) with the following extensions:
  - ESLint
  - Prettier - Code Formatter

## Installation

1. Clone this repository to your local machine:

    ```powershell
    git clone https://github.com/benakram4/fragments.git
    cd fragments
    ```

2. Initialize the project and install dependencies:

    ```powershell
    npm init -y
    npm install
    ```

## Development Tools

### ESLint

To lint your code and ensure code quality, run:

```powershell
npm run lint
```

### Prettier

Prettier is used for code formatting. It's automatically applied when you save files in VSCode.

### Structured Logging with Pino

We use Pino for structured logging. Logging configuration can be found in the `src/logger.js` file.

## Server Setup

### Start the Server

To start the server in production mode, use:

```powershell
npm start
```

The server will run at http://localhost:8080.

### Development Mode

To run the server in development mode with automatic code reloading (using Nodemon), use:

```powershell
npm run dev
```

### Debug Mode

To run the server in debug mode with the ability to attach a debugger, use:

```powershell
npm run debug
```

For detailed instructions on how to use the VSCode debugger, including setting breakpoints, and inspecting variables, see:
- https://code.visualstudio.com/docs/editor/debugging
- https://code.visualstudio.com/docs/nodejs/nodejs-debugging

## Testing

### Unit Tests

To run unit tests, use:

```powershell
npm run test:unit
```

### Integration Tests

To run integration tests, use:

```powershell
npm run test:integration
```

## Continuous Delivery

This project uses a Continuous Delivery (CD) workflow to deploy updates.

### Docker

The project uses Docker for containerization. The Dockerfile is linted using Hadolint, and images are built and pushed to Docker Hub.

### AWS

The project is integrated with AWS for deploying Docker images to Amazon Elastic Container Service (ECS). AWS credentials are configured using GitHub secrets.

### Workflow

The `.github/workflows/cd.yml` file defines the CD workflow which triggers on pushing a new tag or commits to the `main` branch. The workflow includes steps to:
- Check out the code
- Set up Docker Buildx
- Configure AWS credentials
- Build and push Docker images to Amazon ECR
- Update ECS task definitions and deploy the new image

## Additional Information

### Troubleshooting jq Installation on Windows 11

I faced some issues with installing [jq](https://stedolan.github.io/jq/) on Windows 11. The jq documentation provides two installation methods:

- **Using Winget**

    You can install jq using the Winget package manager with this command:

    ```powershell
    winget install jqlang.jq
    ```

- **Downloading the Executable**

    You can download the jq executable directly, but this method requires manual addition of jq's PATH to the Windows environment variables.

## Acknowledgments

- [Cloud-computing-for-programmers-fall-2023 Lab01](https://github.com/humphd/cloud-computing-for-programmers-fall-2023/blob/main/labs/lab-01/README.md)
- [ChatGPT](https://chat.openai.com/)
- [README Template](https://gist.github.com/DomPizzie/7a5ff55ffa9081f2de27c315f5018afc)
