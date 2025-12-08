const path = require('path');

module.exports = {
  turbopack: {
    root: path.resolve(__dirname) // usa ruta absoluta al directorio frontend
  },
  // allowedDevOrigins si necesitas acceder desde IP de red:
  // experimental: { allowedDevOrigins: ['http://192.168.1.3:3001'] }
};