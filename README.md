# Firebase Studio - Remote AI Assistant

This is a Next.js application built in Firebase Studio that allows you to interact with an AI to execute commands on your computer.

## What is Node.js?

Node.js is a runtime environment that allows you to run JavaScript code outside of a web browser. This project uses Node.js to:
*   Run the Next.js development server and build the application.
*   Execute server-side code, including the Genkit AI flows.
*   Enable the `executeCommand` functionality, which interacts with your computer's terminal (using Node.js's built-in `child_process` module).

**In short, Node.js is essential for this application to function.**

## Prerequisites

Before you can run this application, you need to have Node.js and npm (Node Package Manager, which comes with Node.js) installed on your system.

**1. Install Node.js:**

*   **Recommended Method (Using nvm):** We recommend using Node Version Manager (nvm) to manage multiple Node.js versions.
    *   **macOS/Linux:** Follow the installation instructions on the [nvm repository](https://github.com/nvm-sh/nvm#installing-and-updating). After installing nvm, run `nvm install --lts` to install the latest Long Term Support (LTS) version of Node.js. Then run `nvm use --lts`.
    *   **Windows:** Use [nvm-windows](https://github.com/coreybutler/nvm-windows#installation--upgrades). Download and run the installer, then open a new command prompt and run `nvm install lts` followed by `nvm use <version>` (replace `<version>` with the LTS version number shown after installation).
*   **Direct Download:** Alternatively, you can download the official installer for your operating system directly from the [Node.js website](https://nodejs.org/). Download the **LTS** version.

**2. Verify Installation:**

Open your terminal or command prompt and run the following commands:

```bash
node -v
npm -v
```

You should see the installed versions of Node.js and npm printed to the console.

## Getting Started

1.  **Install Dependencies:** Once Node.js is installed, navigate to the project directory in your terminal and install the necessary project dependencies:

    ```bash
    npm install
    ```

2.  **Environment Variables:**
    *   Create a `.env` file in the root of the project (if it doesn't exist).
    *   You'll need a Google AI API key for the Genkit features. Obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey) or Google Cloud.
    *   Add the following line to your `.env` file, replacing `<YOUR_API_KEY>` with your actual key:
        ```
        GOOGLE_GENAI_API_KEY=<YOUR_API_KEY>
        ```

3.  **Run the Development Server:** Start the Next.js development server:

    ```bash
    npm run dev
    ```

4.  **Run the Genkit Development Server:** In a *separate* terminal window, start the Genkit development server (needed for the AI flows):

    ```bash
    npm run genkit:dev
    ```
    *Note: If you make changes to the AI flows (`src/ai/flows/`), you might need to restart this server or use `npm run genkit:watch`.*

5.  **Open the App:** Open [http://localhost:9002](http://localhost:9002) (or the specified port) in your browser to see the application.

## Important Security Note

The `executeCommand` feature allows the AI to run commands directly on your computer's terminal. **Executing arbitrary commands from any source, especially an AI, carries significant security risks.** This implementation includes basic sanitization and blocking of some dangerous commands, but it is **NOT foolproof** and is intended for **demonstration purposes only**.

**Do not expose this application to untrusted users or run it in production environments without implementing robust security measures**, such as:
*   Strict command allow-listing.
*   Running commands in a sandboxed environment with minimal privileges.
*   Comprehensive input validation and sanitization.
*   Detailed logging and monitoring.
