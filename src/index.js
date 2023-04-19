
    const check = await profs.findOne({ userId: req.session.userID })
    if (check) {
        const filter = { userId: req.session.userID}
        const update = { fullname, address1, address2, city, states, zip }
        const options = { new: true };
        const updatedUser = await profs.findOneAndUpdate(filter, update, options);
        console.log("Updated Profile in (profmgmt Post Request");
        res.render("index",{user:true})
    } else {
        let newProfile={ userId:req.session.userID,fullname:fullname,address1: address1,
            address2:address2,city:city,
            states: states,
            zip: zip}
        await profs.insertMany(newProfile)
         let findProfile = profs.findOne({ userId: req.session.userID });
        res.render("index",{user:true,findProfile})
      }
})
app.listen(3000)