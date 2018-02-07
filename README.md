# GENERAL DESCRIPTION  

The ClimateCharts project is a Web Application divided into two parts:  
1. The client-side webapp called "climatecharts-client", implemented in HTML, CSS and JavaScript  
2. Three server-side applications implemented in Java:  
    2.1 "gazetteer": translates a set of GPS coordinates into a location name (e.g. "Weimar, Thüringen, Deutschland")  
    2.2 "thredds": the THREDDS Data Server (TDS) provides access to the actual climate data (temperature and precipitation per year)  
    2.3 "weatherstations": provides access to the database of weatherrstations, allows for requesting all at once and the climate data for one station in one time period  

The client-side webapp has two versions:  
1. The main master version, for everybody accessible and to be promoted:  
  http://climatecharts.net  
2. The test development version, for the testers, coders and other affiliates, not to be promoted:  
  http://climatecharts.net/develop  

As soon as the develop version is accepted by all affiliates, it replaces the current master version.  


## Source Code  

The Client-side webappp can be found here:  
  https://github.com/GeoinformationSystems/climatecharts  
  git@github.com:GeoinformationSystems/climatecharts.git  

The Server-side applications can be found here:  
  2.1. gazetteer  
    https://github.com/GeoinformationSystems/gazetteer  
    git@github.com:GeoinformationSystems/gazetteer.git  
  2.2. thredds  
    _to do_  
  2.3. weatherstations  
    https://github.com/GeoinformationSystems/weatherstations  
    git@github.com:GeoinformationSystems/weatherstations.git  


# SETUP OF THE LOCAL DEVELOPMENT TOOLCHAIN  

Both the client and the server applications can / should be developed locally and then deployed on the server.  
The folders for the local applications can be set as desired, but this is the setup I chose:  

Project folder for the source code:  
  /home/$USER/Projects/ClimateCharts  
  |- climatecharts/       // Client-side webappp (HTML, CSS, JS)  
  |- gazetteer/           // Server-side application (Java)  
  |- thredds/             // Server-side application (Java)  
  |- weatherstations/     // Server-side application (Java)  

Development folder for Eclipse workspace, local tomcat instance and other development-related stuff  
  /home/$USER/Development  
  |- climatecharts_setup  // stuff folder for readme, configuration files, test files, exported *.war files, archive for last working versions, ...  
  |- Eclipse_workspace    // actual workspace for ecplise  
  |- TDS                  // thredds data server  
  |- Tomcat_local         // local Tomcat8 instance  


## Setup of the Local Client-side Webappp "climatecharts"  

Install git and connect over ssh
  $ sudo apt-get install apache2  
  follow this instruction: https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/  

Install Apache Web Server  
  $ sudo apt-get install apache2  

Get the source code in your home folder and switch to working branch  
  $ cd ~/Projects/ClimateCharts  
  $ git clone git@github.com:GeoinformationSystems/climatecharts.git  
  $ git checkout develop  

Create a symbolic link to the directory of the Apaches webapps  
  $ sudo ln -s /home/$USER/Projects/ClimateCharts/climatecharts /var/www/html/  

Access the website through a normal Web Browser through port 80 (default port so it can be omitted):  
  http://localhost/climatecharts/  

If you get the 403 error (Permission denied), that can have several causes. It is most likely a permission problem. It is important to note that when Apache follows symlinks, the path must be accessible all the way down by the calling user. This means you need execute access in the folder you are linking and the parent folders above it:  
  chmod o+x /home/$USER /home/$USER/Projects /home/$USER/Projects/ClimateCharts /home/$USER/Projects/ClimateCharts/climatecharts

### ECMA6 to ECMA5

Currently (status: August 2017) ECMA6 is out there. It is amazing, since it enables class-based object-oriented programming and that just awesome! However, it is not accepted widely among browsers. If that is ever the case, just ingnore this section :-)  

The javascript source code of the program is written in ECMA6. For the browsers to understand it well, it has to be compiled to ECMA5. That needs babel, a node.js module.  

Get node.js and set it up  
  $ sudo apt-get install npm  
  $ sudo ln -s /usr/bin/nodejs /usr/bin/node  

Install babel and preset into your environment 
  $ cd /home/$USER/Development  
  $ sudo npm install --save-dev babel-cli 
  $ sudo npm install --save-dev babel-preset-env

Now the compilation should work. Test it by executing the build command in the proogram folder  
  $ cd /home/$USER/Projects/ClimateCharts/climatecharts  
  $ ./build.sh  

If that executes by printing many lines of compilation from a source/ to a build/ folder and it ends without an error message, everything should be fine from here on.



## Setup of the Server-side Applications  

### General Technical Setup  

Install Java and its Runtime Environment  
  $ sudo apt-get install openjdk-8-jdk openjdk-8-demo openjdk-8-doc openjdk-8-jre-headless openjdk-8-source  

Install Eclipse Java EE (Mars2) as the desired IDE  
-> http://www.eclipse.org/downloads/packages/eclipse-ide-java-ee-developers/mars2  
Download from here to /home/$USER/Downloads:  
  http://www.eclipse.org/downloads/download.php?file=/technology/epp/downloads/release/mars/2/eclipse-jee-mars-2-linux-gtk-x86_64.tar.gz  
Extract the folder  
  $ cd ~/Downloads  
  $ tar xf eclipse-jee-mars-2-linux-gtk-x86_64.tar.gz  
  $ rm eclipse-jee-mars-2-linux-gtk-x86_64.tar.gz  
Move to program folder  
  $ sudo mv /home/$USER/Downloads/eclipse /etc/  
Create Launcher entry  
  $ sudo touch /usr/share/applications/eclipse.desktop  
  $ gksudo gedit /usr/share/applications/eclipse.desktop  
