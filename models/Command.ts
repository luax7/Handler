import Channel from './Channel';
import tmi from 'tmi.js'
import pn5 from './Instance';
import BaseMessage from './Message';

type CallbackArgs = {
    Args : string[ ] | string;
    Channel : Channel;
    Client : pn5;
    Message : BaseMessage
}

class CommandModel {

    CommandName? : string;
    ArgsType    : "Joint" | "Stripped" = 'Stripped'
    Description? : string;

    MinArgs : number = 0;
    MaxArgs : number = 10;

    NeedMod : boolean = false;

    Aliases? : Array<string> ;

    Execute : (Args : CallbackArgs) => Promise<void> = (args) => {

        return new Promise<void> ((resolve) => {
            console.log(`Command not especified : ${__filename} `)
            resolve()

        })

    };
}

export {CommandModel, CallbackArgs}