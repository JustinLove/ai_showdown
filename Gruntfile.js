var Path = require('path')
var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.ai_showdown/'
var stream = 'stable'
var media = require('./lib/path').media(stream)

var ais = {
  ais: [
    {
      path: 'ai/vanilla',
      rule_postfix: '_Default',
      file_postfix: '',
      name_prefix: 'Default - ',
      unittype: 'Custom1',
      commander: 'ProgenitorCommander',
    },
    {
      path: 'ai/quellar',
      rule_postfix: '_Quellar',
      file_postfix: '_Quellar',
      name_prefix: 'Quellar - ',
      unittype: 'Custom2',
      commander: 'AlphaCommander',
    },
    {
      path: 'ai/s03g',
      rule_postfix: '_s03g',
      file_postfix: '_s03g',
      name_prefix: 's03g - ',
      unittype: 'Custom3',
      commander: 'ThetaCommander',
    },
  ]
}

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    copy: {
      mod: {
        files: [
          {
            src: [
              'modinfo.json',
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
      vanilla: {
        files: [
          {
            expand: true,
            cwd: media + 'pa/ai/',
            src: '**',
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
    clean: ['pa', 'ai/vanilla', modPath],
    platoons: {},
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('ai_unit_map', '', function() {
    out = {}
    ais.ais.forEach(function(ai) {
      map = grunt.file.readJSON(ai.path + '/ai_unit_map.json').unit_map
      Object.keys(map).forEach(function(name) {
        out[name] = map[name]
      })
    })
    grunt.file.write('pa/ai/ai_unit_map.json',
                     JSON.stringify({unit_map: out}, null, 2))
  })

  grunt.registerTask('platoon_templates', '', function() {
    out = {}
    ais.ais.forEach(function(ai) {
      platoons = grunt.file.readJSON(ai.path + '/platoon_templates.json').platoon_templates
      Object.keys(platoons).forEach(function(name) {
        out[name + ai.rule_postfix] = platoons[name]
      })
    })
    grunt.file.write('pa/ai/platoon_templates.json',
                     JSON.stringify({platoon_templates: out}, null, 2))
  })

  grunt.registerTask('builds', '', function() {
    ais.ais.forEach(function(ai) {
      var files = grunt.file.expand([
        ai.path + '/platoon_builds/*',
        ai.path + '/fabber_builds/*',
        ai.path + '/factory_builds/*',
      ])
      files.forEach(function(path) {
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
      })
    })
  })

  grunt.registerTask('commanders', '', function() {
    var base = grunt.file.readJSON(media + 'pa/units/commanders/base_commander/base_commander.json')
    var commanders = require(media + 'server-script/lobby/commander_table').data
    ais.ais.forEach(function(ai) {
      var specPath = commanders.filter(function(com) {
        return com.ObjectName == ai.commander
      })[0].UnitSpec
      var spec = grunt.file.readJSON(media + specPath)
      spec.unit_types = base.unit_types.concat(['UNITTYPE_' + ai.unittype])
      grunt.file.write('.' + specPath, JSON.stringify(spec, null, 2))
    })
  })

  grunt.registerTask('commander_manager', '', function() {
    var commanders = ais.ais.map(function(ai) { return ai.commander })
    var manager = grunt.file.read(media + 'server-script/lobby/commander_manager.js')
    // implicitly to-end-of-line
    manager = manager.replace(/(var default_commanders = ).*/, "$1" + JSON.stringify(commanders))
    grunt.file.write('server-script/lobby/commander_manager.js', manager)
  })

  grunt.registerTask('build', ['ai_unit_map', 'platoon_templates', 'builds']);
  grunt.registerTask('default', ['build']);

  // notable others: copy:vanilla, copy:mod
};