Copy the following content in it, save and leave  
  [Desktop Entry]
  Encoding=UTF-8
  Name=Eclipse IDE
  Exec=/etc/eclipse/eclipse
  Icon=/etc/eclipse/icon.xpm
  Type=Application
  Categories=Development;

Install Tomcat8 as the web server on the localhost  
  $ sudo apt-get install tomcat8  

Install a local Tomcat v8.0 instance that can be used by Eclipse. Download Tomcat version 8.0.46 to the Download folder (a newer version fo Tomcat is already available, bvut it works nicely with the old one. And never change a running system :-) last update: August 2017).
  $ cd ~/Downloads  
  $ wget http://mirror.softaculous.com/apache/tomcat/tomcat-8/v8.0.46/bin/apache-tomcat-8.0.46.tar.gz  
  $ tar xf apache-tomcat-8.0.46.tar.gz  
  $ rm apache-tomcat-8.0.46.tar.gz  
  $ mv apache-tomcat-8.0.46/ ~/Development/Tomcat_local

Now there are two different Tomcat servers  
  /usr/share/tomcatX                    -\> system-wide Tomcat installation  
  /home/$USER/Development/Tomcat_local -\> local Tomcat installation used by Eclipse  

Use Tomcat8 Server in Eclipse and connect local webapps to it  
  Window -> Show View -> Servers  
  Create New Server  
  Apache -> Tomcat v8.0 Server -> Next >  
  Tomcat installation directory: /home/$USER/Development/Tomcat_local  
  JRE: java-8-openjdk-amd64  
  Next >  
  Add application from Available to Configured
  Finish

Troubleshooting: If it is impossible to use Tomcat v8.0 ("Next" and "Finish" greyed out), close Eclipse and delete the following two files:  
  $ rm /home/$USER/Development/Eclipse_workspace/.metadata/.plugins/org.eclipse.core.runtime/.settings/org.eclipse.jst.server.tomcat.core.prefs  
  $ rm /home/$USER/Development/Eclipse_workspace/.metadata/.plugins/org.eclipse.core.runtime/.settings/org.eclipse.wst.server.core.prefs  

There is another alternative: Install and create a real local instance of tomca8. Find the reference here:
  http://askubuntu.com/questions/310767/how-should-i-install-apache-tomcat-7-for-use-with-eclipse/464866#464866  


### Source Code  

Get source code of the gazetteer application  
  $ cd /home/$USER/Projects/ClimateCharts  
  $ git clone git@github.com:GeoinformationSystems/gazetteer.git  

Open Eclipse and import the project  
  File -\> Import  
  Maven -\> Existing Maven Projects -\> Next \>  
  Root Directory: /home/$USER/Projects/ClimateCharts/gazetteer  

Setup the Tomcat Server  
  Window -\> Preferences  
  Server -\> Runtime Environments -\> Add...  
  Apache -\> Apache Tomcat v8.0  
  Name:                           Apache Tomcat v8.0  
  Tomcat installation directory:  /home/$USER/Development/Tomcat_local  
  JRE:                            java-8-openjdk-amd64  

### CORS

Make sure apache allows to request data from different web servers (CORS)  
=\> enable "Cross-Origin Resource Sharing" in the server-side applications.  

Edit the WEB-INF folder of the application:  
  $ gedit /var/lib/tomcat8/webapps/$NAME_OF_WEBAPP/WEB-INF/web.xml  

References:  
  http://enable-cors.org/server_tomcat.html  
  https://tomcat.apache.org/tomcat-7.0-doc/config/filter.html#CORS_Filter  
  https://awesometoast.com/cors/  


### Setup GeoServer for WeatherStations

credits: http://docs.geoserver.org/stable/en/user/installation/war.html

Make sure tomcat8 and its user are properly installed
Download the latest version of GeoServer as a WAR:
  http://geoserver.org/download/

Extract the archive, move the geosrver.war file into the local tomcat webapp folder and start the local tomcat server
  $ /home/$USER/Development/Tomcat_local/bin/startup.sh

Visit http://localhost:10080/geoserver/web/ and be happy :)



### Setup THREDDS Data Server  

For setting up the TDS see install instructions on the Unidata website.  
Create a setenv.sh (setenv.bat on windows) in the binary folder of the local application server:  
  $ cd home/$USER/Development/Tomcat_local/bin  
  $ touch setenv.sh  

Set up the TDS content folder as described here:  
  http://www.unidata.ucar.edu/software/thredds/current/tds/tutorial/GettingStarted.html  

The datasets served by the TDS are defined in the catalog.xml file which can be found in the setup folder of this project. It references pairs of local temperature and precipitation datasets. New datasets have to be added in the same kind of structure. This file has to be in the TDS content folder  
  /home/$USER/Development/TDS/content/thredds  

Copy the files 'catalog.xml' and 'threddsConfig.xml' in there:  
  $ cp /home/$USER/Development/climatecharts_setup/tds_setup/catalog.xml /home/$USER/Development/TDS/content/thredds  
  $ cp /home/$USER/Development/climatecharts_setup/tds_setup/threddsConfig.xml /home/$USER/Development/TDS/content/thredds  

The path to the local data directory can be changed in the \<datasetRoot\> element of the 'threddsConfig.xml'. For more information about thredds catalogs see:  
  http://www.unidata.ucar.edu/software/thredds/current/tds/tutorial/CatalogPrimer.html  

If the application and the TDS should be started from within Eclipse IDE, read the tutorial which can be also found in the setups folder.  

Finally open your browser and test the application (http://localhost/climatecharts).  


Connect Thredds Data Server with Local Data Files  
  /src/main/resources/config.ini    -\> set path to local files  

For debugging -- Find Tomcat logs here:  
  /home/$USER/Development/TDS/content/thredds/logs  
