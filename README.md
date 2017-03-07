# GENERAL DESCRIPTION  
  
The ClimateCharts project is a typical Web application divided into two parts:  
1. The client-side webapp called "climatecharts-client", implemented in pure HTML, CSS and JavaScript  
2. Two server-side applications implemented in Java:  
    2.1 "gazetteer": translates a set of GPS coordinates into a location name (e.g. "Weimar, Thüringen, Deutschland")  
    2.2 "thredds":   the THREDDS Data Server (TDS) provides access to the actual climate data (temperature and precipitation per year)  
  
The client-side webapp has two versions:  
1. The main master version, for everybody accessible and to be promoted:  
  http:/climatecharts.net  
2. The test development version, for the testers, codrs and other affiliates, not to be promoted:  
  http:/climatecharts.net/develop  
  
As soon as the develop version is accepted by all affiliates, it replaces the current master version.  
  
  
## Source Code  
  
The Client-side webappp can be found here:  
  https://github.com/GeoinformationSystems/climatecharts  
  git@github.com:GeoinformationSystems/climatecharts.git  
  
The Server-side applications can be found here:  
  https://github.com/GeoinformationSystems/gazetteer  
  git@github.com:GeoinformationSystems/gazetteer.git  
  
_thredds: to be done_  
  
  
# SETUP OF THE LOCAL DEVELOPMENT TOOLCHAIN  
  
Both the client and the server applications can / should be developed locally and then deployed on the server.  
The folders for the local applications can be set as desired, but this is the setup I chose:  
  
Project folder for the source code:  
  /home/$USER/Projects/ClimateCharts  
  |- climatecharts/      // Client-side webappp (HTML, CSS, JS)  
  |- gazetteer/          // Server-side application (Java)  
  |- thredds/            // Server-side application (Java)  
  
Development folder for Eclipse workspace, local tomcat instance and other development-related stuff  
  /home/$USER/Development  
  |- climatecharts_setup  // stuff folder for readme, configuration files, test files, exported war files, archive for last working versions, ...  
  |- Eclipse_workspace    // actual workspace for ecplise  
  |- TDS                  // thredds data server  
  |- Tomcat_local         // local Tomcat8 instance  
  
  
## Setup of the Local Client-side Webappp "climatecharts"  
  
Install Apache Web Server  
  $ sudo apt-get install apache2  
  
Get the source code in your home folder  
  $ cd ~/Projects/ClimateCharts  
  $ git clone git@github.com:GeoinformationSystems/climatecharts.git  
  
Create a symbolic link to the directory of the Apaches webappps  
  $ sudo ln -s /home/$USER/Projects/ClimateCharts/climatecharts /var/www/html/  
  
Access the website through a normal Web Browser through port 80 (default port so it can be omitted):  
  http://localhost/climatecharts/  
  
If you get the 403 error (Permission denied), that can have several causes. It is most likely a permission problem. It is important to note that when Apache follows symlinks, the path must be accessible all the way down by the calling user. This means you need execute access in the folder you are linking and the parent folders above it:
  chmod o+x /home/$USER /home/$USER/Projects /home/$USER/Projects/ClimateCharts /home/$USER/Projects/ClimateCharts/climatecharts
  
  
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
Copy into program folder  
  $ sudo mv /home/$USER/Downloads/eclipse /etc/  
Create Launcher entry  
  $ cd /usr/share/applications/  
  $ sudo touch eclipse.desktop  
  $ gksudo gedit eclipse.desktop  
Copy the following content in it, save and leave  
  [Desktop Entry]
  Encoding=UTF-8
  Name=Eclipse IDE
  Exec=/etc/eclipse/eclipse
  Icon=/etc/eclipse/icon.xpm
  Type=Application
  Categories=Development;
  
Install Tomcat8 as the web server on the localhost  
  $ sudo apt-get install tomcat8 tomcat8-user  
  
Create local instance of Tomcat 8 in your development folder:  
  $ tomcat8-instance-create -p 10080 -c 10005 /home/$USER/Development/Tomcat_local  
  
Make Eclipse happy  
  $ cd /home/$USER/Development/Tomcat_local  
  $ ln -s /usr/share/tomcat8/lib  
  $ ln -s /etc/tomcat8/policy.d/03catalina.policy conf/catalina.policy  
  $ ln -s /usr/share/tomcat8/bin/bootstrap.jar bin/bootstrap.jar  
  $ ln -s /usr/share/tomcat8/bin/tomcat-juli.jar bin/tomcat-juli.jar  
  $ mkdir -p common/classes;  
  $ mkdir -p server/classes;  
  $ mkdir -p shared/classes;  
  
Now there are two different Tomcat servers  
  /usr/share/tomcatX                    -\> system-wide Tomcat installation  
  /home/$USER/Development/Tomcat_local -\> local Tomcat installation used by Eclipse  
  
Reference and credits to:  
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
  
Make sure apache allows to request data from different web servers (CORS)  
=\> enable "Cross-Origin Resource Sharing" in the server-side applications.  
  
Edit the WEB-INF folder of the application:  
  $ cd /var/lib/tomcat8/webapps/$NAME_OF_WEBAPP/WEB-INF/web.xml  
  
References:  
  http://enable-cors.org/server_tomcat.html  
  https://tomcat.apache.org/tomcat-7.0-doc/config/filter.html#CORS_Filter  
  https://awesometoast.com/cors/  
  
  
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
  
