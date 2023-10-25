# Fragments

This GitHub repository serves as the foundation of the cloud computing microservice project. It includes initial setup of development environment, GitHub repositories, API server using Node.js and Express, structured logging, HTTP testing tools, npm scripts, and VSCode debugging configurations.

## Prerequisites/Dependencies

Notice, this was made using win11 and powershell, code snippets might be different on linux/mac.

Before you begin ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version)
- [npm](https://www.npmjs.com/)
- [VSCode](https://code.visualstudio.com/) with the following extensions:
  - ESLint
  - Prettier - Code Formatter
  - Code Spell Checker

## Installation

1. Clone this repository to your local machine:

   ```powershell
   git clone https://github.com/benakram4/fragments.git
   cd your-project
   ```

## Initialize the project and install dependencies

This will install all the needed dependencies in in the package.jason file,

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

Structured Logging with Pino
We use Pino for structured logging. Logging configuration can be found in the src/logger.js file.

### Structured Logging with Pino

We use Pino for structured logging. Logging configuration can be found in the src/logger.js file.

## Server Setup

### Start the Server

To start the server in production mode, use:

```powershell
npm start
```

The server will run at <http://localhost:8080>.

### Development Mode

To run the server in development mode with automatic code reloading (using Nodemon), use:

```bash
npm run dev
```

### Debug Mode

To run the server in debug mode with the ability to attach a debugger, use:

```bash
npm run debug
```

For detailed instructions on how to use the VSCode debugger, including setting breakpoints, and inspecting variables see:

- <https://code.visualstudio.com/docs/editor/debugging>
- <https://code.visualstudio.com/docs/nodejs/nodejs-debugging>

## Additional Information

### Troubleshooting jq Installation on Windows 11

I was facing some issues with installing [jq](https://stedolan.github.io/jq/) on win 11.

The jq documentation provides two installation methods:

- #### Using Winget

  You can install jq using the Winget package manager with this command:

  ```powershell
  winget install jqlang.jq.
  ```

- #### Downloading the Executable

  you can download the jq executable directly, but this method requires manual addition of jq's PATH to the Windows environment variables.

Although the installation via Winget was successful, I faced issues when trying to run jq from the command line. It was not recognized by the operating system, and I couldn't locate its installation directory.

To help any one who encounters with a problem like this for the first time i made a guide(with the help of ChatGpt) on how to use the jq executable and add its PATH to the global environment variables.

## Acknowledgments

- [Cloud-computing-for-programmers-fall-2023 Lab01](https://github.com/humphd/cloud-computing-for-programmers-fall-2023/blob/main/labs/lab-01/README.md)
- [ChatGpt](https://chat.openai.com/)
- [README Template](https://gist.github.com/DomPizzie/7a5ff55ffa9081f2de27c315f5018afc)
