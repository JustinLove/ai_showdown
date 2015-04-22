var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.ai_showdown/'
var stream = 'stable'
var media = require('./lib/path').media(stream)

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
    // copy files from PA, transform, and put into mod
    proc: {
      // form 1: just the relative path, media src is assumed
      adv_comfab: {
        targets: [
          'pa/units/land/fabrication_bot_combat_adv/fabrication_bot_combat_adv.json'
        ],
        process: function(spec) {
          spec.build_metal_cost = 1000
        }
      },
      // form 2: munge one or more specs from PA into one in the mod
      antinuke: {
        src: [
          'pa/units/land/anti_nuke_launcher/anti_nuke_launcher.json',
          'pa/units/land/anti_nuke_launcher/anti_nuke_launcher_ammo.json'
        ],
        cwd: media,
        dest: 'pa/units/land/anti_nuke_launcher/anti_nuke_launcher.json',
        process: function(spec, ammo) {
          spec.factory.default_ammo = [ spec.factory.initial_build_spec ]
          spec.build_metal_cost += ammo.build_metal_cost
          return spec
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerMultiTask('proc', 'Process unit files into the mod', function() {
    if (this.data.targets) {
      var specs = spec.copyPairs(grunt, this.data.targets, media)
      spec.copyUnitFiles(grunt, specs, this.data.process)
    } else {
      var specs = this.filesSrc.map(function(s) {return grunt.file.readJSON(media + s)})
      var out = this.data.process.apply(this, specs)
      grunt.file.write(this.data.dest, JSON.stringify(out, null, 2))
    }
  })

  // Default task(s).
  grunt.registerTask('default', ['proc', 'copy:mod']);

};

