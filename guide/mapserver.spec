%global ini_name 40-mapserver.ini
%global project_owner mapserver
%global project_name mapserver
# MapServer doesn't support PHP 7 yet. See:
# https://github.com/mapserver/mapserver/issues/5252
%global php_mapscript 0
# MapServer should support Python 3 but still builds with Python 2.
# This should be investigated.
%global python_mapscript 0

%global commit 74ae370a132f68ebeb60b48567e174cf9be2b5c1
%global shortcommit %(c=%{commit}; echo ${c:0:7})
%global version 7.6.1
%global versiontag 7-6-1

Name:           mapserver
Version:        %{version}
Release:        2.git%{shortcommit}%{?dist}
Summary:        Environment for building spatially-enabled internet applications

License:        BSD
URL:            http://www.mapserver.org

Source0:        https://github.com/MapServer/MapServer/releases/download/rel-7-6-1/mapserver-7.6.1.tar.gz  #https://github.com/%{project_owner}/%{project_name}/releases/download/rel-%{versiontag}/%{project_name}-%{versiontag}.tar.gz

Requires:       httpd
Requires:       dejavu-sans-fonts

BuildRequires:  autoconf
BuildRequires:  gcc-c++
BuildRequires:  cairo-devel
BuildRequires:  cmake
BuildRequires:  curl-devel
BuildRequires:  fcgi-devel
BuildRequires:  freetype-devel
BuildRequires:  fribidi-devel
BuildRequires:  gd-devel >= 2.0.16
BuildRequires:  gdal-devel
BuildRequires:  geos-devel >= 3.7.1
BuildRequires:  giflib-devel
BuildRequires:  httpd-devel
BuildRequires:  libjpeg-devel
BuildRequires:  libpng-devel
BuildRequires:  libtiff-devel
BuildRequires:  libxml2-devel
BuildRequires:  libXpm-devel
BuildRequires:  libxslt-devel
BuildRequires:  mariadb-connector-c-devel
BuildRequires:  openssl-devel
BuildRequires:  harfbuzz-devel
BuildRequires:  pam-devel
BuildRequires:  perl-devel
BuildRequires:  perl-generators
BuildRequires:  perl(ExtUtils::MakeMaker)
BuildRequires:  protobuf-c-devel
BuildRequires:  libpq-devel
BuildRequires:  proj-devel => 5.2.0
BuildRequires:  readline-devel
BuildRequires:  swig
BuildRequires:  zlib-devel


%description
Mapserver is an internet mapping program that converts GIS data to
map images in real time. With appropriate interface pages,
Mapserver can provide an interactive internet map based on
custom GIS data.


%package  libs
Summary:  %{summary}

%description libs
This package contains the libs for mapserver.


%package  devel
Summary:        Development files for mapserver
Requires:       %{name} = %{version}

%description devel
This package contains development files for mapserver.

%if 0%{php_mapscript}
%package -n php-%{name}
Summary:        PHP/Mapscript map making extensions to PHP
BuildRequires:  php-devel
Requires:       php-gd%{?_isa}
Requires:       php(zend-abi) = %{php_zend_api}
Requires:       php(api) = %{php_core_api}

%description -n php-%{name}
The PHP/Mapscript extension provides full map customization capabilities within
the PHP scripting language.
%endif # end php_mapscript


%package perl
Summary:        Perl/Mapscript map making extensions to Perl
Requires:       %{name} = %{version}-%{release}
Requires: perl(:MODULE_COMPAT_%(eval "`%{__perl} -V:version`"; echo $version))

%description perl
The Perl/Mapscript extension provides full map customization capabilities
within the Perl programming language.

%if 0%{python_mapscript}
%package -n python3-mapserver
%{?python_provide:%python_provide python3-mapserver}
# Remove before F30
Provides: %{name}-python = %{version}-%{release}
Provides: %{name}-python%{?_isa} = %{version}-%{release}
Obsoletes: %{name}-python < %{version}-%{release}
Summary:        Python/Mapscript map making extensions to Python
BuildRequires:  python3-devel
Requires:       %{name} = %{version}-%{release}
Requires:       python3

%description -n python3-mapserver
The Python/Mapscript extension provides full map customization capabilities
within the Python programming language.
%endif # end python_mapscript

%package java
Summary:        Java/Mapscript map making extensions to Java
BuildRequires:  java-devel
Requires:       %{name} = %{version}-%{release}
Requires:       java-headless

%description java
The Java/Mapscript extension provides full map customization capabilities
within the Java programming language.


%prep
%setup -q -n %{project_name}-%{version}

# replace fonts for tests with symlinks
rm -rf tests/vera/Vera.ttf
rm -rf tests/vera/VeraBd.ttf
pushd tests/vera/
ln -sf /usr/share/fonts/dejavu/DejaVuSans.ttf Vera.ttf
ln -sf /usr/share/fonts/dejavu/DejaVuSans-Bold.ttf VeraBd.ttf
popd

# Force swig to regenerate the wrapper
rm -rf mapscript/perl/mapscript_wrap.c


%build

mkdir build
cd build

export CFLAGS="${CFLAGS} -ldl -fPIC -fno-strict-aliasing"
export CXXFLAGS="%{optflags} -fno-strict-aliasing"

