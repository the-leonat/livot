import { Meteor } from 'meteor/meteor';
import { Votings } from '../imports/api/votings.js';
import { Cursors } from '../imports/api/cursors.js';

Meteor.startup(() => {
  //set indexing
  Cursors.rawCollection().createIndex( { "updatedAt": 1 }, { expireAfterSeconds: 10000000 } )
  Cursors.rawCollection().createIndex( { "userId": 1}, { unique: true } )
  Cursors.rawCollection().createIndex( { "votingId": 1})

  //Start schudule timer
  SyncedCron.start();
});

