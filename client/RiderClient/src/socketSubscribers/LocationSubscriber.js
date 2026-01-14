import { subscribeTopic } from '../api/ws';

export const locationSubscribe = (_client, onMessage) => {
    return subscribeTopic("/topic/locations", (message) => {
        const data = JSON.parse(message.body);
        onMessage(data);
    });
}