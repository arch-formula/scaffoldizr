import { relative, resolve } from "node:path";
import chalk from "chalk";
import inquirer, { Answers } from "inquirer";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { constantGenerator, workspaceGenerator } from "./generators";
import templates from "./templates/bundle";
import {
    Generator,
    GeneratorDeclaration,
    GetAnswers,
    createGenerator,
} from "./utils/generator";
import { getWorkspacePath } from "./utils/workspace";

const args = await yargs(hideBin(process.argv))
    .option("dest", {
        default: ".",
        desc: "Target architecture folder.",
    })
    .parse();

console.log(
    chalk.bold(`
Welcome to Blueprint DSL.
Create a Structurizr DSL scaffolding in seconds!
    `),
);

const prompt = inquirer.createPromptModule();
const defaultPath = resolve(process.cwd(), args.dest);
const workspacePath = getWorkspacePath(defaultPath);

if (!workspacePath) {
    console.log(`${chalk.yellow(
        'It seems the folder you selected does not have a "workspace.dsl" file.',
    )}
Base folder: ${chalk.blue(defaultPath)}
Let's create a new one by answering the questions below.
`);
    try {
        const generator: Generator<GetAnswers<typeof workspaceGenerator>> = {
            ...workspaceGenerator,
            templates,
            workspacePath: workspacePath ?? defaultPath,
        };

        await createGenerator(prompt, generator);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

console.log(
    `Architecture folder: ${chalk.blue(
        relative(process.cwd(), workspacePath),
    )}\n`,
);

const mainPrompt = inquirer.createPromptModule();
const generate = await mainPrompt<{ element: GeneratorDeclaration<Answers> }>([
    {
        name: "element",
        message: "Create a new element:",
        type: "list",
        choices: [constantGenerator].map((g) => ({
            name: g.name,
            value: g,
        })),
    },
]);

try {
    const generator: Generator<GetAnswers<typeof generate.element>> = {
        ...generate.element,
        templates,
        workspacePath: workspacePath ?? defaultPath,
    };

    await createGenerator(prompt, generator);
    process.exit(0);
} catch (err) {
    console.error(err);
    process.exit(1);
}
