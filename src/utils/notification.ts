import { Novu } from "@novu/node";
import { getConfig } from "../config";

/**
 * Creates a new instance of Novu
 * @returns A new instance of Novu
 */
export function createNovuClient() {
    const config = getConfig();
    return new Novu(config.novu.apiKey);
}