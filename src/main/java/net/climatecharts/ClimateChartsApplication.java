package net.climatecharts;

import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

/**
 * Application endpoint for ClimateCharts server
 * 
 * @author matthias
 */
@ApplicationPath("/api")
public class ClimateChartsApplication extends Application{
	
	@Override
	public Set<Class<?>> getClasses() {
		final Set<Class<?>> classes = new HashSet<>();
//		classes.add(ServeData.class);
		classes.add(Gazetteer.class);
		return classes;
	}
}
