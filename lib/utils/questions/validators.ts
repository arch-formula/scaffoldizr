import { kebabCase, pascalCase } from "change-case";
import type { Answers, Question } from "inquirer";
import type { StructurizrWorkspace } from "../workspace";

type Validator = Question["validate"];
type SoftwareSystem = StructurizrWorkspace["model"]["softwareSystems"][number];

export const stringEmpty = (input: string) => input.length > 0;

export const duplicatedSystemName = (input: string, answers: Answers) => {
    if (kebabCase(input) === kebabCase(answers?.systemName)) {
        return `System name "${input}" already exists`;
    }

    return true;
};

export const validateDuplicatedElements =
    (workspaceInfo: StructurizrWorkspace | undefined): Validator =>
    (input: string) => {
        if (!workspaceInfo) return true;

        const systemElements = Object.values(workspaceInfo.model)
            .flat()
            .flatMap((elm) => {
                const sysElm = elm as SoftwareSystem;
                if (sysElm.containers) {
                    return [sysElm, ...sysElm.containers];
                }

                return elm;
            })
            .map((elm) => pascalCase(elm.name.replace(/\s/g, "")));

        const elementName = pascalCase(input.replace(/\s/g, ""));
        if (systemElements.includes(elementName)) {
            return `Element with name "${elementName}" already exists.`;
        }

        return true;
    };

export const validateDuplicatedViews =
    (workspaceInfo: StructurizrWorkspace | undefined): Validator =>
    (input: string) => {
        if (!workspaceInfo) return true;

        const systemViews = Object.values(workspaceInfo.views)
            .filter((elm) => Array.isArray(elm))
            .flat()
            .map((elm) =>
                pascalCase(
                    (
                        elm as Exclude<
                            typeof elm,
                            StructurizrWorkspace["configuration"]
                        >
                    ).key.replace(/\s/g, ""),
                ),
            );

        const viewName = pascalCase(input.replace(/\s/g, ""));
        if (systemViews.includes(viewName)) {
            return `View with name "${viewName}" already exists.`;
        }

        return true;
    };

export function chainValidators(...validators: Validator[]): Validator {
    return async (input: unknown, answers?: Answers | undefined) => {
        for await (const validator of validators) {
            const validation = await validator?.(input, answers);
            if (validation !== true) return validation ?? false;
        }

        return true;
    };
}
