import _ from 'lodash';
import {
  GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString,
  GraphQLInterfaceType, GraphQLInputObjectType
}
from 'graphql';

import {
  mutationWithClientMutationId
}
from 'graphql-relay';

function waterlineTypesToGraphQLType(attribute) {
  switch(attribute.type) {
    case 'string':
      return GraphQLString;
    case 'integer':
      return GraphQLInt;
    case 'boolean':
      return GraphQLBoolean;
    case 'float':
      return GraphQLFloat;
    default:
      return GraphQLString;
  }
}

function createGraphQLTypeForWaterlineModel(model, modelID, Node, GraphQLSchemaManager) {
  var attributes = model._attributes;
  return new GraphQLObjectType({
    name: modelID,
    description: model.description,
    interfaces: [Node],
    fields: () => {
      var convertedFields = {};
      _.mapKeys(attributes, function(attribute, key) {
        if(attribute.type) {
          var field = {
            type: waterlineTypesToGraphQLType(attribute),
            description: attribute.description
          };
          convertedFields[key] = field;
        }
      });
      var idField = {
        type: new GraphQLNonNull(GraphQLString)
      };
      var typeField = {
        type: new GraphQLNonNull(GraphQLString)
      };
      convertedFields.id = idField;
      convertedFields.type = typeField;

      var associations = model.associations;
      associations.forEach((association) => {
        if(association.model) {
          convertedFields[association.alias] = {
            type: GraphQLSchemaManager.types[association.model],
            resolve: (obj, /* args */ ) => {
              return GraphQLSchemaManager.queries[association.model][association.model].resolve(obj, {
                id: obj[association.alias].id
              });
            }
          };
        } else if(association.collection) {
          convertedFields[association.collection + 's'] = {
            type: new GraphQLList(GraphQLSchemaManager.types[association.collection]),
            resolve: (obj, /* args */ ) => {
              var searchCriteria = {};
              searchCriteria[association.via] = obj.id;
              return GraphQLSchemaManager.queries[association.collection][association.collection + 's'].resolve(
                obj, searchCriteria);
            }
          };
        }
      });
      return convertedFields;
    }
  });
}

function createGraphQLQueries(waterlineModel, graphqlType, modelID) {
  var queries = {};
  // query to get by id
  queries[modelID] = {
    type: graphqlType,
    args: {
      id: {
        name: 'id',
        type: new GraphQLNonNull(GraphQLString)
      }
    },
    resolve: (obj, {
      id
    }) => {
      return waterlineModel.find({
        id: id
      }).then(function(result) {
        return result[0];
      });
    }
  };
  // query to find based on search criteria
  queries[modelID + 's'] = {
    type: new GraphQLList(graphqlType),
    resolve: (obj, criteria) => {
      return waterlineModel.find(criteria).populateAll().then(function(results) {
        return results;
      });
    }
  };

  return queries;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function createGraphQLMutations(waterlineModel, graphqlType, modelID, GraphQLSchemaManager) {
  var mutations = {};
  var attributes = waterlineModel._attributes;
  attributes = _.omit(attributes, function(key){
    return key === 'id' || key === 'createdAt' || key=== 'updatedAt';
  });
  var convertedFields = {};
  _.mapKeys(attributes, function(attribute, key) {
    if(attribute.type) {
      var field = {
        type: waterlineTypesToGraphQLType(attribute),
        description: attribute.description
      };
      convertedFields[key] = field;
    }
  });
  /*var associations = waterlineModel.associations;
  associations.forEach((association) => {
    if(association.model) {
      convertedFields[association.alias] = {
        type: GraphQLSchemaManager.types[association.model]
      };
    } else if(association.collection) {
      convertedFields[association.collection + 's'] = {
        type: new GraphQLList(GraphQLSchemaManager.types[association.collection]),
      };
    }
  });*/



  /*mutations['create' + capitalizeFirstLetter(modelID)] = mutationWithClientMutationId({
    name: 'create' + capitalizeFirstLetter(modelID),
    inputFields: convertedFields,
    outputFields: convertedFields,
    mutateAndGetPayload: (obj) => {
      return waterlineModel.create(obj);
    }
  });*/
  
  mutations['create' + capitalizeFirstLetter(modelID)] = {
    type: graphqlType,
    args: convertedFields,
    resolve: waterlineModel.create
  };
  return mutations;
}

export default function getGraphQLSchemaFrom(models) {
  var GraphQLSchemaManager = {
    types: {},
    queries: {},
    connectionTypes: {},
    mutations: {},
    waterlineModels: models
  };

  const Node = new GraphQLInterfaceType({
    name: 'Node',
    description: 'An object with an ID',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The global unique ID of an object'
      },
      type: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'The type of the object'
      }
    }),
    resolveType: (obj) => {
      return obj.type;
    }
  });

  let nodeField = {
    name: 'Node',
    type: Node,
    description: 'A node interface field',
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLString),
        description: 'Id of node interface'
      }
    },
    resolve: (obj, {
      id
    }) => {
      var keys = _.keys(GraphQLSchemaManager);
      var allFinds = keys.map(function(key) {
        var obj = GraphQLSchemaManager[key];
        return obj.model.find({
          id: id
        });
      });
      return Promise.all(allFinds).then(function(values) {
        var foundIndex = -1;
        var foundObjs = values.find(function(value, index) {
          if(value.length == 1) {
            foundIndex = index;
            return true;
          }
        });
        foundObjs[0].type = GraphQLSchemaManager[keys[foundIndex]].type;
        return foundObjs[0];
      });
    }
  };



  _.each(models, function eachInstantiatedModel(thisModel, modelID) {
    GraphQLSchemaManager.types[modelID] = createGraphQLTypeForWaterlineModel(thisModel, modelID, Node,
      GraphQLSchemaManager);
    GraphQLSchemaManager.queries[modelID] = createGraphQLQueries(thisModel, GraphQLSchemaManager.types[modelID],
      modelID);
  });


  _.each(models, function eachInstantiatedModel(thisModel, modelID) {
    GraphQLSchemaManager.mutations[modelID] = createGraphQLMutations(thisModel, GraphQLSchemaManager.types[modelID],
      modelID, GraphQLSchemaManager);
  });


  var queryType = new GraphQLObjectType({
    name: 'Query',
    fields: () => {
      return _.reduce(GraphQLSchemaManager.queries, function(total, obj, key) {
        return _.merge(total, obj);
      }, {
        node: nodeField
      });
    }
  });

  var mutationFields = _.reduce(GraphQLSchemaManager.mutations, function(total, obj, key) {
    return _.merge(total, obj);
  });

  var mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: mutationFields
  });

  var schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType
  });

  return schema;
}
