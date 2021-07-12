const express = require("express");
// #1 Create a new express Router
const router = express.Router();


//  #2 Add a new route to the Express router
router.get('/', (req,res)=>{
    res.render("products/index")
})

// #3 export out the router
module.exports = router; 