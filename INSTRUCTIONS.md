# How to Fix Your Website Using the GitHub Interface

Hello! This guide will walk you through fixing your website by making two edits directly on the GitHub website. Please follow these steps carefully. This will resolve the blank page issue.

---

## **Step 1: Update the `index.html` file**

This first change ensures your website's main page is set up correctly for the Vite build system.

1.  **Navigate to the file:** From the main page of your repository on GitHub, find and click on the `index.html` file.
2.  **Enter Edit Mode:** On the `index.html` file page, click the pencil icon (✏️) in the upper-right corner to edit the file.
3.  **Replace the Content:** Delete all the existing text in the editor and replace it by copying the entire code block below and pasting it in.

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jet Swap - Cross-Chain Bridging</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Inter', sans-serif;
                margin: 0;
                padding: 0;
                overflow-x: hidden;
            }
            /* Custom scrollbar for better crypto UI look */
            ::-webkit-scrollbar {
                width: 6px;
            }
            ::-webkit-scrollbar-track {
                background: transparent;
            }
            ::-webkit-scrollbar-thumb {
                background: rgba(156, 163, 175, 0.3);
                border-radius: 10px;
            }
        </style>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/index.tsx"></script>
    </body>
    </html>
    ```

4.  **Save the Change:**
    *   Scroll to the bottom of the page. You will see a "Commit changes" section.
    *   You can leave the default commit message.
    *   Ensure that "Commit directly to the `main` branch" (or your default branch) is selected.
    *   Click the green **"Commit changes"** button.

---

## **Step 2: Update the `geminiService.ts` file**

This second change disables the non-essential AI features that are causing the site to crash due to the missing API key.

1.  **Navigate to the file:** Go back to the main page of your repository. Click on the `services` folder, and then click on the `geminiService.ts` file.
2.  **Enter Edit Mode:** On the `geminiService.ts` file page, click the pencil icon (✏️) in the upper-right corner to edit the file.
3.  **Replace the Content:** Delete all the existing text in the editor and replace it by copying the entire code block below and pasting it in.

    ```typescript
    // import { GoogleGenAI } from "@google/genai";

    // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    export async function getSwapAdvice(source: string, dest: string, token: string) {
      // The Gemini API call has been temporarily disabled to prevent API key errors.
      return "Optimize your routes with Jet Swap's high-speed engine.";
    }

    export async function* getChatStream(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
      // The Gemini API call has been temporarily disabled to prevent API key errors.
      yield "The AI chat is temporarily unavailable. Please check back later.";
    }
    ```

4.  **Save the Change:**
    *   Scroll to the bottom and click the green **"Commit changes"** button, just like you did before.

---

## **Final Step: Check Your Vercel Deployment**

After you have saved the changes to both files, Vercel will automatically detect the updates to your repository and start a new deployment.

You can go to your Vercel dashboard to watch the progress. Once the deployment is complete, your website should be live and working correctly.
