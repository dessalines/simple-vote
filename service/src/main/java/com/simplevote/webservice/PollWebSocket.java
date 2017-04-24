package com.simplevote.webservice;

/**
 * Created by tyler on 4/20/17.
 */

import ch.qos.logback.classic.Logger;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.JsonNode;
import com.simplevote.db.Actions;
import com.simplevote.db.Tables;
import com.simplevote.tools.Tools;
import com.simplevote.types.User;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.javalite.activejdbc.LazyList;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@WebSocket
public class PollWebSocket {


    public static Logger log = (Logger) LoggerFactory.getLogger(PollWebSocket.class);

    // A map with the session to its correct room
    private static Map<Session, Long> sessionPollMap = new HashMap<>();

    // A map with the user to their poll id
    private static Map<User, Long> userPollMap = new HashMap<>();

    enum MessageType {
        poll, pollComments, pollUsers, pollActiveUsers, pollQuestions, pollCandidates, pollVotes,
        updatePoll, deletePoll,
        createComment, deleteComment,
        createQuestion, deleteQuestion, updateQuestion,
        createCandidate, deleteCandidate, updateCandidate
        ;
    }

    @OnWebSocketConnect
    public void onConnect(Session session) throws Exception {

        Tools.dbInit();
        // Add the session to the cached map
        Long pollId = getPollIdFromSession(session);
        sessionPollMap.put(session, pollId);

        // Send the poll
        sendMessage(session, messageWrapper(MessageType.poll,
                Actions.getPoll(pollId).toJson(false)));

        // Send them all the users
        sendMessage(session, messageWrapper(MessageType.pollUsers,
                Actions.getPollUsers(pollId).toJson(false)));

        // Add, and send them the active users
        userPollMap.put(getUserFromSession(session), pollId);
        sendMessage(session, messageWrapper(MessageType.pollActiveUsers,
                Tools.JACKSON.writeValueAsString(getUsersFromPoll(pollId))));

        // Send comments
        sendMessage(session, messageWrapper(MessageType.pollComments,
                Actions.getPollComments(pollId).toJson(false)));

        // Send the questions, collect up the IDs
        LazyList<Tables.Question> questions = Actions.getPollQuestions(pollId);
        List<Long> questionIds = questions.collect("id");
        sendMessage(session, messageWrapper(MessageType.pollQuestions,
                questions.toJson(false)));


        // Send the candidates
        LazyList<Tables.Candidate> candidates = Actions.getPollCandidates(questionIds);
        List<Long> candidateIds = candidates.collect("id");
        sendMessage(session, messageWrapper(MessageType.pollCandidates,
                candidates.toJson(false)));

        // Send the votes
        LazyList<Tables.Vote> votes = Actions.getPollVotes(candidateIds);
        sendMessage(session, messageWrapper(MessageType.pollVotes,
                votes.toJson(false)));


        Tools.dbClose();
    }

    @OnWebSocketMessage
    public void onMessage(Session session, String dataStr) {
        Tools.dbInit();
        JsonNode node = null;
        try {
            node = Tools.JACKSON.readTree(dataStr);
        } catch (IOException e) {
            e.printStackTrace();
        }

        JsonNode data = node.get("data");

        switch(getMessageType(node)) {
            case createComment:
                createComment(session, data);
                break;
            case deleteComment:
                deleteComment(session, data);
                break;
            case updatePoll:
                updatePoll(session, data);
                break;
            case deletePoll:
                deletePoll(session);
                break;
            case createQuestion:
                createQuestion(session);
                break;
            case deleteQuestion:
                deleteQuestion(session, data);
                break;
            case updateQuestion:
                updateQuestion(session, data);
                break;
            case createCandidate:
                createCandidate(session);
                break;
            case deleteCandidate:
                deleteCandidate(session, data);
                break;
            case updateCandidate:
                updateCandidate(session, data);
                break;

        }

        Tools.dbClose();
    }



    @OnWebSocketClose
    public void onClose(Session session, int statusCode, String reason) {
        userPollMap.remove(getUserFromSession(session));
        sessionPollMap.remove(session);
    }


    public MessageType getMessageType(JsonNode node) {
        return MessageType.values()[node.get("message_type").asInt()];
    }

