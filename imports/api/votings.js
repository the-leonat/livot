import { Mongo } from 'meteor/mongo';
import { Cursors } from '../api/cursors.js';


export const Votings = new Mongo.Collection('votings');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('votings', () => {
        return Votings.find({});
    });
}

Votings.helpers({
    getWinningAnswerIndex() {
        let numAnswers = this.answers.length;

        let tempSums = [] 
        for(let j = 0; j < numAnswers; j++) {
            tempSums.push(0)
        }

        let sums = Cursors.find({ votingId: this._id, updatedAt: { $gte: new Date(Date.now() - 1000 * 3) } }).fetch().reduce( (sum, curr) => {
            let index = parseInt(curr.x / 100 * numAnswers)
            sum[index]++
            return sum
        }, tempSums);
        

        //Cursors.find({ votingId: this._id, updatedAt: { $gte: new Date(Date.now() - 1000 * 3) } }).fetch().forEach( e => console.log(e._id))

        let bi = 0;
        let equal = false;

        for(let i = 0; i < sums.length; i++) {
            if(sums[i] > sums[bi]) {
                bi = i
                equal = false
            } 
            else if(sums[i] == sums[bi] && i != 0) {
                equal = true
            }
        }
        if(equal) return -1
        return bi
    }
})

