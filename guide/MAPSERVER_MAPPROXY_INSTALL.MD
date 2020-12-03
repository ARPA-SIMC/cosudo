# MAPSERVER install

sudo su

### Dependencies
yum install wget tar nano gcc-c++ libpng libtiff make cmake -y

dnf install proj-devel freetype -y

yum install libxml2-devel curl-devel libpng libpng-devel gd gd-devel ogdi-devel -y


**How To Enable and Install EPEL Repo on CentOS 8**

yum install epel-release -y

yum install 'dnf-command(config-manager)' -y

yum config-manager --set-enabled PowerTools -y

yum install gdal-devel -y

yum install fcgi-devel cairo-devel geos-devel -y

**Postrges (optional)**

yum -y install https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm

dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm

dnf install dnf-plugins-core

dnf config-manager --set-enabled PowerTools

dnf -qy module disable postgresql

yum install postgis25_12-devel -y


**Sqlite (optional)**

yum install sqlite-devel -y

## MASERVVER (7.6.1) installation
cd /usr/local/src

wget https://download.osgeo.org/mapserver/mapserver-7.6.1.tar.gz

tar -zxvf mapserver-7.6.1.tar.gz 

cd  mapserver-7.6.1

**example file https://github.com/MapServer/MapServer/blob/master/INSTALL.CMAKE**

mkdir build

cd build

ccmake ..

**follow instructions, fix dependency issues and generate cmake file**

**An example config is:**

     BUILD_STATIC                     ON     
     CMAKE_BUILD_TYPE                        
     CMAKE_CXX_STANDARD               11     
     CMAKE_C_STANDARD                 99     
     CMAKE_INSTALL_LIBDIR             lib64  
     CMAKE_INSTALL_PREFIX             /usr/local                                                                         
     INSTALL_BIN_DIR                  bin    
     INSTALL_CMAKE_DIR                share/mapserver/cmake                                                              
     INSTALL_INCLUDE_DIR              include
     INSTALL_LIB_DIR                  lib    
     LINK_STATIC_LIBMAPSERVER         ON     
     PG_CONFIG                        PG_CONFIG-NOTFOUND                                                                 
     WITH_APACHE_MODULE               OFF    
     WITH_CAIRO                       ON     
     WITH_CLIENT_WFS                  OFF    
     WITH_CLIENT_WMS                  ON     
     WITH_CSHARP                      OFF    
     WITH_CURL                        OFF    
     WITH_EXEMPI                      OFF    
     WITH_FCGI                        ON     
     WITH_FRIBIDI                     OFF    
     WITH_GENERIC_NINT                OFF    
     WITH_GEOS                        ON     
     WITH_GIF                         OFF    
     WITH_HARFBUZZ                    OFF    
     WITH_ICONV                       ON     
     WITH_JAVA                        OFF    
     WITH_KML                         OFF    
     WITH_LIBXML2                     ON     
     WITH_MSSQL2008                   OFF    
     WITH_MYSQL                       OFF    
     WITH_ORACLESPATIAL               OFF    
     WITH_ORACLE_PLUGIN               OFF    
     WITH_PERL                        OFF    
     WITH_PHP                         OFF    
     WITH_PHPNG                       OFF    
     WITH_PIXMAN                      OFF    
     WITH_POINT_Z_M                   ON     
     WITH_POSTGIS                     OFF    
     WITH_PROTOBUFC                   OFF    
     WITH_PYTHON                      OFF    
     WITH_RSVG                        OFF    
     WITH_RUBY                        OFF    
     WITH_SOS                         OFF    
     WITH_SVGCAIRO                    OFF    
     WITH_THREAD_SAFETY               OFF      
     WITH_V8                          OFF    
     WITH_WCS                         OFF    
     WITH_WFS                         OFF    
     WITH_WMS                         ON     
     WITH_XMLMAPFILE                  OFF     

**press g to save file and make it**

make

make install



###  CONFIGURE APACHE CGI

**example config http://www.yolinux.com/TUTORIALS/GIS-Servers-MapServer.html**

yum install httpd -y

systemctl start httpd

systemctl enable httpd

systemctl status httpd

yum install mod_fcgid -y

systemctl restart httpd

systemctl status httpd

cp mapserv /var/www/cgi-bin/mapserv

chcon -u system_u -r object_r -t httpd_sys_script_exec_t /var/www/cgi-bin/mapserv

