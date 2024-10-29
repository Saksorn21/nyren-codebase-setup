import { EventEmitter } from 'node:events'

class Taxi extends EventEmitter{
}
const taxi = new Taxi()


process.on('message', (event) => taxi.emit(event))

if (process.send) {
  const originalEmit = taxi.emit;
  taxi.emit = function (event, data) {

    process.send({ type: event, data: data });

    
    originalEmit.apply(taxi, arguments);
  };
}

export default taxi