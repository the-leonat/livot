import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check'

export const Cursors = new Mongo.Collection('voting.cursors', { idGeneration: "MONGO" });

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('voting.cursors', (_votingId, _userId) => {
        // new SimpleSchema({
        //     votingId: {type: String}
        //   }).validate({ votingId });
        // let id = new Mongo.ObjectID(_votingId)
        check(_votingId, String)
        check(_userId, String)
        // console.log(id)

        return Cursors.find({ votingId: new Mongo.ObjectID(_votingId)}, {
            fields: {
                x: 1,
                y: 1,
                updatedAt: 1,
                userId: 1,
                votingId: 1
            }
        })
    });
}

Meteor.methods({
    'voting.cursors.upsert'(_votingId, _userId, _x, _y) {
        check(_votingId, Mongo.ObjectID)
        check(_userId, String)
        check(_x, Number)
        check(_y, Number)

        Cursors.upsert(
            { userId: _userId },
            {
                $set: {
                    votingId: _votingId, 
                    x: _x,
                    y: _y,
                    updatedAt: new Date()
                }
            },
            (e,o) => { return o }
        )
    }
});
 