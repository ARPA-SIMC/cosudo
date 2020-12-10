MapServer
==================================

## 1 MApServer RPM install

### 1.2 RPM install from repo
***if repo with mapserver is available, install it**

### 1.2 build and install
***if repo with mapserver is NOT available, you can manually build and install it**

    sudo su
    dnf install -q -y epel-release
    dnf install -q -y 'dnf-command(config-manager)'
    dnf config-manager --set-enabled PowerTools
    dnf groupinstall -q -y "Development Tools"
    dnf copr enable -y simc/stable
    dnf install -q -y 'dnf-command(builddep)'
    dnf install -y rpmdevtools
    exit

    rpmdev-setuptree

**copy spec file in rpmbuild/SPECS/ build dep and installrpm (change name)**

    sudo dnf builddep rpmbuild/SPECS/mapserver.spec
    spectool -g -R rpmbuild/SPECS/mapserver.spec
    rpmbuild -ba rpmbuild/SPECS/mapserver.spec
    sudo  dnf install rpmbuild/RPMS/x86_64/mapserver-7.6.1-2.git74ae370.el8.x86_64.rpm


(optional) if need editor can install nano or use your favorite

    sudo dnf install nano -y


## 2 CONFIGURE APACHE CGI

**example config http://www.yolinux.com/TUTORIALS/GIS-Servers-MapServer.html**

**install apache and cgi module**

    sudo su
    dnf install httpd -y
    systemctl start httpd
    systemctl enable httpd
    dnf install mod_fcgid -y
    systemctl restart httpd

**copy or link mapserv file in  cgi dir**

    cp /usr/bin/mapserv /var/www/cgi-bin/mapserv

or

    ln /usr/bin/mapserv /var/www/cgi-bin/mapserv

configure permission

    chcon -u system_u -r object_r -t httpd_sys_script_exec_t /var/www/cgi-bin/mapserv


## 3 Map file config

mapfile guide `here <https://mapserver.org/ogc/wms_server.html#setting-up-a-wms-server-using-mapserver>`_

**create file /etc/httpd/conf.d/MapServer.conf**

    nano /etc/httpd/conf.d/MapServer.conf

add on file (change MS_MAPFILE path):

    <Directory "/var/www/cgi-bin">
        AllowOverride None
        Options +ExecCGI
        AddHandler cgi-script .cgi .pl .py
        Require all granted
    </Directory>
    
    Alias /wms  /var/www/cgi-bin/mapserv
    <location /wms>
        setHandler cgi-script
        Options ExecCGI FollowSymLinks
        # Turns on CORS to allow other domains to make map tile requests - RHEL7 option, NOT for RHEL6
        Header set Access-Control-Allow-Origin "*"
        SetEnv MS_MAPFILE /data/config/map/map.map
    </location>

configure permission

    chcon -u system_u -r object_r -t httpd_config_t /etc/httpd/conf.d/MapServer.conf

create mapfile and data  dir (change dir)

    mkdir /tmp/ms_tmp/
    mkdir /ms_tmp/
    mkdir /data/
    mkdir /data/mapserver_data/
    mkdir /data/config/
    mkdir /data/config/map/

**create map file (change path)**

    nano /data/config/map/map.map

**add on file (change "test.flt" file name, layer name, add style ecc..)**

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
            "wms_srs" "epsg:3857"
            "wms_contactperson"   ""
            "wms_contactorganization" ""
            "wms_contactPosition" " "
            "wms_contactelectronicmailaddress" ""
          END
        END
        
        #projections output
        PROJECTION
          "init=epsg:3857"
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
        
        # layer definitions
        
        LAYER # dem_emi layer begins here
           NAME         dem_emi
           STATUS ON
           DATA         "/data/mapserver_data/test.flt"
           TYPE         RASTER
           PROJECTION
             "init=epsg:32632"
           END  
           CLASS
             STYLE
               RANGEITEM "dem"
               COLORRANGE 0 0 0  255 255 255
               DATARANGE 0.0 2000.0
             END
           END
        END # dem_emi raster layer ends here

    END # Map File

**copy .flt and .hdr file into dir (change dir)**

    chcon -R -h -u system_u -r object_r -t httpd_sys_content_t /data

restart apache

    systemctl restart httpd

## 4 Test MapServer layer

**check apache error in /var/log/httpd/error_log**

**linktest read capabilities and find layer**
http://server_ip/wms?service=WMS&request=GetCapabilities

