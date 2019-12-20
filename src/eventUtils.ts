import { EventEmitter } from 'events';

const ee = new EventEmitter();
export function bindItemOutEvent(callback) {
    ee.on('itemOut', (params) => {
        callback(params);
    });
}

export function emitItemOutEvent(params) {
    ee.emit('itemOut', params);
}

export function bindItemDropEvent(callback) {
    ee.on('itemDrop', (params) => {
        callback(params);
    });
}

export function emitItemDropEvent(params) {
    ee.emit('itemDrop', params);
}
