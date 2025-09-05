/**
 * Helper utilities for working with models more reliably
 */

const getModelSafely = async (modelName, id, options = {}) => {
  try {
    // Try to get the model from the models directory directly
    const model = require(`../models/${modelName}`);
    
    // Verify the model has findByPk method (Sequelize style)
    if (model && typeof model.findByPk === 'function') {
      console.log(`Found ${modelName} model directly with findByPk method`);
      return await model.findByPk(id, options);
    } 
    
    // If the model has findById method (Mongoose style)
    if (model && typeof model.findById === 'function') {
      console.log(`Found ${modelName} model directly with findById method`);
      return await model.findById(id, options);
    }
    
    // If the direct import is not a model, try getting it from index
    const models = require('../models');
    if (models[modelName] && typeof models[modelName].findByPk === 'function') {
      console.log(`Found ${modelName} model in models index with findByPk method`);
      return await models[modelName].findByPk(id, options);
    }
    
    // Try index with findById method
    if (models[modelName] && typeof models[modelName].findById === 'function') {
      console.log(`Found ${modelName} model in models index with findById method`);
      return await models[modelName].findById(id, options);
    }
    
    console.error(`Model ${modelName} not found or does not have findByPk/findById method`);
    return null;
  } catch (error) {
    console.error(`Error getting model ${modelName}:`, error);
    return null;
  }
};

module.exports = {
  getModelSafely
};
