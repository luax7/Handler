import * as tmi from "tmi.js";

export type MessagePayload = {
    Content: string;
    Tags   : tmi.ChatUserstate;
    Channel: string;
}

export default class BaseMessage {

    public Payload : MessagePayload;
    private Client : tmi.Client;


    constructor(Client : tmi.Client, Payload : MessagePayload) {

        this.Client = Client;
        this.Payload = Payload;

    }

    Reply (Message : string | MessagePayload) : Promise<string[]>{

        const content = () : string => {
            if (typeof Message === "string") {
                return Message;
            }else return Message.Content;
        }

        return this.Client.say(this.Payload.Channel,content())
            .catch(err => {
                // Handle any errors that may occur when sending the message
                // For example, you could log the error, throw it, or return a default value
                console.error(err);
                throw err;
            });
    }
    public static ToJson() : string {
        return JSON.stringify(this)
    }    
    public Delete() : void {

        this.Client.deletemessage(this.Payload.Channel,this.Payload.Tags.id as string)
        return
    }
}