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
              return ai.name
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
    clean: ['pa', 'ui', 'ai/vanilla', modPath],
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

  var processMaps = function(basePath, ai) {
    var files = grunt.file.expandMapping([
      '**/*.json',
    ], Path.join('pa/ai/unit_maps', (ai.directory || ai.file_postfix || '')),
      {cwd: Path.join(basePath, 'unit_maps')})
    files.forEach(function(map) {
      grunt.file.copy(map.src, map.dest)
    })
  }

  grunt.registerTask('ai_unit_map', 'Copy and rename unit maps', function() {
    ais.ais.forEach(function(ai) {
      if (ai.base_path) {
        processMaps(ai.base_path, ai)
      }
      processMaps(ai.path, ai)
    })
  })

  var processPlatoonFile = function(map, ai) {
    var platoons = grunt.file.readJSON(map.src).platoon_templates
    var out = {}
    Object.keys(platoons).forEach(function(name) {
      out[name + ai.rule_postfix] = platoons[name]
    })
    if (Object.keys(out).length > 0) {
      grunt.file.write(map.dest, JSON.stringify({platoon_templates: out}, null, 2))
    }
  }

  var processPlatoons = function(basePath, ai) {
    var files = grunt.file.expandMapping([
      '**/*.json',
    ], Path.join('pa/ai/platoon_templates', (ai.directory || ai.file_postfix || '')),
      {cwd: Path.join(basePath, 'platoon_templates')})
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

  var processBuildFile = function(map, ai) {
    var builds = grunt.file.readJSON(map.src)
    builds.build_list.forEach(function(rule) {
      rule.name = ai.name_prefix + rule.name
      if (/platoon_builds/.test(map.src)){
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
    grunt.file.write(map.dest, JSON.stringify(builds, null, 2))
  }

  var processBuildDir = function(basePath, dir, ai) {
    var files = grunt.file.expandMapping([
      '**/*.json',
    ], Path.join('pa/ai', dir, (ai.directory || ai.file_postfix || '')),
      {cwd: Path.join(basePath, dir)})
    files.forEach(function(path) {processBuildFile(path, ai)})
  }

  var processBuilds = function(basePath, ai) {
    processBuildDir(basePath, '/platoon_builds', ai)
    processBuildDir(basePath, '/fabber_builds', ai)
    processBuildDir(basePath, '/factory_builds', ai)
  }

  grunt.registerTask('builds', 'Rename builds and copy files', function() {
    ais.ais.forEach(function(ai) {
      if (ai.base_path) {
        processBuilds(ai.base_path, ai)
      }
      processBuilds(ai.path, ai)
    })
  })

  var extractPersonalities = function(path) {
    var text = grunt.file.read(path)
    var perString = text.match(/({(\s|\n)*'Normal'(.|\r|\n)*});/m)[1]
    var json = perString.replace(/'/g, '"').replace(/(\w+):/g, '"$1":').replace(/},\r?\n\s+}/, '}}')
    return JSON.parse(json)
  }

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
  ]);
  grunt.registerTask('default', ['build']);

  grunt.registerTask('mod', [
    'copy:modinfo',
    'copy:mod',
  ])
};

