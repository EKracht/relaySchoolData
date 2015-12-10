/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

// import { } from './database';

var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    // if (type === 'Game') {
    //   return getGame(id);
    // } else if (type === 'HidingSpot') {
    //   return getHidingSpot(id);
    // } else {
    //   return null;
    // }
  },
  (obj) => {
    // if (obj instanceof Game) {
    //   return gameType;
    // } else if (obj instanceof HidingSpot)  {
    //   return hidingSpotType;
    // } else {
    //   return null;
    // }
  }
);

var store = { dummy: 42 };

store.links = [
  {_id: 1, title: "Google", url: "https://google.com"},
  {_id: 2, title: "Yahoo", url: "yahoo.com"},
  {_id: 3, title: "HP", url: "https://hp.com"},
  {_id: 4, title: "Dell", url: "https://dell.com"},
  {_id: 5, title: "GraphQL", url: "http://graphql.org"},
  {_id: 6, title: "React", url: "http://facebook.github.io/react"},
  {_id: 7, title: "Relay", url: "http://facebook.github.io/relay"}
];

let schoolData = {
  instructors: [
    {_id:1, firstName:'Dana', lastName:'Cury', age:25, gender:'F'},
    {_id:2, firstName:'Steve', lastName:'Clawson', age:34, gender:'M'},
    {_id:3, firstName:'Greg', lastName:'Manich', age:38, gender:'M'},
    {_id:4, firstName:'Loid', lastName:'Green', age:22, gender:'M'},
    {_id:5, firstName:'Jessica', lastName:'knees', age:55, gender:'F'},
    {_id:6, firstName:'Anna', lastName:'Henderson', age:22, gender:'F'}
  ],
  students: [
    {_id:111, firstName:'Nick', lastName:'Yam', age:12, gender:'M', level:'Freshman'},
    {_id:222, firstName:'Elsa', lastName:'Yumer', age:14, gender:'F', level:'Sophomore'},
    {_id:333, firstName:'Owen', lastName:'Poper', age:11, gender:'M', level:'Senior'},
    {_id:444, firstName:'Jesse', lastName:'Green', age:10, gender:'M', level:'Juinor'},
    {_id:555, firstName:'Bob', lastName:'Ill', age:13, gender:'M', level:'Senior'},
    {_id:666, firstName:'Kim', lastName:'Henderson', age:12, gender:'F', level:'Freshman'}
  ],
  courses: [
    {_id:11, name:'Math', instructor:1, student: 111},
    {_id:22, name:'Engish', instructor:2, student: 111},
    {_id:33, name:'Physics', instructor:3, student: 222},
    {_id:44, name:'Health', instructor:4, student: 222},
    {_id:55, name:'Gym', instructor:5, student: 333},
    {_id:66, name:'History', instructor:6, student: 444}
  ],
  grades: [
    {_id:10, student:111, course:11, grade:4},
    {_id:20, student:111, course:22, grade:3},
    {_id:30, student:222, course:33, grade:0},
    {_id:40, student:222, course:44, grade:2},
    {_id:50, student:333, course:55, grade:4},
    {_id:60, student:444, course:66, grade:1}
  ]
}

let instructorType = new GraphQLObjectType({
  name: 'Instructor',
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    fullName: {
      type: GraphQLString,
      resolve: ({firstName, lastName}) => `${firstName} ${lastName}`
    },
    age: { type: GraphQLInt },
    gender: { type: GraphQLString },
    // courses: { 
    //   type: courseType,
    //   resolve: ({_id}) => {
    //     for (let i = 0; i < schoolData.courses.length; i++) {
    //       if (schoolData.courses[i].instructor = _id) {
    //         return schoolData.courses[i];
    //       }
    //     }     
    //   }
    // }
  })
});

let linkType = new GraphQLObjectType({
  name: 'Link',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: (obj) => obj._id
    },
    title: {
      type: GraphQLString,
      args: {
        upcase: { type: GraphQLBoolean }
      },
      resolve: (obj, {upcase}) => upcase ? obj.title.toUpperCase() : obj.title
     },
    url: {
      type: GraphQLString,
      resolve: (obj) => {
        return obj.url.startsWith("http") ? obj.url : `http://${obj.url}`
      }
    },
    safe: {
      type: GraphQLBoolean,
      resolve: obj => obj.url.startsWith("https")
    }
  }),
  interfaces: [nodeInterface]
});

var {connectionType: linkConnection} =
  connectionDefinitions({name: 'Link', nodeType: linkType});

var {connectionType: instructorConnection} =
  connectionDefinitions({name: 'instructor', nodeType: instructorType});


var storeType = new GraphQLObjectType({
  name: 'Store',
  fields: () => ({
    id: globalIdField('Store'),
    dummy: {
      type: GraphQLInt
    },
    links: {
      type: linkConnection,
      args: connectionArgs,
      resolve: (obj, args) => connectionFromArray(obj.links, args)
    },
    instructors: {
      type: instructorConnection,
      args: {
        ...connectionArgs,
        filter: {type: GraphQLString}
      },
      resolve: (obj, args) => {
        return connectionFromArray(obj.instructors, args)
      }
    },
    total: {
      type: GraphQLInt,
      resolve: (obj) => obj.links.length
    }
  }),
  interfaces: [nodeInterface]
});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    store: {
      type: storeType,
      resolve: () => store
    }
  }),
});

export var Schema = new GraphQLSchema({
  query: queryType,
  // Uncomment the following after adding some mutation fields:
  // mutation: mutationType
});
