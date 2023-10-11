import fs from "fs";
import path from "path";

export const fillTemplate = (template: string, variables: Record<string, string>) =>
  template.replace(/{{(.*?)}}/g, (match, key) => {
    const value = variables[key.trim()];
    return value !== undefined ? value : match;
  });

export const getHTMLTemplate = (templateName: string) =>
  fs.readFileSync(path.resolve(__dirname, `${templateName}.html`), "utf8");
