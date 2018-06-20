package com.simplevote.tools;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpCookie;
import java.net.URL;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Properties;
import java.util.Scanner;
import java.util.stream.Collectors;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.MapType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.simplevote.DataSources;
import com.simplevote.types.User;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import org.jasypt.util.password.BasicPasswordEncryptor;
import org.javalite.activejdbc.Base;
import org.slf4j.LoggerFactory;

import ch.qos.logback.classic.Logger;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.LiquibaseException;
import liquibase.resource.ClassLoaderResourceAccessor;
import spark.Request;

/**
 * Created by tyler on 4/20/17.
 */
public class Tools {

    public static Logger log = (Logger) LoggerFactory.getLogger(Tools.class);
    public static SimpleDateFormat SDF = new SimpleDateFormat("yyyy-MM-dd");

    public static ObjectMapper JACKSON = new ObjectMapper();
    public static TypeFactory typeFactory = JACKSON.getTypeFactory();
    public static MapType mapType = typeFactory.constructMapType(HashMap.class, String.class, String.class);

    public static final BasicPasswordEncryptor PASS_ENCRYPT = new BasicPasswordEncryptor();   

    public static final HikariConfig hikariConfig() {
        HikariConfig hc = new HikariConfig();
        DataSources.PROPERTIES = Tools.loadProperties(DataSources.PROPERTIES_FILE);
        hc.setJdbcUrl(DataSources.PROPERTIES.getProperty("jdbc.url"));
        hc.setUsername(DataSources.PROPERTIES.getProperty("jdbc.username"));
        hc.setPassword(DataSources.PROPERTIES.getProperty("jdbc.password"));
        hc.setMaximumPoolSize(10);
        return hc;
    }

    public static final HikariDataSource hikariDataSource = new HikariDataSource(hikariConfig());

    public static final void dbInit() {
        Base.open(hikariDataSource); // get connection from pool
    }

    public static final void dbClose() {
        Base.close();
    }

    public static final Algorithm getJWTAlgorithm() {
        Algorithm JWTAlgorithm = null;
        try {
            JWTAlgorithm = Algorithm.HMAC256(DataSources.PROPERTIES.getProperty("jdbc.password"));
        } catch (UnsupportedEncodingException | JWTCreationException exception) {
        }

        return JWTAlgorithm;
    }

    public static final DecodedJWT decodeJWTToken(String token) {

        DecodedJWT jwt = null;

        try {
            JWTVerifier verifier = JWT.require(getJWTAlgorithm()).withIssuer("simplevote").build(); // Reusable verifier
                                                                                                    // instance
            jwt = verifier.verify(token);
        } catch (JWTVerificationException e) {
        }

        return jwt;
    }

    public static final User getUserFromJWTHeader(Request req) {
        String jwt = req.headers("token");
        return User.create(jwt);
    }

    public static final Map<String, String> createMapFromReqBody(String reqBody) {

        Map<String, String> map = new HashMap<>();
        try {
            map = JACKSON.readValue(reqBody, mapType);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return map;
    }

    public static Properties loadProperties(String propertiesFileLocation) {

        Properties prop = new Properties();

        Map<String, String> env = System.getenv();
        for (String varName : env.keySet()) {
            switch (varName) {
            case "SIMPLEVOTE_DB_URL":
                prop.setProperty("jdbc.url", env.get(varName));
                break;
            case "SIMPLEVOTE_DB_USERNAME":
                prop.setProperty("jdbc.username", env.get(varName));
                break;
            case "SIMPLEVOTE_DB_PASSWORD":
                prop.setProperty("jdbc.password", env.get(varName));
                break;
            }
        }

        if (prop.getProperty("jdbc.url") != null) {
            return prop;
        }

        InputStream input = null;
        try {
            input = new FileInputStream(propertiesFileLocation);

            // load a properties file
            prop.load(input);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                input.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return prop;

    }

    public static Map<String, String> cookieListToMap(List<HttpCookie> list) {
        return list.stream().collect(Collectors.toMap(HttpCookie::getName, HttpCookie::getValue));
    }

    public static String convertListToInQuery(Collection<?> col) {
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
            liquibase = new Liquibase(DataSources.CHANGELOG_MASTER, new ClassLoaderResourceAccessor(), database);
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
                    // nothing to do
                }
            }
        }
    }

    public static Boolean notNull(JsonNode node) {
        return (node != null && !node.asText().equals("null") && !node.asText().equals(""));
    }

    public static void setDistEndpoint(String endpoint) {

        try {
            InputStream is = Tools.class.getResourceAsStream("/dist/index.html");
            Scanner s = new Scanner(is).useDelimiter("\\A");
            String result = s.hasNext() ? s.next() : "";
            is.close();

            log.info(result);
            // URL url = Tools.class.getResource("dist/main.28840dc9b3ab5c94ac58.js");
            URL url = Tools.class.getResource("/dist/index.html");

            log.info(url.toString());

            String content = endpoint;
            byte[] contentInBytes = content.getBytes();

            PrintWriter writer = new PrintWriter(
                new File(Tools.class.getResource("/dist/index.html").getPath()));

            writer.println(content);
            writer.close();

            is = Tools.class.getResourceAsStream("/dist/index.html");
            s = new Scanner(is).useDelimiter("\\A");
            result = s.hasNext() ? s.next() : "";
            is.close();

            log.info(result);
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}
