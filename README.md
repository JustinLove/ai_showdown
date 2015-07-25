# AI Showdown

Mashup multiple AI configs so they can be played at the same time.

## Configuration

ais.json file specifies paths and attributes for each AI.  The example configuration assumes there is a valid PA media path, and custom AIs are in `server_mods`.

Tasks which copy or use files from the base game need a path to the media directory.  There are some rough rules that try to guess this path, but the `media` variable may need to be overriden with an explicit path.

Template expansion is performed in `ai_config`, `path`, `base_path`, and `personality_file`.  Principally this would be `<%= media %>` for the game's media path, but it also provides the ai `config` object and the current `ai`

Because default tasks are specialized, AIs must be complete.  If you rely on AI files from the base game, point the `base_path`attribute at the base AI.

If you are not using the default AI, you must take care to prevent interference from un-specialized rules. Either include the default AI and don't use it matches, or ensure that one of the included AIs has a blank `directory` and shadows all default file names.

## Running

### Quick Start

Uses on [Node](https://nodejs.org/) with NPM and the [Grunt](http://gruntjs.com/) task runner, which needs it's command line utility installed with `npm install grunt-cli -g`

- Put this project under a sibling of the `server_mods` directory e.g. `.../Planetary Annihilation/server_mod_dev/ai_showdown`
- Run `npm install`
- Copy `ais.json.example` to `ais.json` and edit for the AIs you want to mashup.
- run `grunt media_check` to see if the default rules guessed your PA path correctly
- If you are using any files from the vanilla AI, run `grunt copy:vanilla`
- `grunt build` (also the default task) will mashup files into the local directory
- `grunt mod` will copy the local files into a runnable server mod.

### Details

`package.json` lists dependencies, but you'll need to run `npm install` to download them.

PA will upload **all files** in the mod directory, including `node_modules` and maybe even `.git` - you probably don't want to use this in `server_mods` directly, unless you really like waiting.  The template is set up run to run as a project within a peer directory of `server_mods` - I use `server_mods_dev/mod_name`.  The task `grunt copy:mod` will copy the mod files to `../../server_mods/identifier`, you can change the `modPath` in the Gruntfile if you want to run it from somewhere else.

### Available Tasks

Example config depends on media directory for vanilla AI files

- `copy:ai_configs` - copy the all `ai_config.json` to separate files
- `copy:ai_config` - copy the specified `ai_config.json`
- `ai_unit_map` - Copy and rename `unit_maps`
- `platoon_templates` - Rename rules and copy files
- `builds` - Rename builds and copy files
- `personalities` - Look for `personality_file`, personality shadows in AI mods, or default ai.js, and build a `new_game` scene mod (requires PAMM to load)
- `build` - above tasks

- `copy:mod` - copy the mod files into `server_mods`
- `copy:modinfo` - rewrite modinfo with AI specifics and put into `server_mods`
- `mod` - above three tasks

- `media_check` - test if the PA media path is correctly configured
- `copy:vanilla` - copy the vanilla AI from media path into ai working directory

- `clean` - remove all copied/generated files.  If a configuration change causes a file to change names names or no longer be generated, the old files must be removed, which clean can do. You must pass the `-f` switch to delete files outside your own directory (e.g. the generated mod)  Please take care that your modPath is correct and will not accidentally resolve to a root path or somewhere uwanted.  The --verbose and --no-write switches are useful for checking, though it does not show the fully resolved path.

- `default`: `build`

## Credits

- [Quitch](http://exodusesports.com/player/quitch/) Developed the [techniques for running multiple AIs](https://forums.uberent.com/threads/performing-ai-battles.68610/)
- [Wondible](https://forums.uberent.com/members/wondible.1965145/) Automated most of the work involved.
