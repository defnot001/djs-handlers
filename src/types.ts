import type {
  ApplicationCommandDataResolvable,
  ChatInputApplicationCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  PermissionResolvable,
} from 'discord.js';
import type { ExtendedClient } from './struct/ExtendedClient';

export type TRegisterCommandOptions = {
  guildID?: string;
  commands: ApplicationCommandDataResolvable[];
};

export interface IExtendedInteraction extends CommandInteraction {
  member: GuildMember;
}

export type TCommand = {
  userPermissions?: PermissionResolvable;
  execute: (options: {
    client: ExtendedClient;
    interaction: IExtendedInteraction;
    args: CommandInteractionOptionResolver;
  }) => unknown;
} & ChatInputApplicationCommandData;

export type TClientStartOptions = {
  botToken: string;
  guildID: string;
  commandsPath: string;
  eventsPath: string;
  globalCommands: boolean;
  type: 'commonJS' | 'module';
  registerCommands: boolean;
};
