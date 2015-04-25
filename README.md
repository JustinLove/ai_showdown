# AI Showdown

Mashup multiple AI configs so they can be played at the same time.

## Configuration

ais.json file specifies paths and attributes for each AI.  The example configuration assumes the copy:vanilla task is run to make a local copy of the base AI, and custom AIs are in server_mods.

Tasks which copy or use files from the base game need a path to the media directory.  There are some rough rules that try to guess this path, but the `media` variable may need to be overriden with an explicit path.

Because default tasks are specialized to the default commander attribute, AIs must be complete.  If you rely on AI files from the base game, point the `base_path`attribute at the base AI.

## Running

`package.json` lists dependencies, but you'll need to run `npm install` to download them.

PA will upload **all files** in the mod directory, including `node_modules` and maybe even `.git` - you probably don't want to use this in `server_mods` directly, unless you really like waiting.  The template is set up run to run as a project within a peer directory of `server_mods` - I use `server_mods_dev/mod_name`.  The task `grunt copy:mod` will copy the mod files to `../../server_mods/identifier`, you can change the `modPath` in the Gruntfile if you want to run it from somewhere else.

### Available Tasks

Example config depends on media directory for vanilla AI, files as well as commanders

- `copy:ai_config` - copy the specified `ai_config.json`
- `ai_unit_map` - Mashup the unit maps
- `platoon_templates` - Rename templates and combine into one file.
- `builds` - Rename builds and copy files
- `commanders` - Add unittype to commanders, requires media path
- `commander_manager` - Write server script file with commander list, requires media path and must be put in place by user
- `build` - above tasks

- `copy:mod` - copy the mod files into `server_mods`
- `copy:modinfo` - rewrite modinfo with AI specifics and put into `server_mods`
- `mod` - above two tasks

- `copy:vanilla` - copy the vanilla AI from media path into ai working directory

- `default`: `build`

## Credits

- [Quitch](http://exodusesports.com/player/quitch/) Developed the [techniques for running multiple AIs](https://forums.uberent.com/threads/performing-ai-battles.68610/)
- [Wondible](https://forums.uberent.com/members/wondible.1965145/) Automated most of the work involved.
