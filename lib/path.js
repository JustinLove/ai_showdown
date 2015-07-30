var existsSync = require('fs').existsSync

var localPath = function() {
  // borrowed from PAMM-Atom
  if(process.platform === 'win32') {
    return process.env.LOCALAPPDATA.replace(/\\/g,"/");
  }
  else if(process.platform === 'linux') {
    return process.env.HOME + "/.local"
  }
  else if(process.platform === 'darwin') {
    return process.env.HOME + "/Library/Application Support"
  }
  else {
    // the user can change it anyway
    return process.env.HOME + "/.local"
  }
}

var paPath = function() {
  var candidates = [
    localPath() + '/Uber Entertainment/Planetary Annihilation',
    'C:/Games/Uber Entertainment/Planetary Annihilation Launcher/Planetary Annihilation',
    'D:/Games/Uber Entertainment/Planetary Annihilation Launcher/Planetary Annihilation',
    localPath() + '/Steam/SteamApps/common/Planetary Annihilation',
    'C:/Program Files (x86)/Steam/SteamApps/common/Planetary Annihilation',
    'C:/Games/SteamLibrary/steamapps/common/Planetary Annihilation',
    'D:/Games/SteamLibrary/steamapps/common/Planetary Annihilation',
  ]
  for (var i in candidates) {
    if (existsSync(candidates[i])) {
      return candidates[i]
    }
  }
}

var mediaPath = function(stream) {
  var candidates = [
    paPath() + '/data/streams/' + stream + '/media/', //windows?
    paPath() + '/data/streams/' + stream +'/PA.app/Contents/Resources/media/', // OS X
    paPath() + '/' + stream + '/media/', // linux ????
    paPath() + '/media', // steam
    paPath() + '/PA.app/Contents/Resources/media', // steam OS X
  ]
  for (var i in candidates) {
    if (existsSync(candidates[i])) {
      return candidates[i]
    }
  }
}

module.exports = {
  local: localPath,
  pa: paPath,
  media: mediaPath,
}
