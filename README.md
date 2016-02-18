# Climatecharts
A web service that generates climate charts.

## Structure
* /src/main/webapp/ - HTML and JavaScript contents
* /src/main/java/ - Server classes (JAVA)
* /src/main/resources/config.ini - Configuration file for server's data store

## How to build
Climatecharts is a Maven project.

1. Check out from github: ```git clone https://github.com/GeoinformationSystems/climatecharts.git```
2. Change to working directory: ```cd climatecharts```
3. Build with maven: ```mvn package```

## How to deploy
The build process generates a WAR archive which can be deployed on an application server such as Tomcat 8. Lower versions might not work properly since the Appplication uses the Servlet specification 3.1.

1. Copy ```./climatecharts/target/climatecharts.war``` to your webapps folder and restart your Application Server.
2. Update the data source configuration in ```webapps/climatecharts/WEB-INF/config.ini``` and restart your Application Server again.
3. Open your browser and test the application (http://localhost:8080/climatecharts).

## License
Climatecharts is licensed under TODO.

The project uses a few 3rd party libraries and most of them are also licensed under the [Apache Software License, Version 2.0](https://opensource.org/licenses/Apache-2.0) or [MIT License](https://opensource.org/licenses/MIT). Exceptions are listed below.

* **NetCDF library** is licensed under the [NetCDF license](http://www.unidata.ucar.edu/software/netcdf/copyright.html), an MIT style license.
* **Highcharts JS** is a JavaScript chart library developed by [HighSoft](http://www.highcharts.com). It is licensed under the [Creative Commons Attribution-NonCommercial 3.0 License](http://creativecommons.org/licenses/by-nc/3.0/). For commercial purposes, a [license](http://shop.highsoft.com/highcharts) is required.
* **Leaflet** is licensed under a [BSD 2 clause license](https://opensource.org/licenses/BSD-2-Clause)

