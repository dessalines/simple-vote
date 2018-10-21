package com.simplevote.webservice;

/**
 * Created by tyler on 4/20/17.
 */

import ch.qos.logback.classic.Logger;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
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

import java.text.ParseException;
import java.util.*;
import java.util.stream.Collectors;

@WebSocket
public class PollWebSocket {

  public static Logger log = (Logger) LoggerFactory.getLogger(PollWebSocket.class);

  // A map with the session to its correct room
  private static Map<Session, Long> sessionPollMap = new HashMap<>();

  // A map with the user to their poll id
  private static Map<User, Long> userPollMap = new HashMap<>();

  private static final Integer PING_DELAY = 10000;

  enum MessageType {
    poll, pollComments, pollUsers, pollActiveUsers, pollQuestions, pollCandidates, pollVotes, updatePoll, deletePoll,
    createComment, deleteComment, createQuestion, deleteQuestion, updateQuestion, createCandidate, deleteCandidate,
    updateCandidate, createOrUpdateVote, deleteVote, Ping, Pong;
  }

  @OnWebSocketConnect
  public void onConnect(Session session) throws Exception {

    Tools.dbInit();
    // Add the session to the cached map
    Long pollId = getPollIdFromSession(session);
    sessionPollMap.put(session, pollId);

    sendRecurringPings(session);

    // Send the poll
    sendMessage(session, messageWrapper(MessageType.poll, Actions.getPoll(pollId).toJson(false)));

    // Send them all the users
    sendMessage(session, messageWrapper(MessageType.pollUsers, Actions.getPollUsers(pollId).toJson(false)));

    // broadcast all the active users
    userPollMap.put(getUserFromSession(session), pollId);
    broadcastMessage(getSessionsFromPoll(pollId),
        messageWrapper(MessageType.pollActiveUsers, Tools.JACKSON.writeValueAsString(getUsersFromPoll(pollId))));

    // Send comments
    sendMessage(session, messageWrapper(MessageType.pollComments, Actions.getPollComments(pollId).toJson(false)));

    // Send the questions, collect up the IDs
    LazyList<Tables.Question> questions = Actions.getPollQuestions(pollId);
    List<Long> questionIds = questions.collect("id");
    sendMessage(session, messageWrapper(MessageType.pollQuestions, questions.toJson(false)));

    // Send the candidates
    LazyList<Tables.Candidate> candidates = Actions.getPollCandidates(questionIds);
    List<Long> candidateIds = candidates.collect("id");
    sendMessage(session, messageWrapper(MessageType.pollCandidates, candidates.toJson(false)));

    // Send the votes
    LazyList<Tables.Vote> votes = Actions.getPollVotes(candidateIds);
    sendMessage(session, messageWrapper(MessageType.pollVotes, votes.toJson(false)));

    Tools.dbClose();
  }

  @OnWebSocketMessage
  public void onMessage(Session session, String dataStr) {
    try {
      Tools.dbInit();
      JsonNode node = null;
      node = Tools.JACKSON.readTree(dataStr);

      JsonNode data = node.get("data");

      switch (getMessageType(node)) {
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
        createCandidate(session, data);
        break;
      case deleteCandidate:
        deleteCandidate(session, data);
        break;
      case updateCandidate:
        updateCandidate(session, data);
        break;
      case createOrUpdateVote:
        createOrUpdateVote(session, data);
        break;
      case deleteVote:
        deleteVote(session, data);
        break;
      case Pong:
        pongReceived(session, data);
        break;
      }

    } catch (Exception e) {
      e.printStackTrace();
    } finally {
      Tools.dbClose();
    }
  }

  @OnWebSocketClose
  public void onClose(Session session, int statusCode, String reason) throws Exception {
    userPollMap.remove(getUserFromSession(session));
    Long pollId = getPollIdFromSession(session);
    sessionPollMap.remove(session);

    // broadcast all the active users
    broadcastMessage(getSessionsFromPoll(pollId),
        messageWrapper(MessageType.pollActiveUsers, Tools.JACKSON.writeValueAsString(getUsersFromPoll(pollId))));

  }

  public MessageType getMessageType(JsonNode node) {
    return MessageType.values()[node.get("message_type").asInt()];
  }

  public void createComment(Session session, JsonNode data) {
    Long pollId = getPollIdFromSession(session);
    Long userId = getUserFromSession(session).getId();

    Tables.Comment c = Actions.createComment(userId, pollId, data.get("comment").asText());

    broadcastMessage(getSessionsFromPoll(pollId), messageWrapper(MessageType.createComment, c.toJson(false)));

  }

  public void deleteComment(Session session, JsonNode data) {
    Long pollId = getPollIdFromSession(session);
    Long commentId = data.get("comment_id").asLong();
    Actions.deleteComment(commentId);

    broadcastMessage(getSessionsFromPoll(pollId), messageWrapper(MessageType.deleteComment, data.toString()));
  }

  public void updatePoll(Session session, JsonNode data) {
    Long pollId = getPollIdFromSession(session);

    String title = (Tools.notNull(data.get("title"))) ? data.get("title").asText() : null;
    Boolean usersCanAddQuestions = (Tools.notNull(data.get("users_can_add_questions")))
        ? data.get("users_can_add_questions").asBoolean()
        : null;
    String predefinedUserList = (Tools.notNull(data.get("predefined_user_list")))
        ? data.get("predefined_user_list").asText()
        : null;

    Tables.Poll p = Actions.updatePoll(pollId, title, usersCanAddQuestions, predefinedUserList);

    broadcastMessage(getSessionsFromPoll(pollId), messageWrapper(MessageType.updatePoll, p.toJson(false)));
  }

