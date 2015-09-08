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
  var local = localPath()
  var candidates = [
    local + '/Uber Entertainment/Planetary Annihilation/data/streams',
    'C:/Games/Uber Entertainment/Planetary Annihilation Launcher/Planetary Annihilation',
    'D:/Games/Uber Entertainment/Planetary Annihilation Launcher/Planetary Annihilation',
    local + '/Steam/SteamApps/common/Planetary Annihilation Titans',
    local + '/Steam/SteamApps/common/Planetary Annihilation',
    'C:/Program Files (x86)/Steam/SteamApps/common/Planetary Annihilation Titans',
    'C:/Program Files (x86)/Steam/SteamApps/common/Planetary Annihilation',
    'C:/Games/SteamLibrary/steamapps/common/Planetary Annihilation Titans',
    'C:/Games/SteamLibrary/steamapps/common/Planetary Annihilation',
    'D:/Games/SteamLibrary/steamapps/common/Planetary Annihilation Titans',
    'D:/Games/SteamLibrary/steamapps/common/Planetary Annihilation',
  ]
  for (var i in candidates) {
    if (existsSync(candidates[i])) {
      return candidates[i]
    }
  }
}

var mediaPath = function(stream) {
  var pa = paPath()
  var candidates = [
    pa + '/' + stream + '/PA.app/Contents/Resources/media/', // OS X
    pa + '/' + stream + '/media/', // windows, linux?
    pa + '/media/', // steam
    pa + '/PA.app/Contents/Resources/media/', // steam OS X
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
