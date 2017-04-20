package com.simplevote.db;

import com.auth0.jwt.JWT;
import com.simplevote.tools.Tools;
import com.simplevote.types.User;

/**
 * Created by tyler on 4/20/17.
 */
public class Actions {

    public static User createNewUser(String name) {
        Tables.User user = Tables.User.createIt("name", name);
        return createUserObj(user);
    }

    public static User updateUser(Long userId, String name) {
        Tables.User user = Tables.User.findFirst("id = ?", userId);
        user.setString("name", name)
                .saveIt();

        return createUserObj(user);
    }

    public static void deleteUser(Long userId) {
        Tables.User.findFirst("id = ?", userId).delete();
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


}