    public void createComment(Session session, JsonNode data) {
        Long pollId = getPollIdFromSession(session);
        Long userId = getUserFromSession(session).getId();

        Tables.Comment c = Actions.createComment(userId, pollId, data.get("comment").asText());

        broadcastMessage(getSessionsFromPoll(pollId),
                messageWrapper(MessageType.createComment, c.toJson(false)));

    }

    public void deleteComment(Session session, JsonNode data) {

    }

    public void updatePoll(Session session, JsonNode data) {
        Long pollId = getPollIdFromSession(session);
        Tables.Poll p = Actions.updatePoll(pollId, data.get("title").asText(), data.get("users_can_add_questions").asBoolean());

        broadcastMessage(getSessionsFromPoll(pollId),
                messageWrapper(MessageType.updatePoll, p.toJson(false)));
    }

    public void deletePoll(Session session) {
        Long pollId = getPollIdFromSession(session);
        Actions.deletePoll(pollId);

        broadcastMessage(getSessionsFromPoll(pollId),
                messageWrapper(MessageType.deletePoll, null));
    }

    public void createQuestion(Session session) {
        Long pollId = getPollIdFromSession(session);
        Long userId = getUserFromSession(session).getId();

        Tables.Question q = Actions.createQuestion(userId, pollId);

        broadcastMessage(getSessionsFromPoll(pollId),
                messageWrapper(MessageType.createQuestion, q.toJson(false)));

    }

    public void deleteQuestion(Session session, JsonNode data) {
        Long pollId = getPollIdFromSession(session);
        Long questionId = data.get("question_id").asLong();
        Actions.deleteQuestion(questionId);

        broadcastMessage(getSessionsFromPoll(pollId),
                messageWrapper(MessageType.deleteQuestion, data.toString()));

    }

    public void updateQuestion(Session session, JsonNode data) {
        Long pollId = getPollIdFromSession(session);

        String title = (data.get("title") != null) ? data.get("title").asText() : null;
        Long expireTime = (data.get("expire_time") != null) ? data.get("expire_time").asLong() : null;
        Integer threshold = (data.get("threshold") != null) ? data.get("threshold").asInt() : null;
        Boolean usersCanAddCandidates = (data.get("user_can_add_candidates") != null) ? data.get("user_can_add_candidates").asBoolean() : null;

        Tables.Question q = Actions.updateQuestion(data.get("id").asLong(),
                title,
                expireTime,
                threshold,
                usersCanAddCandidates);

        broadcastMessage(getSessionsFromPoll(pollId),
                messageWrapper(MessageType.updateQuestion, q.toJson(false)));
    }

    public void createCandidate(Session session) {
        Long pollId = getPollIdFromSession(session);
        Long userId = getUserFromSession(session).getId();

        Tables.Candidate c = Actions.createCandidate(userId, pollId);

        broadcastMessage(getSessionsFromPoll(pollId),
                messageWrapper(MessageType.createCandidate, c.toJson(false)));

    }

    private static String messageWrapper(MessageType type, String data) {
        return "{\"message_type\":" + type.ordinal() + ",\"data\":" + data + "}";
    }



    public static Long getPollIdFromSession(Session session) {
        return Long.valueOf(session.getUpgradeRequest().getParameterMap().get("pollId").iterator().next());
    }

    public static User getUserFromSession(Session session) {
        Map<String, String> cookieMap = Tools.cookieListToMap(session.getUpgradeRequest().getCookies());
        String jwt = cookieMap.get("jwt");

        DecodedJWT dJWT = Tools.decodeJWTToken(jwt);
        Long id = Long.valueOf(dJWT.getClaim("user_id").asString());
        String name = dJWT.getClaim("user_name").asString();

        return User.create(id, name, null);
    }

    private Set<Session> getSessionsFromPoll(Long pollId) {
        return sessionPollMap.entrySet().stream()
                .filter(e -> e.getValue().equals(pollId))
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
    }

    private Set<User> getUsersFromPoll(Long pollId) {
        return userPollMap.entrySet().stream()
                .filter(e -> e.getValue().equals(pollId))
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
    }

    private static void broadcastMessage(Set<Session> sessions, String json) {
        sessions.stream().filter(Session::isOpen).forEach(session -> {
            try {
                session.getRemote().sendString(json);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    private static void sendMessage(Session session, String json) {
        try {
            session.getRemote().sendString(json);
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}