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

1. Copy ```./climatecharts/target/climatecharts.war``` to your webapps folder and restart your Application Server (e.g. tomcat).
2. This project uses the THREDDS Data Server (TDS) by Unidata. Download a WAR file of the latest version and deploy it as well: http://www.unidata.ucar.edu/software/thredds/current/tds/TDS.html
3. For setting up the TDS see install instructions on the Unidata website. Create a setenv.sh (setenv.bat on windows) in the binary folder of the application server (for e.g. tomcat this is ./tomcat/bin) and set up the TDS content folder as described here: http://www.unidata.ucar.edu/software/thredds/current/tds/tutorial/GettingStarted.html
4. The datasets served by the TDS are defined in the catalog.xml file which can be found in the setup folder of this project. It references pairs of local temperature and precipitation datasets. New datasets have to be added in the same kind of structure. Copy this file into the TDS content folder (see step 3). The path to the local data directory can be defined in the <datasetRoot> element. For more information about thredds catalogs see: http://www.unidata.ucar.edu/software/thredds/current/tds/tutorial/CatalogPrimer.html
5. The TDS can be configured with the threddsConfig.xml, also located in the setups folder. Copy this file into <tomcat>/content/thredds directory and it should work. 
6. If the application and the TDS should be started from within Eclipse IDE, read the tutorial which can be also found in the setups folder.
7. Finally open your browser and test the application (http://localhost:8080/climatecharts).

## License
This project is licensed under the [Apache Software License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
