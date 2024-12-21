import { WebSocketGateway } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { PresenceGateway } from '../presence/presence.gateway';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ReactionSocketEvents,
  ReactionsStreamEvent,
} from '../constants/reaction.events';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ReactionGateway {
  private readonly logger = new Logger(ReactionGateway.name);

  constructor(private readonly presenceGateway: PresenceGateway) {}

  /**
   * Triggered when the gateway is initialized.
   */
  afterInit() {
    this.logInfo('WebSocket Gateway Initialized');
  }

  @OnEvent(ReactionSocketEvents.IN_REACTION_BROADCAST)
  broadcastReactionsToClients(event: ReactionsStreamEvent) {
    this.presenceGateway.server.emit(
      ReactionSocketEvents.PUBLIC_REACTION_BROADCAST,
      event,
    );
  }
  /**
   * Logs informational messages with a consistent format.
   * @param message - The message to log.
   */
  private logInfo(message: string): void {
    this.logger.log(`[INFO]: ${message}`);
  }
}
