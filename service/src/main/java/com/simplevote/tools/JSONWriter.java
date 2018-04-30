package com.simplevote.tools;

import com.fasterxml.jackson.core.JsonProcessingException;

/**
 * Created by tyler on 4/20/17.
 */
public interface JSONWriter {
    default String json(String wrappedName) {
        try {
            String val = Tools.JACKSON.writeValueAsString(this);

            String json = (wrappedName != null) ? "{\"" + wrappedName + "\":" +
                    val +
                    "}" : val;

            return json;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return null;
    }

    default String json() {
        return json(null);
    }

}