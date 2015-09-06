# waterline-to-graphql
##Stability status: alpha
Waterline to graphql adapter.
This library converts waterline models to graphql types. 


##Basic Usage: (See waterline-example in examples folder)

```javascript
import { getGraphQLSchemaFrom } from 'waterline-to-graphql'; 
.....
```

* Pass in intialized models aka waterline collections.
* Associations need to be setup. See waterline-example in
examples folder

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

##Using with sails,express,relay:
##See (react-relay-graphql-sails-example)


##TODO
Add mutations