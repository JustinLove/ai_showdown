var Path = require('path')

var papath = require('./lib/path')
var media = papath.media('stable')
var target = papath.media('hack')

module.exports = function(grunt) {
  var ais = grunt.file.readJSON('ais.json')
  var identifier = 'com.wondible.pa.ai_showdown.' + ais.ais.map(function(ai) {return ai.rule_postfix}).join('')
  var modPath = '../../server_mods/' + identifier + '/'

  // Project configuration.
  var config = {
    copy: {
      ai_config: {
        files: [
          {
            src: ais.ai_config,
            dest: 'pa/ai/ai_config.json',
          },
        ],
      },
      ai_configs: {
        files: ais.ais.map(function(ai) {
          return {
            src: ai.path + '/ai_config.json',
            dest: 'pa/ai/ai_config' + ai.rule_postfix + '.json',
          }
        })
      },
      mod: {
        files: [
          {
            src: [
              'LICENSE.txt',
              'README.md',
              'CHANGELOG.md',
              'server-script/**',
              'ui/**',
              'pa/**'],
            dest: modPath,
          },
        ],
      },
      modinfo: {
        files: [
          {
            src: ['modinfo.json'],
            dest: modPath,
          },
        ],
        options: {
          process: function(content, srcpath) {
            var info = JSON.parse(content)
            info.display_name = 'AI Showdown: ' + ais.ais.map(function(ai) {return ai.name}).join(' vs. ')
            info.description = ais.ais.map(function(ai) {
              return ai.name + ': ' + ai.commander
            }).join(', ')
            info.date = require('dateformat')(new Date(), 'yyyy/mm/dd')
            info.identifier = identifier
            console.log(info.display_name, info.identifier, info.version, info.date)
            return JSON.stringify(info, null, 2)
          }
        }
      },
      vanilla: {
        files: [
          {
            expand: true,
            cwd: media + 'pa/ai/',
            src: ['**', '!neural_networks/**'],
            dest: 'ai/vanilla/',
          },
        ],
        options: {
          process: function(contents, path) {
            return JSON.stringify(JSON.parse(contents), null, 2)
          }
        },
      },
    },
    clean: ['pa', 'ui', 'server-script', 'ai/vanilla', modPath],
    platoons: {},
  }

  grunt.initConfig(config)

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('media_check', 'Check if the media path is configured correctly', function() {
    if (grunt.file.exists(media + 'pa/ai/ai_config.json')) {
      console.log("media path appears to be pointing at a copy of PA")
      console.log(media)
    } else {
      console.log("Could not find AI files at the current media path.  Please edit `var media =` at the top of `Gruntfile.js`")
      console.log(media)
    }
  })

  var processMapFile = function(path, ai) {
    var base = Path.basename(path, '.json')
    var dir = Path.basename(Path.dirname(path))
    var maps = grunt.file.readJSON(path)
    var dest = 'pa/ai/' + dir + '/' + base + ai.file_postfix + '.json'
    grunt.file.copy(path, dest)
  }

  var processMaps = function(basePath, ai) {
    var files = grunt.file.expand([
      basePath + '/unit_maps/*',
    ])
    files.forEach(function(path) {processMapFile(path, ai)})
  }

  grunt.registerTask('ai_unit_map', 'Copy and rename unit maps', function() {
    ais.ais.forEach(function(ai) {
      if (ai.base_path) {
        processMaps(ai.base_path, ai)
      }
      processMaps(ai.path, ai)
    })
  })

  var processPlatoonFile = function(path, ai) {
    var base = Path.basename(path, '.json')
    var dir = Path.basename(Path.dirname(path))
    var platoons = grunt.file.readJSON(path).platoon_templates
    var out = {}
    Object.keys(platoons).forEach(function(name) {
      out[name + ai.rule_postfix] = platoons[name]
    })
    if (Object.keys(out).length > 0) {
      var dest = 'pa/ai/' + dir + '/' + base + ai.file_postfix + '.json'
      grunt.file.write(dest, JSON.stringify({platoon_templates: out}, null, 2))
    }
  }

  var processPlatoons = function(basePath, ai) {
    var files = grunt.file.expand([
      basePath + '/platoon_templates/*',
    ])
    files.forEach(function(path) {processPlatoonFile(path, ai)})
  }

  grunt.registerTask('platoon_templates', 'Rename templates and copy files', function() {
    ais.ais.forEach(function(ai) {
      if (ai.base_path) {
        processPlatoons(ai.base_path, ai)
      }
      processPlatoons(ai.path, ai)
    })
  })

  var processBuildFile = function(path, ai) {
    var base = Path.basename(path, '.json')
    var dir = Path.basename(Path.dirname(path))
    var builds = grunt.file.readJSON(path)
    builds.build_list.forEach(function(rule) {
      rule.name = ai.name_prefix + rule.name
      if (dir == 'platoon_builds') {
        rule.to_build = rule.to_build + ai.rule_postfix
      }
      rule.build_conditions.forEach(function(cond) {
        cond.unshift({
          "test_type":"UnitCount",
          "unit_type_string0":"Commander & " + ai.unittype,
          "compare0":">=",
          "value0":1
        })
      })
    })
    var dest = 'pa/ai/' + dir + '/' + base + ai.file_postfix + '.json'
    grunt.file.write(dest, JSON.stringify(builds, null, 2))
  }

  var processBuilds = function(basePath, ai) {
    var files = grunt.file.expand([
      basePath + '/platoon_builds/*',
      basePath + '/fabber_builds/*',
      basePath + '/factory_builds/*',
    ])
    files.forEach(function(path) {processBuildFile(path, ai)})
  }

  grunt.registerTask('builds', 'Rename builds and copy files', function() {
    ais.ais.forEach(function(ai) {
      if (ai.base_path) {
        processBuilds(ai.base_path, ai)
      }
      processBuilds(ai.path, ai)
    })
  })

  grunt.registerTask('commanders', 'Add unittype to commanders, requires media path', function() {
    var base = grunt.file.readJSON(media + 'pa/units/commanders/base_commander/base_commander.json')
    var commanders = require(media + 'server-script/lobby/commander_table').data
    ais.ais.forEach(function(ai) {
      var specPath = commanders.filter(function(com) {
        return com.ObjectName == ai.commander
      })[0].UnitSpec
      var spec = grunt.file.readJSON(media + specPath)
      spec.display_name = ai.name
      spec.unit_types = base.unit_types.concat(['UNITTYPE_' + ai.unittype])
      grunt.file.write('.' + specPath, JSON.stringify(spec, null, 2))
    })
  })

  grunt.registerTask('commander_manager', 'Write server script file with commander list, requires media path and must be put in place by user', function() {
    var commanders = ais.ais.map(function(ai) { return ai.commander })
    var manager = grunt.file.read(media + 'server-script/lobby/commander_manager.js')
    // implicitly to-end-of-line
    manager = manager.replace(/(var default_commanders = ).*/, "$1" + JSON.stringify(commanders))
    grunt.file.write('server-script/lobby/commander_manager.js', manager)
  })

  var extractPersonalities = function(path) {
    var text = grunt.file.read(path)
    var perString = text.match(/({(\s|\n)*'Normal'(.|\r|\n)*});/m)[1]
    var json = perString.replace(/'/g, '"').replace(/(\w+):/g, '"$1":').replace(/},\r?\n\s+}/, '}}')
    return JSON.parse(json)
  }

  var installFile = function(path) {
    var fullPath = target + path
    var backup = fullPath + '.backup'

    if (grunt.file.exists(fullPath)) {
      if (!grunt.file.exists(backup)) {
        grunt.file.copy(fullPath, backup)
      }
      grunt.file.copy(path, fullPath)
    } else {
      console.log('target path not defined (Gruntfile.js), file must be copied manually')
      console.log(fullPath)
    }
  }

  grunt.registerTask('install', 'overwrite server-script files in the PA target path', function() {
    installFile('server-script/lobby/commander_manager.js')
  })

  grunt.registerTask('personalities', 'Look for custom ai personalities', function() {
    var out = {}
    ais.ais.forEach(function(ai) {
      var path = ai.path + '/../../ui/main/game/new_game/js/ai.js'
      if (grunt.file.exists(path)) {
        var mod = extractPersonalities(path)
        Object.keys(mod).forEach(function(personality) {
          var name = ai.name_prefix + personality
          mod[personality].name = name
          out[name] = mod[personality]
        })
      }
    })
    var template = grunt.file.read('template/personalities.js')
    var js = JSON.stringify(out, null, 2)
    var mod = template.replace('var extensions = {}', 'var extensions = ' + js)
    grunt.file.write('ui/mods/ai_showdown/personalities.js', mod)
  })

  grunt.registerTask('build', [
    'copy:ai_configs',
    'copy:ai_config',
    'ai_unit_map',
    'platoon_templates',
    'builds',
    'personalities',

    // requires media path:
    'commanders',
    'commander_manager',
  ]);
  grunt.registerTask('default', ['build']);

  grunt.registerTask('mod', [
    'copy:modinfo',
    'copy:mod',
    // requires target path:
    'install',
  ])
};

