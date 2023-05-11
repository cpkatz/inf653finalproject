//import states.json data
const data = {
    states: require('../states.json'),
    setStates: function (data) {this.states = data}
}

const mongoStates = require('../model/States.js');

const getAllStates = async (req, res) => {
    let statesList;
    const contig = req.query?.contig

    //('/states/?contig=true')
    if (contig === 'true') {
        statesList = data.states.filter(st => st.code !== 'AK' && st.code !== 'HI');
    }
    // ('/states/?contig=false')
    else if (contig === 'false'){
        statesList = data.states.filter(st => st.code === 'AK' || st.code === 'HI');
    }
    //if no contig query is specified ('/states')
    else {
        statesList = data.states;
    }

    //get all states docs from MongoDB
    const allMongoStates = await mongoStates.find({});
    

    statesList.forEach(state => {
        try {
            const stateExists = allMongoStates.find(st => st.stateCode === state.code);
            
            if (stateExists) {
                state.funfacts = [...stateExists.funfacts];
            }
        } catch (err) {
            console.log(err);
        }
    })
    res.json(statesList);
}


const getState = async (req, res) => {
    const stateFromJson = data.states.filter(st => st.code === req.code);
    const stateFromMongo = await mongoStates.findOne({stateCode: req.code}).exec();

    let singleStateData = stateFromJson[0];
    try{
        singleStateData.funfacts = stateFromMongo.funfacts;
    } catch (err) {
    }
        res.json(singleStateData);
}

const getFunfact = async (req, res) => {
    //get array for state from JSON data. if none found, returns empty array 
    const stateFromJson = data.states.filter(st => st.code === req.code);
    const stateFromMongo = await mongoStates.findOne({stateCode: req.code}).exec();

    //there are no funfacts
    if (!stateFromMongo) {
        res.status(404).json({"message":`No Fun Facts found for ${stateFromJson[0].state}`});
    } else{
        // Get a random fun fact
        res.json({"funfact": stateFromMongo.funfacts[Math.floor(Math.random() * stateFromMongo.funfacts.length)]});
    }
}

const createFunfact = async (req, res) => {
    //check if body exists
    if (!req?.body?.funfacts){
        return res.status(400).json({"message": "State fun facts value required"});
    }
    //check if funfacts supplied are in an array
    if (!Array.isArray(req?.body?.funfacts)){
        return res.status(400).json({"message": "State fun facts value must be an array"});
    }
    
    const stateFromMongo = await mongoStates.findOne({stateCode: req.code}).exec();
    
     //if state is not in MongoDB, create a new entry
    if (!stateFromMongo) {
        try {
            const result = await mongoStates.create({
                "stateCode": req.code,
                "funfacts": req.body.funfacts
            });
            res.status(201).json(result);
        } catch (err) {
            //console.log(err);
        }
    }
    //if state is already in MongoDB, add new funfacts to it
    else {
        let allFunfacts = [...stateFromMongo.funfacts, ...req.body.funfacts];
        const update = await mongoStates.updateOne({"stateCode": req.code},{"funfacts": allFunfacts});
        const result = await mongoStates.findOne({stateCode: req.code}).exec();
        res.status(201).json(result);
    } 
}

const updateFunfact = async (req, res) => {
    //check if body exists
    if (!req?.body?.index){
        return res.status(400).json({"message": "State fun fact index value required"});
    }
    if (!req?.body?.funfact){
        return res.status(400).json({"message": "State fun fact value required"});
    }

    const stateFromJson = data.states.filter(st => st.code === req.code);

    //check if state has funfacts
    const stateFromMongo = await mongoStates.findOne({stateCode: req.code}).exec();

    //if there are no funfacts
    if (!(stateFromMongo)) {
        return res.status(404).json({"message":`No Fun Facts found for ${stateFromJson[0].state}`});
    }

    const funfactIndex = req.body.index -1;

    if (stateFromMongo.funfacts.length < funfactIndex || funfactIndex < 0){
        return res.status(404).json({"message":`No Fun Fact found at that index for ${stateFromJson[0].state}`});
    }

    //update entry
    let allFunfacts = stateFromMongo.funfacts;

    //add in new funfact
    allFunfacts.splice(funfactIndex, 1, req.body.funfact);

    const update = await mongoStates.updateOne({"stateCode": req.code},{"funfacts": allFunfacts});

    //retrieve updates document
    const result = await mongoStates.findOne({stateCode: req.code}).exec();
    res.status(201).json(result);
}

const deleteFunfact = async (req, res) => {
    //check if body exists
    if (!req?.body?.index){
        return res.status(400).json({"message": "State fun fact index value required"});
    }

    const stateFromJson = data.states.filter(st => st.code === req.code);

    //check if state has funfacts
    const stateFromMongo = await mongoStates.findOne({stateCode: req.code}).exec();

    //if there are no funfacts
    if (!stateFromMongo) {
        return res.status(404).json({"message":`No Fun Facts found for ${stateFromJson[0].state}`});
    }

    //calculate index place
    const funfactIndex = req.body.index -1;

    if (stateFromMongo.funfacts.length < funfactIndex || funfactIndex < 0){
        return res.status(404).json({"message":`No Fun Fact found at that index for ${stateFromJson[0].state}`});
    }

    const funfactArray = stateFromMongo.funfacts.filter((element, index) => {return index != funfactIndex});

    stateFromMongo.funfacts = funfactArray;
    const result = await stateFromMongo.save();

    res.status(201).json(result);
}

const getAttribute = async (req, res) => {
    //get array for state from JSON data. if none found, returns empty array 
    const stateFromJson = data.states.filter(st => st.code === req.code);

    //req.route.path.split('/')
    const pathArray = req.route.path.split('/');
    //console.log(pathArray[2]);
    if (pathArray[2] === 'capital'){
        res.json({
            "state" : stateFromJson[0].state,
            "capital" : stateFromJson[0].capital_city
        });
    }
    else if (pathArray[2] === 'nickname'){
        res.json({
            "state" : stateFromJson[0].state,
            "nickname" : stateFromJson[0].nickname
        });
    }
    else if (pathArray[2] === 'population'){
        res.json({
            "state" : stateFromJson[0].state,
            "population" : stateFromJson[0].population.toLocaleString('en-US')
        });
    }
    else if (pathArray[2] === 'admission'){
        res.json({
            "state" : stateFromJson[0].state,
            "admitted" : stateFromJson[0].admission_date
        });
    }

}

module.exports = {
    getAllStates,
    getState,
    getFunfact,
    getAttribute,
    createFunfact,
    updateFunfact,
    deleteFunfact
}