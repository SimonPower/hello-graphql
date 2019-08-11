const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const schema = require('./schema');

const server = new ApolloServer(schema);

const app = express();

// 将apollo服务应用到express服务中作为一个中间件
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);