package net.climatecharts;

/**
 * @author Felix
 * 
 * This class offers methods to read a variable in a Netcdf file for a specific position (gridcell) and time range. Currently
 * only files with a spatial resolution of 0.25, 0.5 and 1.0 degree are supported. The unit for time reference has to be 
 * specified as "days since year-month-day".
 */

import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;
import ucar.ma2.*;

import java.io.IOException;
import java.util.ArrayList;

public class NetcdfHandler {

	public double lat, lng, cellsize, nc_res_x, nc_res_y;
	public int t1, t2, time_index, period;
	
	//Define the first year of time reference in the nc file.
	int init_t = 1901;
	
	String ncFile, variable;
	
	NetcdfFile dataFile = null;
	ArrayList<Double> lat_values;
	ArrayList<Double> lng_values;
	
	public NetcdfHandler (String NcFile) throws IOException{
		this.ncFile = NcFile;
		readMetadata();
		createlists();
	}
	
	//Read the Netcdf file with the given parameters, sort them in an arraylist and return it.
	public ArrayList<Double> read(String Variable, double Lat, double Lng, int T1, int T2) 
			throws IOException, InvalidRangeException {
		
		this.variable = Variable;
		this.lat = Lat;
		this.lng = Lng;
		this.t1 = T1;
		this.t2 = T2;
		
		convertParameters();
	    
	    int lat_index = lat_values.indexOf(lat);
	    int lng_index = lng_values.indexOf(lng);
	    
	    Array data2D = null;
	
		dataFile = NetcdfFile.open(ncFile);
	
	    try {
	      // Find the variable of interest
	      Variable var = dataFile.findVariable(variable);
	      
	      
	      if (var == null) {
	        System.out.println("Can't find Variable!");
	      }
	      
	      //Create two arrays with the position and time parameters and use them to read the file.
	      int[] origin = new int[] {time_index, lat_index, lng_index};
	      int[] size = new int[] {period, 1, 1};
	      Array data3D = var.read(origin, size);
	      
	      /*The output array of the "read" method above is 3dimensional because the variable depends on latitude, longitude and
	       * time. In order to use it properly, remove any dimension of length 1.
	       */
		  data2D = data3D.reduce();
	
	    } catch (java.io.IOException e) {
	      e.printStackTrace();
	    } catch (InvalidRangeException e) {
	      e.printStackTrace();
	    } finally {
	      if (dataFile != null)
	        try {
	          dataFile.close();
	        } catch (IOException ioe) {
	          ioe.printStackTrace();
	        }
		}
	    
	    ArrayList<Double> data2D_sorted = sortArray(data2D);
	    
//	    for(int i = 0; i < data2D_sorted.size(); i++) {   
//	        System.out.print(data2D_sorted.get(i));
//	    }  
	    
	    return data2D_sorted;
	}
	
	//Get some Metadata from the Netcdf file like resolution, cellsize etc.
	private void readMetadata() throws IOException{
		dataFile = NetcdfFile.open(ncFile);
		Variable latv = dataFile.findVariable("lat");
		Variable lngv = dataFile.findVariable("lon");
		nc_res_y = (double) latv.getSize();
		nc_res_x = (double) lngv.getSize();
		
		//Calculate the cellsize assuming the used Netcdf file is of global coverage and the cells are in square format.
		cellsize = 180.0/nc_res_y; 	
	}
	
	
	//For querying the dataset, the parameters from the GET request have to be recalculated/reformatted.
	public void convertParameters() {
		  
		int lat_i = (int) lat;
		int lng_i = (int) lng;
		double lat_dec = lat - lat_i;
		double lng_dec = lng - lng_i;
		
		/*The decimals of latitude/longitude have to be rounded to specific values depending on the cellsize of the dataset. 
		 * If the cellsize is e.g. 1x1 degree, the decimals have to be rounded to the closest x.5.
		 */
		if (cellsize == 1.0){
			if (lat < 0){
				lat = lat_i - 0.5;
			} else {
				lat = lat_i + 0.5;
			}
			if (lng < 0){
				lng = lng_i - 0.5;
			} else {
				lng = lng_i + 0.5;
			}
		}
		if (cellsize == 0.5){
			if (lat < 0.0) {
				if (0.5 <= abs(lat_dec) && abs(lat_dec) < 1.0){
					lat = lat_i - 0.75;
				} else {
					lat = lat_i - 0.25;
				}
			} else {
				if (0.5 <= abs(lat_dec) && abs(lat_dec) < 1.0){
					lat = lat_i + 0.75;
				} else {
					lat = lat_i + 0.25;
				}
			}
			
			if (lng < 0.0){
				if (0.5 <= abs(lng_dec) && abs(lng_dec) < 1.0){
					lng = lng_i - 0.75;
				} else {
					lng = lng_i - 0.25;
				}
			} else {
				if (0.5 <= abs(lng_dec) && abs(lng_dec) < 1.0){
					lng = lng_i + 0.75;
				} else {
					lng = lng_i + 0.25;
				}
			}
		} 
		if (cellsize == 0.25){
			if (lat < 0.0) {
				if (0.75 <= abs(lat_dec) && abs(lat_dec) < 1.0){
					lat = lat_i - 0.875;
				}
				if (0.5 <= abs(lng_dec) && abs(lng_dec) < 0.75){
					lat = lng_i - 0.625;
				}
				if (0.25 <= abs(lng_dec) && abs(lng_dec) < 0.5){
					lat = lng_i - 0.375;
				} else {
					lat = lng_i - 0.125;
				}
			} else {
				if (0.75 <= abs(lat_dec) && abs(lat_dec) < 1.0){
					lat = lat_i + 0.875;
				}
				if (0.5 <= abs(lng_dec) && abs(lng_dec) < 0.75){
					lat = lng_i + 0.625;
				}
				if (0.25 <= abs(lng_dec) && abs(lng_dec) < 0.5){
					lat = lng_i + 0.375;
				} else {
					lat = lng_i + 0.125;
				}
			} 
			if (lng < 0.0) {
				if (0.75 <= abs(lat_dec) && abs(lat_dec) < 1.0){
					lng = lat_i - 0.875;
				}
				if (0.5 <= abs(lng_dec) && abs(lng_dec) < 0.75){
					lng = lng_i - 0.625;
				}
				if (0.25 <= abs(lng_dec) && abs(lng_dec) < 0.5){
					lng = lng_i - 0.375;
				} else {
					lng = lng_i - 0.125;
				}
			} else {
				if (0.75 <= abs(lat_dec) && abs(lat_dec) < 1.0){
					lng = lat_i + 0.875;
				}
				if (0.5 <= abs(lng_dec) && abs(lng_dec) < 0.75){
					lng = lng_i + 0.625;
				}
				if (0.25 <= abs(lng_dec) && abs(lng_dec) < 0.5){
					lng = lng_i + 0.375;
				} else {
					lng = lng_i + 0.125;
				}
			}
		}
		
		//Calculate required index and period length of time parameters.
		time_index = (t1 - init_t)*12;
		period = (t2 - init_t + 1)*12 - time_index;
		
		System.out.println("Lat: " +lat +", Lng: " +lng +", t1: " +t1 +", t2: " +t2 +", time_index: " +time_index +", period: " +period);
	}
	
