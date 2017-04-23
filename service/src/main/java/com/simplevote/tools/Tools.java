package com.simplevote.tools;

import ch.qos.logback.classic.Logger;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.MapType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.simplevote.DataSources;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.LiquibaseException;
import liquibase.resource.FileSystemResourceAccessor;
import org.javalite.activejdbc.DB;
import org.javalite.activejdbc.DBException;
import org.slf4j.LoggerFactory;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.HttpCookie;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by tyler on 4/20/17.
 */
public class Tools {

    public static Logger log = (Logger) LoggerFactory.getLogger(Tools.class);

    public static ObjectMapper JACKSON = new ObjectMapper();
    public static TypeFactory typeFactory = JACKSON.getTypeFactory();
    public static MapType mapType = typeFactory.constructMapType(HashMap.class, String.class, String.class);

    public static final void dbInit() {
        try {
            new DB("default").open("org.postgresql.Driver",
                    DataSources.PROPERTIES.getProperty("jdbc.url"),
                    DataSources.PROPERTIES.getProperty("jdbc.username"),
                    DataSources.PROPERTIES.getProperty("jdbc.password"));
        } catch (DBException e) {
            e.printStackTrace();
            dbClose();
            dbInit();
        }

    }

    public static final void dbClose() {
        new DB("default").close();
    }

    public static final Algorithm getJWTAlgorithm() {
        Algorithm JWTAlgorithm = null;
        try {
            JWTAlgorithm = Algorithm.HMAC256(DataSources.PROPERTIES.getProperty("jdbc.password"));
        } catch (UnsupportedEncodingException | JWTCreationException exception){}

        return JWTAlgorithm;
    }

    public static final DecodedJWT decodeJWTToken(String token) {

        DecodedJWT jwt = null;

        try {
            JWTVerifier verifier = JWT.require(getJWTAlgorithm())
                    .withIssuer("simplevote")
                    .build(); //Reusable verifier instance
            jwt = verifier.verify(token);
        } catch (JWTVerificationException e){}

        return jwt;
    }

    public static final Map<String, String> createMapFromReqBody(String reqBody) {

        Map<String, String> map = new HashMap<>();
        try {
            map = JACKSON.readValue(reqBody, mapType);
        } catch(IOException e) {
            e.printStackTrace();
        }

        return map;
    }

    public static Properties loadProperties(String propertiesFileLocation) {

        Properties prop = new Properties();
        InputStream input = null;
        try {
            input = new FileInputStream(propertiesFileLocation);

            // load a properties file
            prop.load(input);
        } catch (IOException e) {
            e.printStackTrace();
        } finally  {
            try {
                input.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return prop;

    }

    public static Map<String, String> cookieListToMap(List<HttpCookie> list) {
        return list.stream().collect(Collectors.toMap(
                HttpCookie::getName, HttpCookie::getValue));
    }

    public static String convertListToInQuery(Collection<?> col){
        if (col.size() > 0) {
            return Arrays.toString(col.toArray()).replaceAll("\\[", "(").replaceAll("\\]", ")");
        } else {
            return "(null)";
        }
    }

    public static void runLiquibase() {

        Liquibase liquibase = null;
        Connection c = null;
        try {
            c = DriverManager.getConnection(DataSources.PROPERTIES.getProperty("jdbc.url"),
                    DataSources.PROPERTIES.getProperty("jdbc.username"),
                    DataSources.PROPERTIES.getProperty("jdbc.password"));

            Database database = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(new JdbcConnection(c));
            log.info(DataSources.CHANGELOG_MASTER);
            liquibase = new Liquibase(DataSources.CHANGELOG_MASTER, new FileSystemResourceAccessor(), database);
            liquibase.update("main");
        } catch (SQLException | LiquibaseException e) {
            e.printStackTrace();
            throw new NoSuchElementException(e.getMessage());
        } finally {
            if (c != null) {
                try {
                    c.rollback();
                    c.close();
                } catch (SQLException e) {
                    //nothing to do
                }
            }
        }
    }
}
