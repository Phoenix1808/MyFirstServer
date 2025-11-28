const asyncHandler = require("express-async-handler")
const Contact = require("../models/contactModels")
//description Get all Contacts
// route Get/api/contacts
// @access private
//ASYNC is used for MongoDB and wheneve we use async then to find the error we need to use the try and catch block


const getConta = asyncHandler(async (req,res) => {
    const contacts = await Contact.find({user_id: req.user.id});
    res.status(200).json(contacts)
}); //we need to wrap the fxn inside the asyncHnadler



//description Create new Contacts
// route POST/api/contacts
// @access private
const createConta =asyncHandler (async (req,res) => {
    console.log("The request body is :", req.body);
    const{name,phone,email} = req.body;
    if(!name || !phone || !email){
        res.status(400);
        throw new Error("MaNDATORY FIELDS");
        }

    const contact = await Contact.create({
        name,
        phone,
        email,
        user_id: req.user.id
    })
    res.status(201).json(contact)
});


//description Get Contacts
// route get/api/contacts/id
// @access private
const getContact = asyncHandler(async (req,res) => {
    const contact = await Contact.findById(req.params.id)
    if(!contact){
        res.status(404)
        throw new Error("Contact nhi mila ")
    } 
        res.status(200).json(contact)
});


//description UPdate Contacts
// route POST/api/contacts/:id
// @access private
const UpdateConta = asyncHandler(async (req,res) => {
    const contact = await Contact.findById(req.params.id)
    if(!contact){
        res.status(404)
        throw new Error("Contact nhi mila")
    }

    if(contact.user_id.toString() !== req.user.id){
    res.status(403);
    throw new Error("User not authorized to update other user contacts");
    }

    const UpdatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new : true}
    )
    res.status(200).json(UpdatedContact)
});

//description Delete Contacts
// route DELETE/api/contacts/:id
// @access private
const deleteConta =asyncHandler( async (req,res) => {
    const contact = await Contact.findById(req.params.id)
    if(!contact){
        res.status(404);
        throw new Error("Contact nhi mila");
    }
    if(contact.user_id.toString() !== req.user.id){
    res.status(403);
    throw new Error("User not authorized to delete other user contacts");
    }
    // remove the specific document we found. Avoid calling `Contact.remove()` with no filter
    // which would delete all documents. Use findByIdAndDelete for clarity.
    await Contact.findByIdAndDelete(req.params.id)

    res.status(200).json(contact)
});
module.exports = {getConta,createConta,UpdateConta, deleteConta,getContact}