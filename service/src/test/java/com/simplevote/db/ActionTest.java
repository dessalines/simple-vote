package com.simplevote.db;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.JsonNode;
import com.simplevote.tools.Tools;
import com.simplevote.types.QuestionType;
import com.simplevote.types.User;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.LoggerFactory;

import java.io.IOException;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

/**
 * Created by tyler on 4/20/17.
 */
public class ActionTest {

    public static Logger log = (Logger) LoggerFactory.getLogger(ActionTest.class);

//    @Before
//    public void setUp() {
//        log.getLoggerContext().getLogger("org.javalite.activejdbc").setLevel(Level.OFF);
//        Tools.dbInit();
//    }
//
//    @After
//    public void tearDown() {
//        Tools.dbClose();
//    }
//
//    @Test
//    public void testUser() {
//
//        // Test create a new user
//        User user = Actions.createNewUser("jimmy");
//        assertTrue(user.getName().equals("jimmy"));
//
//        // Make sure it persisted the login
//        assertTrue(Tables.Login.findFirst("user_id = ?", user.getId()).exists());
//
//        // Test update user
//        user = Actions.updateUser(user.getId(), "jammie");
//        assertTrue(Tables.User.findById(user.getId()).getString("name").equals("jammie"));
//
//        // verify decoded JWT token
//        DecodedJWT dJWT = Tools.decodeJWTToken(user.getJwt());
//        assertTrue(dJWT.getClaim("user_name").asString().equals(user.getName()));
//        assertTrue(user.getId().toString().equals(dJWT.getClaim("user_id").asString()));
//        assertTrue(dJWT.getIssuer().equals("simplevote"));
//
//        // Now remove the user
//        Actions.deleteUser(user.getId());
//
//        // Make sure it was deleted
//        try {
//            assertTrue(Tables.User.findFirst("id = ?", user.getId()).exists());
//            fail();
//        } catch(NullPointerException e) {}
//
//    }
//
//    @Test
//    public void testPoll() {
//        User user = Actions.createNewUser("jimmy");
//
//        // Create it
//        Tables.Poll p = Actions.createPoll(user.getId());
//        assertTrue(p.exists());
//
//        // Update it
//        p = Actions.updatePoll(p.getLongId(), "garpfish", false);
//        assertTrue(p.getString("title").equals("garpfish"));
//        assertFalse(p.getBoolean("users_can_add_questions"));
//
//        // Make sure it was deleted
//        Actions.deletePoll(p.getLongId());
//        try {
//            assertTrue(Tables.Poll.findById(p.getLongId()).exists());
//            fail();
//        } catch(NullPointerException e) {}
//
//        Actions.deleteUser(user.getId());
//
//    }
//
//    @Test
//    public void testQuestion() {
//        User user = Actions.createNewUser("jimmy");
//
//        // Create a Poll
//        Tables.Poll p = Actions.createPoll(user.getId());
//
//        // Create it
//        Tables.Question q = Actions.createQuestion(user.getId(), p.getLongId());
//        assertTrue(q.exists());
//
//        // Update it
//        q = Actions.updateQuestion(q.getLongId(),
//                "garpfish",
//                null,
//                90,
//                null,
//                true,
//                QuestionType.Range.ordinal());
//
//        assertTrue(q.getString("title").equals("garpfish"));
//        assertTrue(q.getTimestamp("expire_time") == null);
//        assertTrue(q.getInteger("threshold").equals(90));
//        assertTrue(q.getBoolean("anonymous").equals(true));
//        assertTrue(q.getInteger("question_type_id").equals(1));
//
//
//        // Make sure it was deleted
//        Actions.deleteQuestion(q.getLongId());
//        try {
//            assertTrue(Tables.Question.findById(q.getLongId()).exists());
//            fail();
//        } catch(NullPointerException e) {}
//
//        Actions.deleteUser(user.getId());
//    }
//update databasechangelog set filename = '/tmp/.simplevote.tmp/liquibase/changelogs/2018-02-01.1.sql' where filename ='src/main/resources/liquibase/changelogs/2018-02-01.sql';
//
//    @Test
//    public void testCandidate() {
//        User user = Actions.createNewUser("jimmy");
//
//        // Create a Poll
//        Tables.Poll p = Actions.createPoll(user.getId());
//
//        // Create a question
//        Tables.Question q = Actions.createQuestion(user.getId(), p.getLongId());
//
//        // Create it
//        Tables.Candidate c = Actions.createCandidate(user.getId(), q.getLongId());
//        assertTrue(c.exists());
//
//        // Update it
//        c = Actions.updateCandidate(c.getLongId(), "garpfish");
//        assertTrue(c.getString("title").equals("garpfish"));
//
//        // Make sure it was deleted
//        Actions.deleteCandidate(c.getLongId());
//        try {
//            assertTrue(Tables.Candidate.findById(c.getLongId()).exists());
//            fail();
//        } catch(NullPointerException e) {}
//
//        Actions.deleteUser(user.getId());
//    }
//
//    @Test
//    public void testVote() {
//        User user = Actions.createNewUser("jimmy");
//
//        // Create a Poll
//        Tables.Poll p = Actions.createPoll(user.getId());
//
//        // Create a question
//        Tables.Question q = Actions.createQuestion(user.getId(), p.getLongId());
//
//        // Create a candidate
//        Tables.Candidate c = Actions.createCandidate(user.getId(), q.getLongId());
//
//        // Create it
//        Tables.Vote v = Actions.createOrUpdateVote(user.getId(), c.getLongId(), 36);
//        assertTrue(v.getInteger("vote").equals(36));
//
//        // Update it
//        v = Actions.createOrUpdateVote(user.getId(), c.getLongId(), 21);
//        assertTrue(v.getInteger("vote").equals(21));
//
//        // Make sure it was deleted
//        Actions.deleteVote(user.getId(), c.getLongId());
//        try {
//            assertTrue(Tables.Vote.findById(v.getLongId()).exists());
//            fail();
//        } catch(NullPointerException e) {}
//
//        Actions.deleteUser(user.getId());
//    }
//
//    @Test
//    public void testComment() {
//        User user = Actions.createNewUser("jimmy");
//
//        // Create a Poll
//        Tables.Poll p = Actions.createPoll(user.getId());
//
//        // create a comment
//        Tables.Comment c = Actions.createComment(user.getId(), p.getLongId(), "garpfish");
//        assertTrue(c.getString("comment").equals("garpfish"));
//
//        // Make sure it was deleted
//        Actions.deleteComment(c.getLongId());
//        try {
//            assertTrue(Tables.Comment.findById(c.getLongId()).exists());
//            fail();
//        } catch(NullPointerException e) {}
//
//        Actions.deleteUser(user.getId());
//    }
//
//    @Test
//    public void testJacksonConvert() {
//        String test = "{\"message_type\":7,\"data\":{\"comment\":\"asdfsadf\"}}";
//
//        try {
//            JsonNode node = Tools.JACKSON.readTree(test);
//            assertTrue(node.get("message_type").asInt() == 7);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }


}