  public void deletePoll(Session session) {
    Long pollId = getPollIdFromSession(session);
    Actions.deletePoll(pollId);

    broadcastMessage(getSessionsFromPoll(pollId), messageWrapper(MessageType.deletePoll, null));
  }

  public void createQuestion(Session session) {
    Long pollId = getPollIdFromSession(session);
    Long userId = getUserFromSession(session).getId();

    Tables.Question q = Actions.createQuestion(userId, pollId);

    broadcastMessage(getSessionsFromPoll(pollId), messageWrapper(MessageType.createQuestion, q.toJson(false)));

  }

  public void deleteQuestion(Session session, JsonNode data) {
    Long pollId = getPollIdFromSession(session);
    Long questionId = data.get("question_id").asLong();
    Actions.deleteQuestion(questionId);

    broadcastMessage(getSessionsFromPoll(pollId), messageWrapper(MessageType.deleteQuestion, data.toString()));

  }

  public void updateQuestion(Session session, JsonNode data) {
    Long pollId = getPollIdFromSession(session);

    Long questionId = data.get("id").asLong();
    String title = (Tools.notNull(data.get("title"))) ? data.get("title").asText() : null;
    Long expireTime = null;
    try {
      expireTime = (Tools.notNull(data.get("expire_time")))
          ? Tools.SDF.parse(data.get("expire_time").asText()).getTime()
          : null;
    } catch (ParseException e) {
      e.printStackTrace();
    }
    Integer threshold = (Tools.notNull(data.get("threshold"))) ? data.get("threshold").asInt() : null;
    Boolean usersCanAddCandidates = (Tools.notNull(data.get("users_can_add_candidates")))
        ? data.get("users_can_add_candidates").asBoolean()
        : null;
    Boolean anonymous = (Tools.notNull(data.get("anonymous"))) ? data.get("anonymous").asBoolean() : null;
    Integer questionTypeId = (Tools.notNull(data.get("question_type_id"))) ? data.get("question_type_id").asInt()
        : null;

    Tables.Question q = Actions.updateQuestion(questionId, title, expireTime, threshold, usersCanAddCandidates,
        anonymous, questionTypeId);

    broadcastMessage(getSessionsFromPoll(pollId), messageWrapper(MessageType.updateQuestion, q.toJson(false)));
  }

  public void createCandidate(Session session, JsonNode data) {
    Long pollId = getPollIdFromSession(session);
    Long userId = getUserFromSession(session).getId();
    Long questionId = data.get("question_id").asLong();

    Tables.Candidate c = Actions.createCandidate(userId, questionId);

    broadcastMessage(getSessionsFromPoll(pollId), messageWrapper(MessageType.createCandidate, c.toJson(false)));
  }

  public void deleteCandidate(Session session, JsonNode data) {
    Long pollId = getPollIdFromSession(session);
    Long candidateId = data.get("candidate_id").asLong();
    Actions.deleteCandidate(candidateId);

    broadcastMessage(getSessionsFromPoll(pollId), messageWrapper(MessageType.deleteCandidate, data.toString()));

  }

  public void updateCandidate(Session session, JsonNode data) {
    Long pollId = getPollIdFromSession(session);

    Long candidateId = data.get("id").asLong();
    String title = (Tools.notNull(data.get("title"))) ? data.get("title").asText() : null;

    Tables.Candidate c = Actions.updateCandidate(candidateId, title);

    broadcastMessage(getSessionsFromPoll(pollId), messageWrapper(MessageType.updateCandidate, c.toJson(false)));
  }

  public void createOrUpdateVote(Session session, JsonNode data) {
    Long pollId = getPollIdFromSession(session);
    Long userId = getUserFromSession(session).getId();
    Long candidateId = data.get("candidate_id").asLong();
    Integer vote = data.get("vote").asInt();

    Tables.Vote v = Actions.createOrUpdateVote(userId, candidateId, vote);
    ObjectNode newData = ((ObjectNode) data);
    newData.put("id", v.getLongId());
    newData.put("created", v.getLong("created"));

    // Forward the data instead of the vote, since it has questionId, helps for
    // searching
    broadcastMessage(getSessionsFromPoll(pollId), messageWrapper(MessageType.createOrUpdateVote, newData.toString()));
  }

  public void deleteVote(Session session, JsonNode data) {
    Long pollId = getPollIdFromSession(session);
    Long userId = data.get("user_id").asLong();
    Long candidateId = data.get("candidate_id").asLong();
    Actions.deleteVote(userId, candidateId);

    broadcastMessage(getSessionsFromPoll(pollId), messageWrapper(MessageType.deleteVote, data.toString()));

  }

  private void sendRecurringPings(Session session) {
    final Timer timer = new Timer();
    final TimerTask tt = new TimerTask() {
      @Override
      public void run() {
        if (session.isOpen()) {
          sendMessage(session, messageWrapper(MessageType.Ping, "{}"));
        } else {
          timer.cancel();
          timer.purge();
        }
      }
    };

    timer.scheduleAtFixedRate(tt, PING_DELAY, PING_DELAY);
  }

  private void pongReceived(Session session, JsonNode data) {
    log.debug("Pong received from " + session.getRemoteAddress());
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

    return User.create(jwt);
  }

  private Set<Session> getSessionsFromPoll(Long pollId) {
    return sessionPollMap.entrySet().stream().filter(e -> e.getValue().equals(pollId)).map(Map.Entry::getKey)
        .collect(Collectors.toSet());
  }

  private Set<User> getUsersFromPoll(Long pollId) {
    return userPollMap.entrySet().stream().filter(e -> e.getValue().equals(pollId)).map(Map.Entry::getKey)
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
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