cmake -DINSTALL_LIB_DIR=%{_libdir} \
      -DCMAKE_INSTALL_PREFIX=%{_prefix} \
      -DCMAKE_SKIP_RPATH=ON \
      -DCMAKE_CXX_FLAGS_RELEASE="%{optflags} -fno-strict-aliasing -DACCEPT_USE_OF_DEPRECATED_PROJ_API_H=1" \
      -DCMAKE_C_FLAGS_RELEASE="%{optflags} -fno-strict-aliasing -DACCEPT_USE_OF_DEPRECATED_PROJ_API_H=1" \
      -DCMAKE_VERBOSE_MAKEFILE=ON \
      -DCMAKE_BUILD_TYPE="Release" \
      -DCMAKE_SKIP_INSTALL_RPATH=ON \
      -DCMAKE_SKIP_RPATH=ON \
      -DWITH_CAIRO=TRUE \
      -DWITH_CLIENT_WFS=TRUE \
      -DWITH_CLIENT_WMS=TRUE \
      -DWITH_CURL=TRUE \
      -DWITH_FCGI=TRUE \
      -DWITH_FRIBIDI=TRUE \
      -DWITH_GD=TRUE \
      -DWITH_GDAL=TRUE \
      -DWITH_GEOS=TRUE \
      -DWITH_GIF=TRUE \
      -DWITH_ICONV=TRUE \
      -DWITH_JAVA=TRUE \
      -DWITH_KML=TRUE \
      -DWITH_LIBXML2=TRUE \
      -DWITH_OGR=TRUE \
      -DWITH_MYSQL=TRUE \
      -DWITH_PERL=TRUE \
      -DCUSTOM_PERL_SITE_ARCH_DIR="%{perl_vendorarch}" \
%if 0%{php_mapscript}
      -DWITH_PHP=TRUE \
%endif # end php_mapscript
      -DWITH_POSTGIS=TRUE \
      -DWITH_PROJ=TRUE \
%if 0%{python_mapscript}
      -DWITH_PYTHON=TRUE \
%endif # end python_mapscript
      -DWITH_RUBY=FALSE \
      -DWITH_V8=FALSE \
      -DWITH_SOS=TRUE \
      -DWITH_THREAD_SAFETY=TRUE \
      -DWITH_WCS=TRUE \
      -DWITH_WMS=TRUE \
      -DWITH_WFS=TRUE \
      -DWITH_XMLMAPFILE=TRUE \
      -DWITH_POINT_Z_M=TRUE \
      -DWITH_APACHE_MODULE=FALSE \
      -DWITH_SVGCAIRO=FALSE \
      -DWITH_CSHARP=FALSE \
      -DWITH_ORACLESPATIAL=FALSE \
      -DWITH_ORACLE_PLUGIN=FALSE \
      -DWITH_MSSQL2008=FALSE \
      -DWITH_SDE=FALSE \
      -DWITH_SDE_PLUGIN=FALSE \
      -DWITH_EXEMPI=FALSE \
      -Wno-dev \
      ..


make  %{?_smp_mflags}


%install
mkdir -p %{buildroot}%{_libexecdir}
%if 0%{php_mapscript}
mkdir -p %{buildroot}%{php_inidir}
mkdir -p %{buildroot}%{php_extdir}
%endif # end php_mapscript
mkdir -p %{buildroot}%{_bindir}
mkdir -p %{buildroot}%{_datadir}/%{name}
mkdir -p %{buildroot}%{_includedir}/%{name}/

install -p -m 644 xmlmapfile/mapfile.xsd %{buildroot}%{_datadir}/%{name}
install -p -m 644 xmlmapfile/mapfile.xsl %{buildroot}%{_datadir}/%{name}

# install java
mkdir -p %{buildroot}%{_javadir}
install -p -m 644 build/mapscript/java/mapscript.jar %{buildroot}%{_javadir}/

# install header
install -p -m 644 *.h %{buildroot}%{_includedir}/%{name}/

cd build
make DESTDIR=%{buildroot} install %{?_smp_mflags}

%if 0%{php_mapscript}
# install php config file
mkdir -p %{buildroot}%{php_inidir}
cat > %{buildroot}%{php_inidir}/%{ini_name} <<EOF
; Enable %{name} extension module
extension=php_mapscript.so
EOF
%endif # end php_mapscript


%ldconfig_scriptlets libs


%files
%doc README.rst
%{_bindir}/legend
%{_bindir}/mapserv
%{_bindir}/msencrypt
%{_bindir}/scalebar
%{_bindir}/shp2img
%{_bindir}/shptree
%{_bindir}/shptreetst
%{_bindir}/shptreevis
%{_bindir}/sortshp
%{_bindir}/tile4ms
%{_datadir}/%{name}/

%files libs
%doc README.rst
%{_libdir}/libmapserver.so.%{version}
%{_libdir}/libmapserver.so.2

%files devel
%doc README.rst
%{_libdir}/libmapserver.so
%{_includedir}/%{name}/

%if 0%{php_mapscript}
%files -n php-%{name}
%doc mapscript/php/README
%doc mapscript/php/examples
%config(noreplace) %{php_inidir}/%{ini_name}
%{php_extdir}/php_mapscript.so*
%endif # end php_mapscript

%files perl
%doc README.rst
%doc mapscript/perl/examples
%dir %{perl_vendorarch}/auto/mapscript
%{perl_vendorarch}/auto/mapscript/*
%{perl_vendorarch}/mapscript.pm

%if 0%{python_mapscript}
%files -n python3-mapserver
%doc mapscript/python/README
%doc mapscript/python/examples
%doc mapscript/python/tests
%{python3_sitearch}/*mapscript*
%endif # end python_mapscript

%files java
%doc mapscript/java/README
%doc mapscript/java/examples
%doc mapscript/java/tests
%{_javadir}/*.jar
%{_libdir}/libjavamapscript.so

