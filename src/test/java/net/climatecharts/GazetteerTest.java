package net.climatecharts;

import static org.junit.Assert.*;

import java.io.IOException;

import javax.ws.rs.core.Response;

import org.apache.http.ParseException;
import org.junit.Test;

public class GazetteerTest {

	@Test
	public void testSRTM() throws ParseException, IOException {
		String responseString = new Gazetteer().find("srtm3JSON",21.15, 46.38);
		System.out.println(responseString);
		
	}
	
	@Test
	public void testPlaceName() throws ParseException, IOException {
		String responseString = new Gazetteer().find("findNearbyPlaceNameJSON",21.15, 46.38);
		System.out.println(responseString);
		
	}
	
//	@Test
//	public void testServeData(){
//		String response = new ServeData().getData(31.4, 31.4, 1990, 2000);
//		System.out.println(response);
//	}
}
