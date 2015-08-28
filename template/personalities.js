(function() {
  var extensions = {}

  _.extend(model.aiPersonalities, extensions)

  model.aiPersonalityNames(_.keys(model.aiPersonalities));
})()

