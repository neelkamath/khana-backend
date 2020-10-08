import {Express} from 'express';
import http from "http";
import WebSocket from 'ws';
import {NewOrder, UpdatedMenuItem} from './api-models';

const connections: WebSocket.Server[] = [];

export function setUpWebSocketApi(app: Express): void {
    const server = http.createServer(app).listen(3000);
    const socketServer = new WebSocket.Server({server, path: '/updates'});
    socketServer.on('connection', (socket) => {
        socket.on('message', () => connections.push(socketServer));
    });
}

export function notifyMenuUpdate(item: UpdatedMenuItem): void {
    notifyUpdate({type: 'MENU_UPDATE', ...item});
}

export function notifyOrder(userId: string, order: NewOrder): void {
    notifyUpdate({type: 'ORDER', userId, ...order});
}

export function notifyOrderPrepared(orderId: string): void {
    notifyUpdate({type: 'ORDER_PREPARED', orderId});
}

export function notifyOrderPickedUp(orderId: string): void {
    notifyUpdate({type: 'ORDER_PICKED_UP', orderId});
}

/**
 * @param update will be written as a JSON string, and sent to every client.
 */
function notifyUpdate(update: object): void {
    const message = JSON.stringify(update);
    for (const connection of connections)
        connection.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) client.send(message);
        });
}
