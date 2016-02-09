package net.climatecharts;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;

import org.apache.commons.io.IOUtils;
import org.apache.http.client.utils.URIBuilder;

/**
 * 
 * @author matthias
 */
@Path("/gazetteer/{op}")
public class Gazetteer {
	
	private static final String placenameUrl = "http://api.geonames.org/findNearbyPlaceNameJSON";
	private static final String srtm3Url = "http://api.geonames.org/srtm3JSON";
	private static final String geonamesUser = "climatediagrams";
	
	// http://api.geonames.org/findNearbyPlaceNameJSON?lat=21.15&lng=46.38&username=climatediagrams
	// http://api.geonames.org/srtm3JSON?lat=21.15&lng=46.38&username=climatediagrams
	
	@GET
	@Produces("application/json")
	public String find(
			@PathParam("op") String op,
			@QueryParam("lat") Double lat,
			@QueryParam("lng") Double lng
			){
		
		if (lat == null || lng == null){
			throw new WebApplicationException(Response.Status.BAD_REQUEST);
		}
		
		if (op.equals("findNearbyPlaceNameJSON")){
			try {
				final URL url = new URIBuilder(placenameUrl)
						.addParameter("lat", lat.toString())
						.addParameter("lng", lng.toString())
						.addParameter("username", geonamesUser)
						.build().toURL();
				
				final String data = IOUtils.toString(url);
				return data;
			} catch (IOException e) {
				e.printStackTrace();
				throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
			} catch (URISyntaxException e) {
				e.printStackTrace();
				throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
			}
		} else if (op.equals("srtm3JSON")) {
			// http://api.geonames.org/srtm3JSON?lat=21.15&lng=46.38&username=climatediagrams
			try {
				final URL url = new URIBuilder(srtm3Url)
						.addParameter("lat", lat.toString())
						.addParameter("lng", lng.toString())
						.addParameter("username", geonamesUser)
						.build().toURL();
				
				final String data = IOUtils.toString(url);
				return data;
			} catch (IOException e) {
				e.printStackTrace();
				throw new WebApplicationException();
			} catch (URISyntaxException e) {
				e.printStackTrace();
				throw new WebApplicationException();
			}
		} else {
			throw new WebApplicationException(Response.Status.BAD_REQUEST);
		}
		
	}
	
}
