/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

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
    title: 'string',
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

