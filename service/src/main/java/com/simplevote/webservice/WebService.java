package com.simplevote.webservice;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import com.simplevote.DataSources;
import com.simplevote.tools.Tools;
import org.kohsuke.args4j.CmdLineException;
import org.kohsuke.args4j.CmdLineParser;
import org.kohsuke.args4j.Option;
import org.slf4j.LoggerFactory;
import spark.Spark;

import java.io.File;

import static spark.Spark.init;
import static spark.Spark.webSocket;
import static spark.Spark.staticFiles;
import static spark.Spark.externalStaticFileLocation;

/**
 * Created by tyler on 4/20/17.
 */
public class WebService {

    static Logger log = (Logger) LoggerFactory.getLogger(Logger.ROOT_LOGGER_NAME);

    @Option(name="-loglevel", usage="Sets the log level [INFO, DEBUG, etc.]")
    private String loglevel = "INFO";

    @Option(name="-ssl",usage="The location of the java keystore .jks file.")
    private File jks;

    @Option(name="-liquibase", usage="Run liquibase changeset")
    private Boolean liquibase = false;

    public void doMain(String[] args) {

        parseArguments(args);

        log.setLevel(Level.toLevel(loglevel));
        // log.getLoggerContext().getLogger("org.eclipse.jetty").setLevel(Level.OFF);
        // log.getLoggerContext().getLogger("spark.webserver").setLevel(Level.OFF);
        log.getLoggerContext().getLogger("org.javalite.activejdbc").setLevel(Level.OFF);
        log.getLoggerContext().getLogger("org.postgresql.jdbc").setLevel(Level.OFF);

        if (jks != null) {
            Spark.secure(jks.getAbsolutePath(), "changeit", null,null);
            DataSources.SSL = true;
        }

        if (liquibase) {
            Tools.runLiquibase();
        }
        
        staticFiles.location("/dist");
        staticFiles.header("Content-Encoding", "gzip");
        staticFiles.expireTime(600);

        // Set up websocket
        webSocket("/poll", PollWebSocket.class);

        // Set up endpoints
        Endpoints.status();
        Endpoints.user();
        Endpoints.poll();
        Endpoints.exceptions();

        init();

    }

    private void parseArguments(String[] args) {
        CmdLineParser parser = new CmdLineParser(this);

        try {
            parser.parseArgument(args);
        } catch (CmdLineException e) {
            // if there's a problem in the command line,
            // you'll get this exception. this will report
            // an error message.
            System.err.println(e.getMessage());
            System.err.println("java -jar reddit-history.jar [options...] arguments...");
            // print the list of available options
            parser.printUsage(System.err);
            System.err.println();
            System.exit(0);

            return;
        }
    }

    public static void main(String[] args) throws Exception {
        new WebService().doMain(args);
    }

}

