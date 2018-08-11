import { Mongo } from 'meteor/mongo';
import { Cursors } from '../api/cursors.js';

export const Votings = new Mongo.Collection('votings');
export const VotingSettings = {
    // time in seconds
    closingDuration: 60,
    lastCursorChangeDuration: 3
}

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('votings', (userId) => {
        check(userId, String)
        return Votings.find({ "userId": userId });
    });

    Meteor.publish('voting', (votingId) => {
        check(votingId, String)
        return Votings.find({ "_id": votingId });
    });

    Votings.after.insert((userId, doc) => {
        let votingId = doc._id;
        let scheduleDateClosing = moment(doc.deadline).subtract(VotingSettings.closingDuration, "seconds").toDate();
        let scheduleDateClosed = doc.deadline

        SyncedCron.add({
            name: 'Change Voting to closing, ' + votingId,
            schedule: (parser) => {
                return parser.recur().on(scheduleDateClosing).fullDate();
            },
            job: () => {
                Votings.update(
                    { _id: votingId },
                    {
                        $set: {
                            state: "closing",
                        }
                    }
                )
            }
        })

        SyncedCron.add({
            name: 'Change Voting to closed, ' + votingId,
            schedule: (parser) => {
                return parser.recur().on(scheduleDateClosed).fullDate();
            },
            job: () => {
                let voting = Votings.findOne({ _id: votingId });

                Votings.update(
                    { _id: votingId },
                    {
                        $set: {
                            state: "closed",
                            winningAnswerIndex: voting.getWinningAnswerIndex()
                        }
                    }
                )
            }
        })
    });
}

Meteor.methods({
    'votings.insert'(_userId, _question, _answers, _deadline) {
        // if(Meteor.isServer) Meteor._sleepForMs(2000); // sleeps for 5 seconds

        check(_userId, String)
        check(_question, String)
        check(_answers, [String])
        check(_deadline, Date)

        return Votings.insert(
            {
                userId: _userId,
                question: _question,
                answers: _answers,
                deadline: _deadline,
                createdAt: new Date(),
                state: "running"
            }
        )
    }
});

Votings.helpers({
    isClosing() {
        return this.deadline > moment() && this.deadline < moment().add(VotingSettings.closingDuration, "seconds")
    },
    isRunning() {
        return this.deadline > moment()
    },
    isClosed() {
        return this.deadline < moment()
    },
    getWinningAnswerIndex() {
        // if not running return saved value
        if (this.state == "closed") return this.winningAnswerIndex

        let numAnswers = this.answers.length;

        let tempSums = []
        for (let j = 0; j < numAnswers; j++) {
            tempSums.push(0)
        }

        let sums = Cursors.find({ votingId: this._id, updatedAt: { $gte: moment().subtract(VotingSettings.lastCursorChangeDuration, "seconds").toDate() } })
            .fetch()
            .reduce((sum, curr) => {
                let index = parseInt(curr.x / 100 * numAnswers)
                sum[index]++
                return sum
            }, tempSums);


        //Cursors.find({ votingId: this._id, updatedAt: { $gte: new Date(Date.now() - 1000 * 3) } }).fetch().forEach( e => console.log(e._id))

        let bi = 0;
        let equal = false;

        for (let i = 0; i < sums.length; i++) {
            if (sums[i] > sums[bi]) {
                bi = i
                equal = false
            }
            else if (sums[i] == sums[bi] && i != 0) {
                equal = true
            }
        }
        if (equal) return -1
        return bi
    }
})

