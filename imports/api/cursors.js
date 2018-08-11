import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check'
import { Votings } from './votings';

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

        return Cursors.find({ votingId: _votingId}, {
            fields: {
                x: 1,
                y: 1,
                updatedAt: 1,
                userId: 1,
                votingId: 1,
                icon: 1
            }
        })
    });
}

Meteor.methods({
    'voting.cursors.upsert'(_votingId, _userId, _cursorIcon, _x, _y) {
        check(_votingId, String)
        check(_userId, String)
        check(_x, Number)
        check(_y, Number)
        check(_cursorIcon, String)

        //if round is over dont update
        let voting = Votings.findOne({ _id: _votingId})
        if(voting == null) return
        if(voting.isClosed()) return


        Cursors.upsert(
            { userId: _userId },
            {
                $set: {
                    votingId: _votingId, 
                    x: _x,
                    y: _y,
                    updatedAt: new Date(),
                    icon: _cursorIcon
                }
            },
            (e,o) => { return o }
        )
    }
});
 