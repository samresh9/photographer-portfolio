export const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "http://localhost:" + process.env.PORT,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
    tags: [
      {
        name: "Users",
        description: "User management",
      },

      {
        name: "Albums",
        description: "Album management",
      },
      {
        name: "Files",
        description: "Access files securely",
      },
    ],
  },
  apis: ["./routes/*.ts", "./src/routes/*.ts", "./src/controllers/*.ts"],
};
