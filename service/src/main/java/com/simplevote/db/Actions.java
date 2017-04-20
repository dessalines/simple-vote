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
        User userObj = User.create(user);

        String jwt = JWT.create()
                .withIssuer("simplevote")
                .withClaim("name", name)
                .sign(Tools.getJWTAlgorithm());

        userObj.setJwt(jwt);

        Tables.Login login = Tables.Login.createIt(
                "user_id", user.getLongId(),
                "jwt", jwt);

        return userObj;
    }

    public static void deleteUser(Long userId) {
        Tables.User.findFirst("id = ?", userId).delete();
    }

    public static void updateUser(Long userId, String name) {
        Tables.User.findFirst("id = ?", userId)
                .setString("name", name)
                .saveIt();
    }


}
