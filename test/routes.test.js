'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const express = require('express');

const app = require('../index');
const BikeRoute = require('../models/bike-route');
const { routes } = require('../db/data');
const {TEST_DATABASE_URL} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');

// Set NODE_ENV to `test` to disable http layer logs
// You can do this in the command line, but this is cross-platform
process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Velo-Maps API - BikeRoute', function() {
  before(function() {
    return dbConnect(TEST_DATABASE_URL)
      .then(() => Promise.all([
        BikeRoute.deleteMany()
      ]));
  });

  beforeEach(function () {
    return Promise.all([
      BikeRoute.insertMany(routes)
    ]);
  });

  afterEach(function() {
    return Promise.all([
      BikeRoute.deleteMany()
    ]);
  });
  
  after(function() {
    return dbDisconnect();
  });

  describe('GET /api/routes', function() {
    it('should return all saved biked routes', function() {
      let res;
      return chai.request(app)
        .get('/api/routes')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length.of.at.least(1);
          return BikeRoute.count();
        })
        .then(function(count) {
          expect(res.body.length).to.equal(count);
        });
    });

    it('Should return an array of objects with correct properties', function() {
      let res;
      return chai.request(app)
        .get('/api/routes')
        .then(function(_res) {
          res = _res;
          expect(res.body).to.be.an('array');
          res.body.forEach(function (item, i) {
            expect(item).to.be.a('object');
            expect(item).to.include.all.keys('id', 'name', 'path', 'createdAt', 'updatedAt');
            expect(item.path).to.be.an('array');
            expect(item.name).to.be.a('string');
          });
          return BikeRoute.find(); 
        })
        .then(function(data) {
          expect(data[0].path.length).to.equal(res.body[0].path.length); 
          expect(data[0].name).to.equal(res.body[0].name); 
        });
    });
  });

  describe('POST /api/routes', function() {

    it('should create and return a new route when provided a valid name, description, and path', function() {
      const newRoute = {
        name: 'New Route',
        description: 'new route description',
        path: [
          {
            lat: 39.753761766463,
            lng: -104.99863849925396
          },
          {
            lat: 39.750396366621935,
            lng: -104.99413238810894
          }]
      };
      let res;
      return chai.request(app)
        .post('/api/routes')
        .send(newRoute)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'name', 'description', 'path', 'createdAt', 'updatedAt');
          expect(res.body.path).to.be.an('array');
          res.body.path.forEach(function(coord) {
            expect(coord).to.be.an('object');
            expect(coord).to.have.all.keys('lat', 'lng');
            expect(coord.lat).to.be.a('number');
            expect(coord.lng).to.be.a('number');
          });
          return BikeRoute.findById(res.body.id);
        })
        .then(function(data) {
          // console.log(res.body.path); ask Casey about this at check-in
          // console.log(data.path);
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          // expect(res.body.path).to.equal(data.path);
          expect(res.body.path.length).to.equal(data.path.length);
          expect(res.body.description).to.equal(data.description);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should create and return new route when no description is provided', function() {
      const newRoute = {
        name: 'New Route',
        path: [
          {
            lat: 39.753761766463,
            lng: -104.99863849925396
          },
          {
            lat: 39.750396366621935,
            lng: -104.99413238810894
          }]
      };
      let res;
      return chai.request(app)
        .post('/api/routes')
        .send(newRoute)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'name', 'path', 'createdAt', 'updatedAt');
          expect(res.body.path).to.be.an('array');
          res.body.path.forEach(function(coord) {
            expect(coord).to.be.an('object');
            expect(coord).to.have.all.keys('lat', 'lng');
            expect(coord.lat).to.be.a('number');
            expect(coord.lng).to.be.a('number');
          });
          return BikeRoute.findById(res.body.id);
        })
        .then(function(data) {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(res.body.path.length).to.equal(data.path.length);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return an error when missing "Name" field', function() {
      const newRoute = {
        description: 'new route description',
        path: [
          {
            lat: 39.753761766463,
            lng: -104.99863849925396
          },
          {
            lat: 39.750396366621935,
            lng: -104.99413238810894
          }]
      };
      return chai.request(app)
        .post('/api/routes')
        .send(newRoute)
        .then(function(res) {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });

    it('should return an error when missing "Path" field', function() {
      const newRoute = {
        name: 'new route',
        description: 'new route description',
      };
      return chai.request(app)
        .post('/api/routes')
        .send(newRoute)
        .then(function(res) {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `path` in request body');
        });
    });
    
    it('should return an error when "name" is empty string', function () {
      const newRoute = {
        name: '',
        path: [
          {
            lat: 39.753761766463,
            lng: -104.99863849925396
          },
          {
            lat: 39.750396366621935,
            lng: -104.99413238810894
          }]
      };
      return chai.request(app)
        .post('/api/routes')
        .send(newRoute)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });
  });
});