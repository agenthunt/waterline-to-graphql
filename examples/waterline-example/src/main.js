import models from './models';
import waterline from 'waterline';
import { graphql } from 'graphql';
import { getGraphQLSchemaFrom } from 'waterline-to-graphql';
import sailsDisk from 'sails-disk';
import _ from 'lodash';

let config = {
  adapters: {
    'sails-disk': sailsDisk
  },
  connections: {
    tmp: {
      adapter: 'sails-disk'
    }
  },
  defaults: {
    migrate: 'drop'
  }
};

let waterlineInstance = new waterline();
models.forEach((model) => {
  if (!model.connection) {
    model.connection = 'tmp';
  }
  waterlineInstance.loadCollection(waterline.Collection.extend(model));
});



function setupAssociations(models) {
  _.each(models, function eachInstantiatedModel(thisModel, modelID) {

    // Bind context for models
    // (this (breaks?)allows usage with tools like `async`)
    _.bindAll(thisModel);

    // Derive information about this model's associations from its schema
    // and attach/expose the metadata as `SomeModel.associations` (an array)
    thisModel.associations = _.reduce(thisModel.attributes, function(associatedWith, attrDef, attrName) {
      if (typeof attrDef === 'object' && (attrDef.model || attrDef.collection)) {
        var assoc = {
          alias: attrName,
          type: attrDef.model ? 'model' : 'collection'
        };
        if (attrDef.model) {
          assoc.model = attrDef.model;
        }
        if (attrDef.collection) {
          assoc.collection = attrDef.collection;
        }
        if (attrDef.via) {
          assoc.via = attrDef.via;
        }

        associatedWith.push(assoc);
      }
      return associatedWith;
    }, []);
  });
}

function initializeModelsWithData(models) {
  var promise = new Promise(function(resolve, reject) {
    models.user.create({
      firstName: 'John',
      lastName: 'Johnsson',
      email: 'john@johnsson.com'
    }).then(function(createdUser) {
      console.log(createdUser);
      return models.post.create({
        text: 'first post',
        from: createdUser.id
      });
    }).then(function(createdPost) {
      console.log(createdPost);
      return models.comment.create({
        text: 'first comment',
        from: createdPost.from,
        on: createdPost.id
      });
    }).then(function(createdComment) {
      console.log(createdComment);
      resolve('initalized');
    }).catch(function(err) {
      reject(err);
    });
  });
  return promise;
}

waterlineInstance.initialize(config, (err, initializedWaterlineInstance) => {
  if (err) {
    return console.error(err);
  }

  var models = initializedWaterlineInstance.collections || [];
  setupAssociations(models);

  initializeModelsWithData(models).then(function(intialized) {
    let schema = getGraphQLSchemaFrom(models);
    console.log('initialized waterline models');
    console.log('*************************************');
    console.log('Executing graphql query');
    console.log('*************************************');
    var query = '{ users{firstName,lastName posts{text,comments{text}}} }';
    graphql(schema, query).then(result => {

      // Prints
      // {
      //   data: { users: [...] }
      // }
      console.log(JSON.stringify(result, null, 2));
    });
  }).catch((err) => {
    console.error(err);
  });



});
