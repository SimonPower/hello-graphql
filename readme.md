## 初探GraphQL

记一次上手graphql的过程，方便以后查阅，文章通篇主要使用javascript写代码，其他语言也同理。

#### 1.安装

选择自己需要的语言对应的安装方式。这里选择`javascript`的`Apollo Server`，因为`Apollo Server` 支持所有的 `Node.js HTTP` 服务器框架：`Express`、`Connect`、`HAPI` 和 `Koa`。这里主要使用`express`。

在项目目录中执行：

```
npm install apollo-server-express express
```

注：这里使用的是2.0以上版本，[GraphQL官网安装](https://graphql.cn/code/#javascript)是1.0版本，所以安装的不一样。


#### 2.定义schema

`schema`是用来描述可以查询的数据及其对应的数据类型，可以理解为定义一些接口的格式。

项目中新建`schema.js`，写上以下代码：

```
const { gql } = require('apollo-server-express');

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
```

解释：

1. 首先引入`gql`，使用了ES6的[带标签的模板字符串](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates)语法，是用于检测是否包含graphql schema语言。
2. `gql`后面跟着的是schema语法的字符串，其中`type Query`里面定义了我们可以查询的两个数据`launches`和`launch`。
3. 先看`launches`是一个数组类型，数组中每一个值都是名为`LaunchType`的对象类型，`type LaunchType`定义了该对象的结构，其中，`Int、String、Boolean`是schema语法的基本类型，`RocketType`又是另一个对象。
4. 我们回头再看`launch`，不同的是一个对象类型`LaunchType`，很好理解，`launch`就是单个的意思，对应单个对象而不是数组。不同的是后面有括号`(flight_number: Int)`，这里是定义了可传入参数及其类型。

#### 3.定义数据解析

第2步我们定义了schema，我们还需定义其对应的数据解释器。

在`schema.js`中加上:

```
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
```

解释：
1. `Query`的意思是查询类型，在该对象下的为查询接口；
2. `launches`和`launch`分别对应的接口数据解析器，即方法，方法可带上参数，第二个参数`args`是常用的，对应格式定义的一些参数。

#### 4.启动服务

启动express服务，并且将appollo服务应用到其中作为中间件。

新建`index.js`：

```
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
```

启动：

```
node index.js
```

#### 5.调试

`Apollo Server`自带GraphiQL工具，使调试graphql接口很方便。

打开连接：

```
http://localhost:4000/graphql
```

就能看到以下界面：

![image](http://note.youdao.com/yws/public/resource/24ee1a87656cc552f96d22f4e28e5297/xmlnote/03553A6AD9B9481D872C44F7F8896FA9/10210)

通过GraphiQL请求：

##### 查询列表：

左侧输入要请求的数据结构：
```
query {
	launches {
	    flight_number
        mission_name
        launch_date_local
        launch_success
        rocket {
            rocket_id
            rocket_name
            rocket_type
        }
    }
}
```

数据结果：

![image](http://note.youdao.com/yws/public/resource/24ee1a87656cc552f96d22f4e28e5297/xmlnote/6EEE1C110EC14AF8A24D865F214C4C80/10214)

##### 单个查询：

左侧输入要请求的数据结构和相关参数：

```
query ($flightNumber: Int){
    launch(flight_number: $flightNumber){
    flight_number
    mission_name
    launch_date_local
    launch_success
        rocket{
            rocket_id
            rocket_name
            rocket_type
        }
    }
}
```

```
{
    flightNumber": 3
}
```

数据结果：
![image](http://note.youdao.com/yws/public/resource/24ee1a87656cc552f96d22f4e28e5297/xmlnote/1441FD35E7D349C9B17E3A370EF75D0D/10212)

#### 6.参考

[GraphQL 官方入门](https://graphql.cn/learn/schema/)

[apollo-server-express](https://www.npmjs.com/package/apollo-server-express)

[gql解释](https://www.apollographql.com/docs/apollo-server/api/apollo-server/#gql)

[半路出家老菜鸟 - GraphQL 入门详解](https://segmentfault.com/a/1190000017766370#articleHeader6)
