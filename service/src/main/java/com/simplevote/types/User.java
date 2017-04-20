package com.simplevote.types;

import com.simplevote.tools.JSONWriter;
import com.simplevote.tools.Tools;

import java.io.IOException;

/**
 * Created by tyler on 4/20/17.
 */
public class User implements JSONWriter {

    private Long id;
    private String name, jwt;

    private User(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public User() {}

    public static User create(com.simplevote.db.Tables.User user) {
        return new User(user.getLongId(),
                user.getString("name"));
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

}
