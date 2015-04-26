(function() {
  var extensions = {}

  var ais = {}
  _.extend(ais, model.aiPersonalities(), extensions)

  model.aiPersonalityNames = ko.computed(function() {
    return _.keys(model.aiPersonalities())
  })
  model.aiPersonalities(ais)
})()

