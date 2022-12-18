import tmijs from 'tmi.js'
import fs from 'fs'
import { CommandModel } from './Command';
import CommandHandler from '../Handlers/CommandHandler';
import BaseMessage, { MessagePayload } from './Message';
import Channel from './Channel';

export interface ClientOptions {
    Prefix? : string;
    CommandsLocale?: string | null;
    FeaturesLocale?: string | null;

}

export default class pn5 {

    public  client!: tmijs.Client;
    public  Options! : ClientOptions;
    public  commandModules : Map<string,CommandModel> ;
    public  Channels : Map<string, Channel>;

    
    constructor(Options : ClientOptions,Client : tmijs.Client){

        this.Options = Options;
        this.client = Client
        this.commandModules = new Map<string,CommandModel>();
        this.Channels = new Map<string, Channel>();
        

        if (Options.CommandsLocale != null) {
            // Find the files in the CommandsLocale directory
            const files = fs.readdirSync(Options.CommandsLocale);
            // Iterate over the files
            files.forEach((file) => {
                // Construct the path to the command module
                const commandPath = `${Options.CommandsLocale}/${file}`;
                // Use require to import the command module
                const Command = require(commandPath).default as CommandModel;
                // If the module was not found, skip to the next file
                if (!Command) return;
                // Add the command module to the map
                this.commandModules.set(file.slice(0, -3), Command);
                // If the command has no aliases, skip to the next file
                if (!Command.Aliases || Command.Aliases.length === 0) return;
                // Iterate over the aliases
                Command.Aliases.forEach((alias) => {
                    // Add the alias to the map
                    this.commandModules.set(alias, Command);
                });
            });
        }
        
        if (Options.CommandsLocale && Options.Prefix) {
            this.client.addListener('message', (channel: string, tags: tmijs.ChatUserstate, Message: string, self: boolean) => {
                // Use a regular expression to match the command prefix and extract the command name
                const match = Message.match(new RegExp(`^${Options.Prefix}(\\S+)`));
                // If there is no match, return
                if (!match) return;
                // Get the command name from the match
                const commandName = match[1];
                // If the command is not in the map, return
                if (!this.commandModules.has(commandName)) return;
                // Get the command module from the map
                const Command = this.commandModules.get(commandName)!;
                // Create a new base message
                const Msg = new BaseMessage(this.client, {
                    Channel: channel,
                    Tags: tags,
                    Content: Message,
                });
                // Call the command handler with the command module, the command arguments, and the message
                CommandHandler(
                    this.Channels.get(channel) as Channel,
                    Command,
                    Message.split(' ').slice(1),
                    Msg,
                    this
                );
            });
        }
        this.client.getOptions().channels?.forEach((element) => {

            this.Channels.set(element,(new Channel(element,this.client)))

        })
        this.client.on('message', (channel,userstate,conten,self) => {
            if(self) return
            const match = conten.match(new RegExp(`^${Options.Prefix}(\\S+)`));
                // If there is no match, return
            if (match) return;

            if(!this.Channels.has(channel)) return
            const payload = {
                Channel:channel,
                Content:conten,
                Tags:userstate
            } as MessagePayload

            this.Channels.get(channel)?.PostMessage(this.client,payload)
        })
}
    Connect (){
        this.client.connect();
    }
    Join ( ChannelName   : string) : Channel | undefined {
        this.client.join(ChannelName).catch(err => { return undefined; });

        const Chn = new Channel(ChannelName,this.client);

        this.Channels.set(ChannelName, Chn);
        return Chn;
    }


}

