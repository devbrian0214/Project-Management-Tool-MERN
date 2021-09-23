const Project = require('../models/project');
const Stack = require('../models/stack');

const { body, validationResult } = require("express-validator");


exports.project_list = async (req, res, next) => {
  try {
    const projects = await Project.find({}).select("-__v");
    res.json(projects);
  } catch (error) {
    res.json(error)
    next();
  }
};

exports.project_detail = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).select("-__v");
    res.json({project});
  } catch (error) {
    res.json(error)
    next();
  }
};

exports.project_create_get = async(req, res, next) => {
  try {
    const stacks = await Stack.find({}).select("-__v -description -released_year");
    res.json(stacks);
  } catch (error) {
    res.json(error);
    next();
  }
};

exports.project_create = async (req, res, next) => {
  if (!(req.body.stack instanceof Array)) {
    if (typeof req.body.stack === 'undefined') {
      req.body.stack = [];
    } else {
      req.body.stack = new Array(req.body.stack);
    }
  }
  [body('name').isLength({ min: 3 }).withMessage('Name must not be empty.').trim().escape(),
  body('description').isLength({ min: 15 }).withMessage('Description must not be empty.').trim().escape(),
  body('year', 'year must be in the range (1980-2100)').custom(value=>{
    if(value < 1980 || value > 2100){
      throw new Error('Years does not match range (1980-2100)');
    }
    return true;
  }).toInt().trim().escape(),
  body('status', 'Wrong data, does not match predefined values').isIn(['Development', 'Standby', 'Production']).trim().escape(),
  body('stack.*').escape(),]
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    };

    try {
      const {name, description, year, status, stack, links} = req.body;
      const project = new Project({
        name,
        description,
        year,
        status,
        stack,
        links,
        /*images: req.file.filename,*/
      });
      await project.save();
      res.status(201);
      res.json({message: 'Project created successfully', project});
    } catch (error) {
      res.json(error)
      next();
    }
};

exports.project_update = async (req, res, next) => {
  if (!(req.body.stack instanceof Array)) {
    if (typeof req.body.stack === 'undefined') {
      req.body.stack = [];
    } else {
      req.body.stack = new Array(req.body.stack);
    }
  }
  [body('name').isLength({ min: 3 }).withMessage('Name must not be empty.').trim().escape(),
  body('description').isLength({ min: 15 }).withMessage('Description must not be empty.').trim().escape(),
  body('year', 'year must be in the range (1980-2100)').custom(value=>{
    if(value < 1980 || value > 2100){
      throw new Error('Years does not match range (1980-2100)');
    }
    return true;
  }).toInt().trim().escape(),
  body('status').isIn(['Development', 'Standby', 'Production']).withMessage('Wrong data, does not match predefined values').trim().escape(),
  body('stack.*').escape(),]
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    };

    try {
      const project = await Project.findByIdAndUpdate(req.params.id, { $set: req.body }, {new: true});
      res.status(200);
      res.json({message: 'Project updated successfully', project});
    } catch (error) {
      res.json(error)
      next();
    }
};

exports.project_delete = async (req, res, next) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.status(200);
    res.json({message: 'Project deleted Successfully'});
  } catch (error) {
    res.json(error)
    next();
  }
};