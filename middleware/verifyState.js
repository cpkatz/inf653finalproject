const express = require('express');
const app = express();
statesArray = require('../model/states.json');

// //custom middleware to verify URL parameter :state for endpoints
const verifyState = () => {
    return (req, res, next) => {
         if (!req?.params?.state){
            return res.status(400).json({"message":"Invalid state abbreviation parameter"});
        }
        
        const state = req.params.state.toUpperCase();
        //create array of all state names, check if state code exists in array
        const isValidState = statesArray.map(st => st.code).find(code=> code === state);

        //if state code does not exist:
        if (!isValidState) {return res.status(400).json({
            "message":"Invalid state abbreviation parameter"
        })
    }
    //if it was a valid state code
    req.code = state;
    next();
    }
  }

module.exports = verifyState;

