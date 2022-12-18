import BaseMessage, {MessagePayload} from "./Message";
import tmi from 'tmi.js'
import EventEmitter from "events";
import {AwaitMessageOptions} from "./awaitOptions";

export default class Channel extends EventEmitter {

    public Messages: Map<string, BaseMessage> = new Map<string, BaseMessage>();

    public Name : string = '';
    public Client : tmi.Client;


    constructor(Name : string, Client : tmi.Client) {

       super({
        captureRejections: false
      })

        this.Name = Name;
        this.Client = Client;
    }

    public PostMessage(client: tmi.Client, payload: MessagePayload): BaseMessage {
        const message = new BaseMessage(client, payload);

        this.Messages.set(payload.Tags.id as string,message);

        this.emit('MessageAdded', (message))

        return message;
    }
    public Get(Id : string) : BaseMessage | undefined {

        if(this.Messages.has(Id)) return this.Messages.get(Id);
        
        else return undefined;
    }
    public async DeleteMessage (Id : string) : Promise<BaseMessage | undefined> { 
      try {

        await this.Client.deletemessage(this.Name, Id);

      } catch (err) {
        if(err) return undefined
        const message = this.Messages.get(Id);
        this.Messages.delete(Id);

        return message;
      }
      
    }
    public async AwaitMessages(AwaitOptions: AwaitMessageOptions): Promise<BaseMessage[] | undefined> {
      let res: BaseMessage[] = [];
      let count = 0;
    
      return new Promise((resolve) => {
        this.addListener('MessageAdded', (message: BaseMessage) => {
          if (count === AwaitOptions.Quantity) {
            // If the desired number of messages has been reached, resolve the Promise with the results array
            resolve(res);
          }
          if (AwaitOptions.filter({ Channel: this, Tags: message.Payload.Tags, Content: message.Payload.Content })) {
            res.push(message);
            count++;
          }
    
          if (count === AwaitOptions.Quantity) {
            // If the desired number of messages has been reached, resolve the Promise with the results array
            resolve(res);
          }
        });
        
        // Set a timeout to resolve the Promise with `undefined` if no messages are received within the specified time
        setTimeout(() => {
          // Only resolve the Promise with `undefined` if the desired number of messages have not yet been received
          if (count < AwaitOptions.Quantity) {
            resolve(res.length > 0? res : undefined);
          }
         
          },AwaitOptions.Timestamp)
        })
    
   }
}
  