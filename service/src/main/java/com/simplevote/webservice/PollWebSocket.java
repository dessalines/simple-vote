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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@WebSocket
public class PollWebSocket {


    public static Logger log = (Logger) LoggerFactory.getLogger(PollWebSocket.class);

    // A map containing the session to its correct room
    private static Map<Session, Long> sessionPollMap = new HashMap<>();

    private static Map<User, Long> userPollMap = new HashMap<>();

    enum MessageType {
        poll, pollComments, pollUsers, pollQuestions, pollCandidates, pollVotes,
        createComment, deleteComment;// TODO case on these?
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

        // Add, and send them the active users
        userPollMap.put(getUserFromSession(session), pollId);
        sendMessage(session, messageWrapper(MessageType.pollUsers,
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

        switch(getMessageType(dataStr)) {
            case createComment:
                createComment(session, dataStr);
                break;
            case deleteComment:
                deleteComment(session, dataStr);
                break;
        }

        Tools.dbClose();
    }



    @OnWebSocketClose
    public void onClose(Session session, int statusCode, String reason) {

    }


    public MessageType getMessageType(String someData) {

        MessageType messageType = null;
        try {
            JsonNode rootNode = Tools.JACKSON.readTree(someData);
            messageType = MessageType.valueOf(rootNode.get("message_type").asText());
        } catch (IOException e) {
            e.printStackTrace();
        }

        return messageType;
    }

    public void createComment(Session session, String dataStr) {

    }

    public void deleteComment(Session session, String dataStr) {

    }

    private static String messageWrapper(MessageType type, String data) {
        return "{\"message_type\":\"" + type.toString() + "\",\"data\":" + data + "}";
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
