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
This project is licensed under the [Apache Software License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
