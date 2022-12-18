import { ChatUserstate } from "tmi.js";
import Channel from "./Channel";

export class AwaitMessageOptions {
    filter? : (params : AwaiFilterParams) => boolean  = (params) => {return true};
    Timestamp? : number  = 200000;
    Quantity? : number   = 1;
}
export interface AwaiFilterParams {
    Tags : ChatUserstate;
    Channel : Channel;
    Content: string;
}