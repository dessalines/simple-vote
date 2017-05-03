package com.simplevote.db;

import com.auth0.jwt.JWT;
import com.simplevote.tools.Tools;
import com.simplevote.types.User;
import org.javalite.activejdbc.LazyList;

import java.sql.Timestamp;
import java.util.List;
import java.util.NoSuchElementException;

/**
 * Created by tyler on 4/20/17.
 */
public class Actions {

    public static User createNewUser(String name) {
        Tables.User user = Tables.User.createIt("name", name);
        return createUserObj(user);
    }

    public static User updateUser(Long userId, String name) {
        Tables.User user = Tables.User.findById(userId);
        if (name != null) user.set("name", name).saveIt();

        return createUserObj(user);
    }

    public static void deleteUser(Long userId) {
        Tables.User.findById(userId).delete();
    }

    private static User createUserObj(Tables.User user) {
        User userObj = User.create(user);

        String jwt = JWT.create()
                .withIssuer("simplevote")
                .withClaim("user_name", userObj.getName())
                .withClaim("user_id", userObj.getId().toString())
                .sign(Tools.getJWTAlgorithm());

        userObj.setJwt(jwt);

        Tables.Login login = Tables.Login.createIt(
                "user_id", user.getLongId(),
                "jwt", jwt);

        return userObj;
    }

    public static Tables.Poll getPoll(Long pollId) {
        return Tables.Poll.findById(pollId);
    }

    public static Tables.Poll createPoll(Long userId) {
        return Tables.Poll.createIt("user_id", userId);
    }

    public static Tables.Poll updatePoll(Long pollId, String title, Boolean usersCanAddQuestions) {
        Tables.Poll p = Tables.Poll.findFirst("id = ?", pollId);
        if (title != null) p.set("title", title);
        if (usersCanAddQuestions != null) p.set("users_can_add_questions", usersCanAddQuestions);
        p.saveIt();

        return p;
    }

    public static void deletePoll(Long pollId) {
        Tables.Poll.findById(pollId).delete();
    }

    public static Tables.Question createQuestion(Long userId, Long pollId) {
        return Tables.Question.createIt(
                "user_id", userId,
                "poll_id", pollId,
                "threshold", 30,
                "users_can_add_candidates", true,
                "anonymous", false);
    }

    public static Tables.Question updateQuestion(Long questionId,
                                                 String title,
                                                 Long expireTime,
                                                 Integer threshold,
                                                 Boolean usersCanAddCandidates,
                                                 Boolean anonymous) {
        Tables.Question q = Tables.Question.findById(questionId);

        // TODO do userCanAddCandidates validation on front end

        if (title != null) q.set("title", title);
        if (expireTime != null) q.set("expire_time", new Timestamp(expireTime));
        if (threshold != null) q.set("threshold", threshold);
        if (usersCanAddCandidates != null) q.set("users_can_add_candidates", usersCanAddCandidates);
        if (anonymous != null) q.set("anonymous", anonymous);

        q.saveIt();

        return q;
    }

    public static void deleteQuestion(Long questionId) {
        Tables.Question.findById(questionId).delete();
    }

    public static Tables.Candidate createCandidate(Long userId, Long questionId) {
        return Tables.Candidate.createIt("user_id", userId,
                "question_id", questionId);
    }

    public static Tables.Candidate updateCandidate(Long candidateId,
                                                 String title) {
        Tables.Candidate c = Tables.Candidate.findById(candidateId);
        if (title != null) c.set("title", title).saveIt();
        return c;
    }

    public static void deleteCandidate(Long candidateId) {
        Tables.Candidate.findById(candidateId).delete();
    }

    public static Tables.Vote createOrUpdateVote(Long userId, Long candidateId, Integer vote) {
        Tables.Vote v = Tables.Vote.findFirst("user_id = ? and candidate_id = ?", userId, candidateId);
        if (v == null) {
            v = Tables.Vote.createIt("user_id", userId,
                    "candidate_id", candidateId,
                    "vote", vote);
        } else {
            v.set("vote", vote).saveIt();
        }

        return v;
    }

    public static void deleteVote(Long userId, Long candidateId) {
        Tables.Vote.findFirst("user_id = ? and candidate_id = ?", userId, candidateId).delete();
    }

    public static Tables.Comment createComment(Long userId, Long pollId, String comment) {
        return Tables.Comment.createIt("user_id", userId,
                "poll_id", pollId,
                "comment", comment);
    }

    public static void deleteComment(Long commentId) {
        Tables.Comment.findById(commentId).delete();
    }

    public static LazyList<Tables.Comment> getPollComments(Long pollId) {
        return Tables.Comment.find("poll_id = ?", pollId).orderBy("created");
    }

    public static LazyList<Tables.User> getPollUsers(Long pollId) {
        return Tables.PollUserView.find("poll_id = ?", pollId);
    }

    public static LazyList<Tables.Question> getPollQuestions(Long pollId) {
        return Tables.Question.find("poll_id = ?", pollId).orderBy("id");
    }

    public static LazyList<Tables.Candidate> getPollCandidates(List<Long> questionIds) {
        return Tables.Candidate.find("question_id in " + Tools.convertListToInQuery(questionIds))
                .orderBy("question_id");
    }

    public static LazyList<Tables.Vote> getPollVotes(List<Long> candidateIds) {
        return Tables.Vote.find("candidate_id in " + Tools.convertListToInQuery(candidateIds))
                .orderBy("candidate_id");
    }
}
