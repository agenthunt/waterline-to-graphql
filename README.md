# waterline-to-graphql
##Stability status: alpha
Waterline to graphql adapter.
This library converts waterline models to graphql types. 

[![build status](https://img.shields.io/travis/agenthunt/waterline-to-graphql/master.svg?style=flat-square)](https://travis-ci.org/agenthunt/waterline-to-graphql) 
[![npm version](https://img.shields.io/npm/v/waterline-to-graphql.svg?style=flat-square)](https://www.npmjs.com/package/agenthunt/waterline-to-graphql) 
[![npm downloads](https://img.shields.io/npm/dm/waterline-to-graphql.svg?style=flat-square)](https://www.npmjs.com/package/waterline-to-graphql)


##Basic Usage: (See waterline-example in examples folder)

```javascript
import { getGraphQLSchemaFrom } from 'waterline-to-graphql'; 
.....
```

* Pass in intialized models aka waterline collections.
* If you are using standalone waterline models need to be patched with associations array. [See here](https://github.com/balderdashy/waterline/issues/797) . See waterline-example in
examples folder
* If you are passing in sails.models, you dont need the above patch

```javascript
let schema = getGraphQLSchemaFrom(models);
```

* Execute graphql query

```javascript
var query = '{ users{firstName,lastName posts{text,comments{text}}} }';
    graphql(schema, query).then(result => {
      console.log(JSON.stringify(result, null, 2));
    });
```

* Example transformation
Waterline
```javascript
module.exports = {
  identity: 'user',
  attributes: {
    firstName: {
      type: 'string',
      required: true
    },
    lastName: {
      type: 'string',
      required: true
    },
    email: {
      type: 'email',
      required: true
    },
    phone: 'string',
    posts: {
      collection: 'post',
      via: 'from'
    },
    comments: {
      collection: 'comment',
      via: 'from'
    }
  }
};
```
GraphQL
```javascript
// User
let UserType = new GraphQLObjectType({
  name: 'user',
  fields: () => ({
    firstName: {
      type: GraphQLString
    },
    lastName: {
      type: GraphQLString
    },
    email: {
      type: GraphQLString
    },
    phone: GraphQLString,
    posts: {
      type: new GraphQLList(PostType)
    },
    comments: {
      type: new GraphQLList(CommentType)
    }
  }),
  interfaces:[Node]
});
```

##Using with sails,express,relay:
If  you are using with express/sails , you can define graphql middleware 
as below. Add the following in config/http.js.
###See (react-relay-graphql-sails-example)

```javascript
    graphql: function(req, res, next) {
      console.log('executing graphql query');
      if (req.url === '/graphql') {
        var schema = getGraphQLSchemaFrom(sails.models);
        require('express-graphql')({
            schema: schema,
            pretty: true
          })(req, res);
      } else {
        return next();
      }
    }
```


##TODO
Add mutations
Add frontend code for react-relay-graphql-sails-example