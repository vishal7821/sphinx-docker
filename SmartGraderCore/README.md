# `smartgrader` — The core APIs for the application

This is in development phase. Application is used for convenient management and fast grading 
grading of the application

## Getting Started

To get you started you can simply clone the `SmartGraderCore` repository and install the dependencies:

### Prerequisites

need to have database setup, memcached setup


### Install Dependencies

install mysqldb\
install apache(optional: if you want to use phpmyadmin)\
install memcached\
insatll pycharm(optional)\
create python virtual environment add following libraries to the environment:
django : 2.1.5
djangorestframework : 3.9.1
mysql-connector-c : 6.1.11
mysql client 1.3.14
python memcached 1.59


## Directory Layout

```
SmartGraderCore/                  --> all of the source files for the application
  authentication               --> App that takes care of authentication like login , logout, password change , password reset,account details lit and update etc
  multidb               --> This is used to route requests based on course id
  SmartGrader              -->contains application based settings
  manage.py                 --> used to interact with application through shell or cmd line
```


## Testing
