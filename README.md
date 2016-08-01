# Climatecharts
A web service that generates climate charts.

## Structure
* /src/main/webapp/ - HTML and JavaScript contents
* /src/main/java/ - Server classes (JAVA)

## How to build
Climatecharts is a Maven project.

1. Check out from github: ```git clone https://github.com/GeoinformationSystems/climatecharts.git```
2. Change to working directory: ```cd climatecharts```
3. Build with maven: ```mvn package```

## How to deploy
The build process generates a WAR archive which can be deployed on an application server such as Tomcat 8. Lower versions might not work properly since the Application uses the Servlet specification 3.1.

1. Copy ```./climatecharts/target/climatecharts.war``` to your webapps folder and restart your Application Server.
2. This project uses the THREDDS Data Server (TDS) by Unidata. Download a WAR file of the latest version and deploy it as well: http://www.unidata.ucar.edu/software/thredds/current/tds/TDS.html
3. For setting up the TDS see install instructions on the Unidata website. Create a setenv.sh (setenv.bat on windows) in the tomcat/bin folder and set up the TDS content folder as described here: http://www.unidata.ucar.edu/software/thredds/current/tds/tutorial/GettingStarted.html
4. The datasets served by the TDS are defined in the catalog.xml file which can be found in the location of readme.md within this project. It contains pairs of temperature and precipitation datasets and new datasets have to be added in the same kind of structure. Copy this file into the TDS content folder (see step 3). The path to the local data directory can be defined in the <datasetRoot> element. For more information about thredds catalogs see: http://www.unidata.ucar.edu/software/thredds/current/tds/tutorial/CatalogPrimer.html
5. The datasets/metadata are served by using the NetCDF Subset Service (NCSS) and NetCDF Markup Language (NcML). These services might have to be activated by editing the threddsConfig.xml in the content folder und uncommenting the "NetcdfSubsetService" and "NCISO" blocks.
6. Open your browser and test the application (http://localhost:8080/climatecharts).

## License
This project is licensed under the [Apache Software License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
