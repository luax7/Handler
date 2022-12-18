import { CommandModel } from "../models/Command";
import pn5 from "../models/Instance";
import BaseMessage from "../models/Message";
import Channel from "../models/Channel";

export default (Channel : Channel , Command : CommandModel,Args: string[],Message : BaseMessage, Client : pn5) => {
    let err = 0
    let args : string | string[] ;
    try {

        //Check for args

        if(Args.length < Command.MinArgs || Args.length > Command.MaxArgs){
            err++
        }
        //Set the reurned args
        if(Command.ArgsType == 'Joint'){
            args = Args.join(' ')
        }else args = Args
        //Check if needmod

        if(Command.NeedMod && !Message.Payload.Tags.mod) err++
    }
    finally{

        if(err) return;

        Command.Execute({
            Channel:Channel,
            Args:args!,
            Client :Client,
            Message:Message
        })

    }

}