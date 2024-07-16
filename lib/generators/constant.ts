import { input } from "@inquirer/prompts";
import type { AppendAction } from "../utils/actions";
import type { GeneratorDefinition, QuestionsObject } from "../utils/generator";
import { stringEmpty } from "../utils/questions/validators";

const generator: GeneratorDefinition = {
    name: "Constant",
    description: "Create a new workspace constant",
    questions: {
        constantName: () =>
            input({
                message: "Constant:",
                required: true,
                validate: stringEmpty,
            }),
        constantValue: () =>
            input({
                message: "Value:",
                default: "New Value",
                required: true,
                validate: stringEmpty,
            }),
    } as QuestionsObject,
    actions: [
        {
            type: "append",
            path: "architecture/workspace.dsl",
            pattern: /# Constants/,
            templateFile: "templates/constant.hbs",
        } as AppendAction,
    ],
};

export default generator;
