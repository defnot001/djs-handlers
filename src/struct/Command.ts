import type { TCommand } from '../types';

export class Command {
  constructor(commandOptions: TCommand) {
    Object.assign(this, commandOptions);
  }
}
