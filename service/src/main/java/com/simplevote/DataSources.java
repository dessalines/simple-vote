package com.simplevote;

import com.simplevote.tools.Tools;

import java.util.Properties;

/**
 * Created by tyler on 4/20/17.
 */
public class DataSources {

    public static final String CODE_DIR = System.getProperty("user.dir");

    public static Boolean SSL = false;

    public static final String PROPERTIES_FILE = CODE_DIR + "/simplevote.properties";

    public static Properties PROPERTIES = Tools.loadProperties(PROPERTIES_FILE);

    public static final String CHANGELOG_MASTER = "liquibase/db.changelog-master.xml";
}
