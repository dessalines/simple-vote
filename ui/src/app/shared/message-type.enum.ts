export enum MessageType {
	poll, pollComments, pollUsers, pollActiveUsers, pollQuestions, pollCandidates, pollVotes,
	updatePoll, deletePoll,
	createComment, deleteComment,
	createQuestion, deleteQuestion, updateQuestion,
	createCandidate, deleteCandidate, updateCandidate,
	createOrUpdateVote, deleteVote,
	Ping, Pong
}