export PATH=/usr/local/src/mapserver-7.6.1/build:$PATH

**add/modify file /etc/httpd/conf/httpd.conf**

nano /etc/httpd/conf/httpd.conf

    <Directory "/var/www/cgi-bin">
        setenv LD_LIBRARY_PATH=/usr/local/lib:/usr/local/src/mapserver-7.6.1
        AllowOverride None
        Options +ExecCGI
        AddHandler cgi-script .cgi .pl .py
        Require all granted
    </Directory>

**guida mapfile https://mapserver.org/ogc/wms_server.html#setting-up-a-wms-server-using-mapserver**

### Config example
**create file /etc/httpd/conf.d/MapServer.conf**

nano /etc/httpd/conf.d/MapServer.conf
    
    Alias /wms  /var/www/cgi-bin/mapserv
    <location /wms>
        setHandler cgi-script
        Options ExecCGI FollowSymLinks
        # Turns on CORS to allow other domains to make map tile requests - RHEL7 option, NOT for RHEL6
        Header set Access-Control-Allow-Origin "*"
        SetEnv MS_MAPFILE /data/config/map/map.map
    </location>

**execution  permission**

chcon -u system_u -r object_r -t httpd_config_t /etc/httpd/conf.d/MapServer.conf


**mapfile example**

mkdir /tmp/ms_tmp/

mkdir /ms_tmp/

mkdir /data/

mkdir /data/mapserver_data/

mkdir /data/config/

mkdir /data/config/map/

nano /data/config/map/map.map **(change "test.flt" file name, add style ecc..)**

    MAP

        NAME "map"
        STATUS ON
        SIZE 800 600
        EXTENT -180 -90 180 90
        UNITS DD
        SHAPEPATH "../data"
        IMAGECOLOR 255 255 255
        
        WEB
          IMAGEPATH "/tmp/ms_tmp/"
          IMAGEURL "/ms_tmp/"
          METADATA
            "wms_title"           "WMS Service"
            "ows_abstract"        "WMS Service that contains the following data: ..."
            "ows_onlineresource"  "http://localhost/cgi-bin/mapserv?MAP=/data/config/map/map.map"
            "ows_srs"             "EPSG:4326 EPSG:4269 EPSG:3857"
            #"ows_enable_request"  "*"
            "wms_enable_request"  "*" 
            "wms_srs" "EPSG:4326"
            "wms_contactperson"   ""
            "wms_contactorganization" ""
            "wms_contactPosition" " "
            "wms_contactelectronicmailaddress" ""
          END
        END
        
        #projections
        PROJECTION
          "init=epsg:4326"
        END
        
        #output formats
        OUTPUTFORMAT
          NAME "png"
          DRIVER AGG/PNG
          MIMETYPE "image/png"
          IMAGEMODE RGB
          EXTENSION "png"
          FORMATOPTION "GAMMA=0.75"
        END
        
        OUTPUTFORMAT
          NAME "bil"
          DRIVER "GDAL/EHdr"
          MIMETYPE "application/bil16"
          IMAGEMODE INT16
          EXTENSION "bil"
        END
        
        OUTPUTFORMAT
          NAME "GTiff"
          DRIVER GDAL/GTiff
          MIMETYPE "image/tiff"
          IMAGEMODE RGB
          EXTENSION "tif"
        END
        
        # layer definitions
        
        LAYER # FLT layer begins here
           NAME         fltfile
           STATUS	ON
           DATA         "/data/mapserver_data/test.flt"
           TYPE         RASTER
           PROJECTION
             "proj=latlong"
          "ellps=WGS84"
          "datum=WGS84"
           END  
        END # MODIS raster layer ends here


    END # Map File

**copy .flt and .hdr file into /data/mapserver_data/**

chcon -R -h -u system_u -r object_r -t httpd_sys_content_t /data

**Apache dir access**

chmod -R 777 /var/www

chmod -R 777 /usr/local/src/mapserver-7.6.1

systemctl restart httpd

**check apache error in /var/log/httpd/error_log**

**linktest**
http://server_ip/wms?service=wms&version=1.3.0&CRS=CRS:84&REQUEST=GetMap&FORMAT=image/jpeg&SRS=EPSG:3857&BBOX=511393,4837571,801893,4999571-&WIDTH=581&HEIGHT=324&LAYERS=fltfile

