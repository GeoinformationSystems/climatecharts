package net.climatecharts;

import java.io.IOException;
import java.util.ArrayList;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import ucar.ma2.InvalidRangeException;

/**
 * Data access endpoint for ClimateCharts server.
 * 
 * This servlet handles an HTTP GET request by creating an instance of the NetcdfHandler class and read the specified files with the 
 * received parameters latitude, longitude and first + last year of the chosen time range. 
 * 
 * @author felix, matthias
 */
@Path("/ServeData")
public class ServeData {

	private final String path_tmp = Configuration.getParameter("data.tmp");
	private final String path_pre = Configuration.getParameter("data.pre");

	private static final String[] months = new String[]{"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};

	@GET
	@Produces("application/json")
	public String getData(
			@QueryParam("lat") Double lat,
			@QueryParam("lng") Double lng,
			@QueryParam("t1") Integer t1,
			@QueryParam("t2") Integer t2
			){

		if (lat == null || lng == null || t1 == null || t2 == null){
			throw new WebApplicationException(Response.Status.BAD_REQUEST);
		}

		try {
			
			final NetcdfHandler nc_tmp = new NetcdfHandler(path_tmp);
			final NetcdfHandler nc_pre = new NetcdfHandler(path_pre);
			
			final JSONArray data = new JSONArray();

			final ArrayList<Double> tmp_data;
			final ArrayList<Double> pre_data;
			
			tmp_data = nc_tmp.read("tmp", lat, lng, t1, t2);
			pre_data = nc_pre.read("pre", lat, lng, t1, t2);

			//Create a JSON object for each month with temperature and precipitation values and it to the JSON array.
			for (int i=0; i < months.length; i++){
				JSONObject month = new JSONObject();

				month.put("month", months[i]);
				month.put("tmp", tmp_data.get(i));
				month.put("pre", pre_data.get(i));
				data.put(i, month);
			}

			return data.toString();

		} catch (InvalidRangeException e) {
			e.printStackTrace();
			throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
		} catch (JSONException e) {
			e.printStackTrace();
			throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
		} catch (IOException e) {
			e.printStackTrace();
			throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
		}
	}

}
