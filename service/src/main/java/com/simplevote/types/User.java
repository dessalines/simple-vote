package com.simplevote.types;

import java.io.IOException;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.simplevote.tools.JSONWriter;
import com.simplevote.tools.Tools;

/**
 * Created by tyler on 4/20/17.
 */
public class User implements JSONWriter {

    private Long id;
    private String name, jwt;

    private User(Long id, String name, String jwt) {
        this.id = id;
        this.name = name;
        this.jwt = jwt;
    }

    public User() {}

    public static User create(com.simplevote.db.Tables.User user) {
        return new User(user.getLongId(),
                user.getString("name"),
                null);
    }

    public static User create(String jwt) {
        DecodedJWT dJWT = Tools.decodeJWTToken(jwt);
        return new User(
            Long.valueOf(dJWT.getClaim("user_id").asString()),
            dJWT.getClaim("user_name").asString(),
            jwt);
    }

    public static User create(Long id, String name, String jwt) {
        return new User(id, name, jwt);
    }


    @Override
    public String toString() {
        return this.json();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getJwt() {
        return jwt;
    }

    public void setJwt(String jwt) {
        this.jwt = jwt;
    }

    public static User fromJson(String dataStr) {

        try {
            return Tools.JACKSON.readValue(dataStr, User.class);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        User user = (User) o;

        if (!id.equals(user.id)) return false;
        return name.equals(user.name);
    }

    @Override
    public int hashCode() {
        int result = id.hashCode();
        result = 31 * result + name.hashCode();
        return result;
    }
}
