# TransitSphere

[![Build Status](https://travis-ci.org/ibromley/sdot-webcomp.svg?branch=master)](https://travis-ci.org/ibromley/sdot-webcomp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


![TransitSphere Logo](src/assets/Channelization.svg)

This project aims to provide a web companion to the SDOT status and condition report. Traditionally produced as a [paper document](http://www.seattle.gov/Documents/Departments/SDOT/About/SDOT2015SCReportFinal12-7-2015.pdf), the companion to the SDOT Status and Condition Report will be a public website, providing a subset of the information in the report, presented in a more accessible way. This companion will not only improve transparency by making the information in that report more accessible to Seattle residents, but also will augment the existing report by adding informative and interactive visuals. 

Live demo: [http://http://sdot.capstone.ischool.uw.edu/](http://sdot.capstone.ischool.uw.edu/)

Data Source: [https://docs.google.com/spreadsheets/d/1-aBL2tsKYet1vlc4ESGTYoNmt7wzVoDdmzv3PKZWjkU/](https://docs.google.com/spreadsheets/d/1-aBL2tsKYet1vlc4ESGTYoNmt7wzVoDdmzv3PKZWjkU/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:

* Git - [Download & Install Git](https://git-scm.com/downloads). OSX and Linux machines typically have this already installed.
* Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
* Grunt - [Download & Install Grunt](https://gruntjs.com/) the javascript task runner. You can download and install it by simply using npm. 
```
npm install -g grunt-cli
```

### Installing

The recommended way to get TransitSphere is to use `git` to directly clone the repository to your localmachine:

```
$ git clone https://github.com/ibromley/sdot-webcomp sdot-webcomp
$ cd sdot-webcomp
```
```
# install dependencies
npm install

# build project directory
npm run build
```

## Deployment

Comming Soon!

## Built With
* [Less](http://lesscss.org/) - CSS preprocesor
* [Lodash](https://lodash.com) - HTML templating
* [NPM](https://www.npmjs.com/) - Dependency Management
* [Grunt](https://gruntjs.com/) - Our task runner

## Authors

* **Iain Bromley** - *Development* - [ibromley](https://github.com/ibromley)
* **Linh Tran** - *UI/UX Design* - [ltran1118](https://github.com/ltran1118)
* **Patrick Smith** - *Project Managment* [psmith94](https://github.com/psmith94)
* **Ryker Schwartzenberger** - *Development* - [rykerls](https://github.com/rykerls)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details

## Acknowledgments

* Props to the [Asset & Performance Management](http://www.seattle.gov/transportation/about-sdot/asset-management) team at the Seattle Department of Transportation for allowing us to paricipate on this project
* Thanks to the Seattle Times for the awesome [project template](https://github.com/seattletimes/newsapp-template)

