package com.simplevote.db;

import ch.qos.logback.classic.Logger;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.simplevote.tools.Tools;
import com.simplevote.types.User;
import org.javalite.activejdbc.LazyList;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.omg.SendingContext.RunTime;
import org.slf4j.LoggerFactory;

import java.util.NoSuchElementException;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

/**
 * Created by tyler on 4/20/17.
 */
public class ActionTest {

    public static Logger log = (Logger) LoggerFactory.getLogger(ActionTest.class);

    @Before
    public void setUp() {
        Tools.dbInit();
    }

    @After
    public void tearDown() {
        Tools.dbClose();
    }

    @Test
    public void testCreateNewUser() {

        User user = Actions.createNewUser("jimmy");


        assertTrue(user.getName().equals("jimmy"));

        // Make sure it persisted the login
        assertTrue(Tables.Login.findFirst("user_id = ?", user.getId()).exists());

        assertTrue(user.getName().equals("jimmy"));

        // verify decoded JWT token
        DecodedJWT dJWT = Tools.decodeJWTToken(user.getJwt());
        assertTrue(dJWT.getClaim("name").asString().equals(user.getName()));

        // Now remove the user
        Actions.deleteUser(user.getId());

        // Make sure it was deleted
        try {
            assertTrue(Tables.User.findFirst("id = ?", user.getId()).exists());
            fail();
        } catch(NullPointerException e) {}


    }
}
