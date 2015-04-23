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
      unittype: 'Bot',
    },
    {
      path: 'ai/quellar',
      rule_postfix: '_Quellar',
      file_postfix: '_Quellar',
      name_prefix: 'Quellar - ',
      unittype: 'Tank',
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

  // Default task(s).
  grunt.registerTask('default', ['proc', 'copy:mod']);

};

