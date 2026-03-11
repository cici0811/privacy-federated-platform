const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '秘协作 API',
      version: 'V1.0',
      description: 'API documentation for the Privacy-Preserving Agent Collaboration System',
      contact: {
        name: 'Developer Support',
        email: 'support@secretcollab.io'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
};
