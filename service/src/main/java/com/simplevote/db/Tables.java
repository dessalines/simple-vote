package com.simplevote.db;

import org.javalite.activejdbc.Model;
import org.javalite.activejdbc.annotations.Table;

/**
 * Created by tyler on 4/20/17.
 */
public class Tables {

    @Table("user_")
    public static class User extends Model {}

    @Table("login")
    public static class Login extends Model {}

    @Table("question_set")
    public static class QuestionSet extends Model {}

    @Table("question")
    public static class Question extends Model {}

    @Table("candidate")
    public static class Candidate extends Model {}

    @Table("vote")
    public static class Vote extends Model {}

    @Table("comment")
    public static class Comment extends Model {}

}
