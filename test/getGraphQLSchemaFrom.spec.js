import expect from 'expect';
import { getGraphQLSchemaFrom } from '../src/index';
import * as WaterlineHelper from './helpers/WaterlineHelper';
import { GraphQLSchema, graphql } from 'graphql';


describe('getGraphQLSchemaFrom', () => {
  var models;
  before((done) => {
    WaterlineHelper.getWaterlineModels((err, result) => {
      models = result;
      done();
    });
  });

  it('Invalid input args', () => {
    expect(() => getGraphQLSchemaFrom(undefined)).toThrow();
  });

  it('check schema', () => {
    let schema = getGraphQLSchemaFrom(models);
    expect(schema instanceof GraphQLSchema).toBe(true);
  });



  var res = {
    data: {
      users: [
        {
          firstName: 'John',
          lastName: 'Johnsson',
          posts: [
            {
              text: 'first post',
              comments: [
                {
                  text: 'first comment'
                }
              ]
            }
          ]
        }
      ]
    }
  };
  it('initialize data and run nested query', (done) => {
    let schema = getGraphQLSchemaFrom(models);
    var query = '{ users{firstName,lastName posts{text,comments{text}}} }';
    WaterlineHelper.initializeModelsWithData(models).then(() => {
      return graphql(schema, query);
    }).then(result => {
      expect(result).toEqual(res);
      done();
    }).catch((error) => {
      expect(error).toBe(null, error);
      done();
    });
  });
});