	//Get the absolute value of double value.
	private double abs(double value) {
		return Math.abs(value);
	}
	
	/* Create a list of values representing coordinates and time the same way as in the netcdf file.
	Based on these lists the application can find the index for the data of interest. */
	private void createlists(){
		
		//List with latitude values.
		lat_values = new ArrayList<Double>();
		double init_lat = -nc_res_y/4 + cellsize/2;
		for (int i = 0; i < nc_res_y; i++){
			double j = cellsize*i;
			double loop_val = init_lat + j;
			lat_values.add(loop_val);
		}
		
		//List with longitude values.
		lng_values = new ArrayList<Double>();
		double init_lng = -nc_res_x/4 + cellsize/2;
		for (int i = 0; i < nc_res_x; i++){
			double j = cellsize*i;
			double loop_val = init_lng + j;
			lng_values.add(loop_val);
		}
	}
	
	/*Put the unsorted Content of an Array object into 12 different arraylists (according to the 12 months of a year). Then 
	  calculate the mean values and add them to another arraylist.
	*/
	public ArrayList<Double> sortArray(Array data){
		Array data1d = data;
		ArrayList<Double> sortedList = new ArrayList<Double>();
		ArrayList<Double> jan = new ArrayList<Double>();
		ArrayList<Double> feb = new ArrayList<Double>();
		ArrayList<Double> mar = new ArrayList<Double>();
		ArrayList<Double> apr = new ArrayList<Double>();
		ArrayList<Double> may = new ArrayList<Double>();
		ArrayList<Double> jun = new ArrayList<Double>();
		ArrayList<Double> jul = new ArrayList<Double>();
		ArrayList<Double> aug = new ArrayList<Double>();
		ArrayList<Double> sep = new ArrayList<Double>();
		ArrayList<Double> oct = new ArrayList<Double>();
		ArrayList<Double> nov = new ArrayList<Double>();
		ArrayList<Double> dec = new ArrayList<Double>();
		
		
		for (int i = 0; i < data1d.getSize()/12; i++){
				int j = i*12;
				jan.add(data1d.getDouble(j));
				feb.add(data1d.getDouble(j+1));
				mar.add(data1d.getDouble(j+2));
				apr.add(data1d.getDouble(j+3));
				may.add(data1d.getDouble(j+4));
				jun.add(data1d.getDouble(j+5));
				jul.add(data1d.getDouble(j+6));
				aug.add(data1d.getDouble(j+7));
				sep.add(data1d.getDouble(j+8));
				oct.add(data1d.getDouble(j+9));
				nov.add(data1d.getDouble(j+10));
				dec.add(data1d.getDouble(j+11));
			}
	
		sortedList.add(getAverage(jan));
		sortedList.add(getAverage(feb));
		sortedList.add(getAverage(mar));
		sortedList.add(getAverage(apr));
		sortedList.add(getAverage(may));
		sortedList.add(getAverage(jun));
		sortedList.add(getAverage(jul));
		sortedList.add(getAverage(aug));
		sortedList.add(getAverage(sep));
		sortedList.add(getAverage(oct));
		sortedList.add(getAverage(nov));
		sortedList.add(getAverage(dec));
		
		return sortedList;
	}
	
	//Get the mean value from an arraylist with double values.
	public double getAverage(ArrayList<Double> arrList) {
	    double sum = 0;
	    
		for(int i = 0; i < arrList.size(); i++){
	        sum += (double) arrList.get(i);
		}
	    return sum / arrList.size();
	}
}
