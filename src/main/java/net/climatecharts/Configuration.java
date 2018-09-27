package net.climatecharts;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;

import org.apache.commons.lang3.StringUtils;

/**
 * Configuration object for ClimateCharts server.
 * 
 * @author matthias
 *
 */
public class Configuration {
	
	static final String configFile = "config.ini";
	
	static final String separator = "="; // separator between key and value
	static final String comment = "#"; // character indicating a comment
	
	public static final HashMap<String,String> props = readProperties();
	
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
				
				System.out.println(line);
				
			    // Deal with the line
				String[] kvp = processLine(line);
				
				if (kvp != null){
					map.put(kvp[0], kvp[1]);
				}
			}
			br.close();
		} catch (Exception e){
			e.printStackTrace();
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
//		value = StringUtils.strip(value);
		
		return new String[]{key, value};
	}
	
}
