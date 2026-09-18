# AI Log

## # AI Collaboration Log

### Prompt used for both tools

I am a beginner building a project called neighborhood-listing-platform. In plain language, please do explain the proposed stack: Next.js, TypeScript, Tailwind CSS, ESLint, the Next.js App Router, a src directory, and accessible HTML. Explain what each part does and how they work together. Also explain what “no secrets” means. Do not give me a large code dump please.

### ChatGPT summary

Next.js is the main framework for building the website, the App Router connects all folders to pages and the src folder keeps the code well organized. TypeScript helps at catching coding mistakes, Tailwind CSS is in charge of the design, ESLint checks code quality, and accessible HTML makes the site usable for other people with different needs. "No secrets" refers to never uploading sensitive information to GitHub such as; passwords, API keys, or other private information to GitHub.

### Gemini summary

The stack is a collection of tools that work together to organize, style, check most importantly build the app. The purpose of Next.js is to create fast functional web applications, TypeScript is to check for errors, Tailwind CSS is to customize the appearance of the website app, ESLint is for checking spell based errors in the code, App Router is for organizing pages to files and folders., the src directory, accessible HTML, and keeping secrets out of the repository.


### Two differences

1. ChatGPT ___vaguely specified the difference between Next.js and SRC directory, making them seem almost like they served the same purpose_____, while Gemini ____specified this difference a lot more better by even noting SRC directory isnt as neccessary as Next.js or ESlint that are indispensable for such projects._____________.
2. ChatGPT ____when it came to specifyng what "no secrets" meant on the topic, it gave a small and very specific list of examples_without further explaining how dangerous they can be towards us in the hands of the wrong people ___, while Gemini ________specifically said at the beginning of the explanation that "no secrets" can reffer to "any" sensitive piece of data that can grant access.____________.

## AI Use Record

## AI Use Record

| Tool | Prompt | Output used | Output rejected | Verification | Commit |
| --- | --- | --- | --- | --- | --- |
| ChatGPT | Explain the project tools in plain language. | I used the explanation to understand the stack and write my Step 4 notes. | None. | I checked that it covered the tools listed in Step 4. | Create accessible Next.js app shell |
| Gemini | Explain the same project tools in plain language. | I used the response to compare it with ChatGPT. | None. | I recorded two differences between the answers. | Create accessible Next.js app shell |
| Google AI Studio | Create an App Shell Architect plan with commands and a file plan. | I used the setup instructions and file plan to understand the project structure. | I did not use the generated preview and extra code | I confirmed that the required files were created and that the local page could loaded. | Create accessible Next.js app shell |
| ChatGPT | Guide me through replacing the starter page | I used the instructions and page code to create the required heading, purpose, and three cards. | None. | I opened the page and confirmed that it loaded without a red error. | Create accessible Next.js app shell |