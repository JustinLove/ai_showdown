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
  return localPath() + '/Uber Entertainment/Planetary Annihilation'
}

var mediaPath = function(stream) {
  if(process.platform === 'win32') {
    return paPath() + '/data/streams/' + stream + '/media/' // ????
  }
  else if(process.platform === 'linux') {
    return paPath() + '/' + stream + '/media/' // ????
  }
  else if(process.platform === 'darwin') {
    return paPath() + '/data/streams/' + stream +'/PA.app/Contents/Resources/media/'
  }
  else {
    // the user can change it anyway
    return paPath() + '/data/streams/' + stream + '/media/'
  }
}

module.exports = {
  local: localPath,
  pa: paPath,
  media: mediaPath,
}
