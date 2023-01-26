import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  ClientOptions,
  Collection,
} from 'discord.js';
import glob from 'glob';
import { pathToFileURL } from 'url';
import { promisify } from 'util';
import type {
  TClientStartOptions,
  TCommand,
  TRegisterCommandOptions,
} from '../types';
import type { Event } from './Event';

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
  commands: Collection<string, TCommand> = new Collection();

  constructor(options: ClientOptions) {
    super(options);
  }

  public async start(options: TClientStartOptions) {
    const {
      botToken,
      guildID,
      commandsPath,
      eventsPath,
      type,
      globalCommands,
      registerCommands,
    } = options;

    await this.setModules(commandsPath, eventsPath, type);

    if (registerCommands) {
      const slashCommands: ApplicationCommandDataResolvable[] =
        this.commands.map((command) => command);

      this.once('ready', () => {
        if (globalCommands) {
          this.registerCommands({
            commands: slashCommands,
          });
        } else {
          this.registerCommands({
            guildID,
            commands: slashCommands,
          });
        }
      });
    }

    await this.login(botToken);
  }

  /**
   * Removes all the commands from the guild or globally.
   * If there is no `guildID` being passed, it will remove the global application commands.
   */
  public async removeCommands(guildID?: string) {
    if (guildID) {
      const guild = this.guilds.cache.get(guildID);

      if (!guild) {
        throw new Error('Cannot find the guild to remove the commands from!');
      }

      await guild.commands.set([]);

      console.log(`Removing commands from ${guild.name}...`);
    } else {
      if (!this.application) {
        throw new Error(
          'Cannot find the application to remove the commands from!',
        );
      }

      await this.application.commands.set([]);

      console.log('Removing global commands...');
    }
  }

  private async registerCommands(options: TRegisterCommandOptions) {
    const { commands, guildID } = options;

    if (guildID) {
      const guild = this.guilds.cache.get(guildID);

      if (!guild) {
        throw new Error('Cannot find the guild to register the commands to!');
      }

      await guild.commands.set(commands);

      console.log(`Registered ${commands.length} commands to ${guild.name}...`);
    } else {
      if (!this.application) {
        throw new Error(
          'Cannot find the application to register the commands to!',
        );
      }

      await this.application.commands.set(commands);

      console.log(`Registered ${commands.length}} global commands...`);
    }
  }

  private async setModules(
    commandsPath: string,
    eventsPath: string,
    type: 'commonJS' | 'module',
  ) {
    // set the commands to the collection of this client
    const commandPaths: string[] = await globPromise(
      `${commandsPath}/*{.ts,.js}`,
    );

    for await (const path of commandPaths) {
      const fileURL = pathToFileURL(path);
      const command: TCommand = await this.importFile(fileURL.toString(), type);
      if (!command.name) return;

      this.commands.set(command.name, command);
    }

    // set the events to the client
    const eventPaths: string[] = await globPromise(`${eventsPath}/*{.ts,.js}`);

    for await (const path of eventPaths) {
      const fileURL = pathToFileURL(path);
      const event: Event<keyof ClientEvents> = await this.importFile(
        fileURL.toString(),
        type,
      );
      this.on(event.name, event.execute);
    }
  }

  private async importFile(filePath: string, type: 'commonJS' | 'module') {
    if (type === 'commonJS') {
      const file = await import(filePath);
      return file.default.default;
    } else {
      const file = await import(filePath);
      return file.default;
    }
  }
}
