/**
 * Copyright (C) 2012 52°North Initiative for Geospatial Open Source Software GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package net.climatecharts;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;

import org.apache.commons.lang3.StringUtils;

/**
 * 
 * @author matthias
 *
 */
public class Configuration {
	
	static final String configFile = "config.ini";
	
	static final String separator = "="; // separator between key and value
	static final String comment = "#"; // character indicating a comment
	
	private static final HashMap<String,String> props = readProperties();
	
	public static final String getParameter(String paramName){
		return props.get(paramName);
	}
	
	
	/**
	 * Properties reader
	 * 
	 * @return
	 */
	private static final HashMap<String, String> readProperties(){
		ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
		InputStream is = classLoader.getResourceAsStream(configFile);
		
		// Process input stream and return properties HashMap
		HashMap<String,String> map = new HashMap<String,String>();
		BufferedReader br;
		String line;
		try {
			
			br = new BufferedReader(new InputStreamReader(is));
			while ((line = br.readLine()) != null) {
			    // Deal with the line
				String[] kvp = processLine(line);
				if (kvp != null){
					map.put(kvp[0], kvp[1]);
				}
			}
			br.close();
		} catch (Exception e){
			// TODO: Log.
		}
		
		return map;
	}
	
	
	/**
	 * Parse line, return array of strings (key,value)
	 * 
	 * @param line
	 * @return
	 */
	private static final String[] processLine(String line){
		
		// strip leading and trailing spaces
		line = StringUtils.trim(line);
		line = StringUtils.strip(line);
		
		// ignore comments starting with "#"
		if (line.startsWith(comment)){
			// skip line
			return null;
		}
		
		// check no of occurences of "="
		if (StringUtils.countMatches(line, separator) < 1){
			// skip line
			return null;
		}
		
		
		// extract key / value and strip leading and trailing spaces
		int sepIndex = line.indexOf(separator);
		
		String key = line.substring(0,sepIndex-1);
		key = StringUtils.trim(key);
		//key = StringUtils.strip(key);
		
		String value = line.substring(sepIndex+1);
		value = StringUtils.trim(value);
		
		return new String[]{key, value};
	}
	
}
