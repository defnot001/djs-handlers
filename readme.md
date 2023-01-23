# djs-handlers

Small package for [discord.js](https://discord.js.org/#/) written in [Typescript](https://www.typescriptlang.org/) that exports 3 classes and the corresponding types:

- Command
- Event
- ExtendedClient

### ExtendedClient

The `ExtendedClient` holds a Collection() of commands and has 2 methods that are exposed to the user.

First, you need to install the package using your package manager.

```bash
npm install djs-handlers
```

To use the client, you first need to import it and then instantiate the class.

```ts
import { ExtendedClient } from 'djs-handlers';
import { GatewayIntentBits, Partials } from 'discord.js';

const client = new ExtendedClient{
  intents: [
    GatewayIntentBits.Guilds,
  ],
  partials: [Partials.GuildMember],
}

client.start({
  botToken: 'your discord token',
  guildID: 'your guild id, if you want to register the commands to a guild',
  commandsPath: './path/to/commandfolder',
  eventsPath: './path/to/eventfolder',
  globalCommands: false,
  registerCommands: true,
})
```

The `global` property accepts a boolean indicating wether you want to register the commands to your application rather than a guild.

The `registerCommands` property accepts a boolean indicating wether you want to register the commmands on startup. You can change this during development to prevent spamming the API.

You can also remove all commands from your guild or application by using the `remove()` method.

```ts
client.removeCommands();
```

Inside your sources folder, create 2 directories with the names `commands` and `events`. Those hold all your events and the corresponding code and all your commands.

To create a new command, create a new file in `src/commands/ping.ts`.

```ts
import { Command } from 'djs-handlers'

export default new Command({
  name: 'ping',
  description: 'Pings a user!',
  options: [
    {
      name: 'target',
      description: 'The user you want to ping.',
      type: ApplicationCommandOptionType.User,
      required: true,
    }
  ]
  execute: async ({ interaction, args }) => {
    const targetUser = args.getUser('target')

    await interaction.reply(`<@${targetUser.id}>`)
  }
});
```

To create a new event, create a new file in `src/commands/ready.ts`.

```ts
import { Event } from 'djs-handlers';

export default new Event('ready', (client) => {
  console.log(`Bot is ready! Logged in as ${client.user.tag}`);
});
```

If you find any issues, please make sure to report them on the on github.
