import { FileComponent } from "discord.js";
import fs from "fs/promises";
import path from "path";

export async function writeToFile(data, fileName, TEMP_DIR){
    if (!fileName) throw new Error("writeToFile called without filename");

    const directory = path.join(process.cwd(), 'data', TEMP_DIR);
    const filePath = path.join(directory, `${fileName}.json`);

    // make sure the directory exists
    await fs.mkdir(directory, { recursive: true });

    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
        console.error("Error writing file", err);
    }
}

export async function readFromFile(TEMP_DIR, fileName){
    if (!fileName) throw new Error("readFromFile called without filename");

    const directory = path.join(process.cwd(), 'data', TEMP_DIR);
    const filePath = path.join(directory, `${fileName}.json`);

    // make sure the directory exists
    await fs.mkdir(directory, { recursive: true });

    try {
        const jsonData = await fs.readFile(filePath, "utf8");
        const data = JSON.parse(jsonData);
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Error reading from file", err);
        return [];
    }
}

export function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function filePath(TEMP_DIR, fileName){
    if (!fileName) throw new Error("filePath called without filename");

    const directory = path.join(process.cwd(), 'data', TEMP_DIR);
    const filePath = path.join(directory, `${fileName}.json`);

    return filePath;
}