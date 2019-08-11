// const launches = require('./flight-all.json');
// const launch = require('./flight-first.json');
const axios = require('axios');
const { gql } = require('apollo-server-express');

// 使用schema语言构建一个shema（可以理解为一个接口定义）
const typeDefs = gql `
    type Query {
        launches: [LaunchType]
        launch(flight_number: Int): LaunchType
    }

    type LaunchType {
        flight_number: Int
        mission_name: String
        launch_date_local: String
        launch_success: Boolean
        rocket: RocketType
    }

    type RocketType {
        rocket_id: String
        rocket_name: String
        rocket_type: String
    }
`;

// 给对应的schema的提供对应的解决方法（可以理解为接口提供数据的方法）
const resolvers = {
    Query: {
        launches() {
            return axios.get('https://api.spacexdata.com/v3/launches').then(res => res.data);
            // return launches; // 同上相同结构的数据，以防上面链接失效
        },
        launch(obj, args) {
            return axios.get(`https://api.spacexdata.com/v3/launches/${args.flight_number}`)
                .then(res => res.data);
            // return launch; // 同上相同结构的数据，以防上面链接失效
        },
    }
};

module.exports = {
    typeDefs,
    resolvers,
};